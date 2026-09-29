-- ============================================================
-- Amanah — Business Rules & MVP Gaps
-- ============================================================
--   1. Sortable urgency (text ordering put "medium" above "critical")
--   2. Only admins may soft-delete beneficiaries (PRD §5.2 / §11)
--   3. Timestamped operational notes per beneficiary (PRD §14.5 Tab 5)
--   4. Need schedule view: last distribution + next due date per need
--      (PRD Goal 4: avoid duplicate or forgotten support)
--   5. Org summary RPC: server-side totals (client-side sums were capped
--      by PostgREST's 1000-row limit)
--   6. Member invites: service-role lookup of users by email
--   7. The org owner's admin membership cannot be removed or demoted
--   8. organization_members → profiles FK so member names can be embedded
--   9. Invitees can see their own pending invitation (and the org's name)
--  10. Blank beneficiary names/cities rejected
--  11. Admin soft-delete of distributions and donations (correcting mistakes)
--  12. Possible-duplicate lookup when registering beneficiaries
--  13. Only admins may edit distributions (collectors record them)
-- ============================================================


-- ─── 1. Sortable urgency ─────────────────────────────────────────────────────

alter table public.beneficiary_needs
  add column if not exists urgency_rank smallint
  generated always as (
    case urgency when 'critical' then 4 when 'high' then 3 when 'medium' then 2 else 1 end
  ) stored;


-- ─── 2. Only admins may soft-delete beneficiaries ────────────────────────────
-- Permissive UPDATE policies are OR'd, so the old "Only admins can delete"
-- policy never restricted anything: collectors could set deleted_at through
-- the collector UPDATE policy. A trigger enforces the rule instead.

drop policy if exists "Only admins can delete (soft) beneficiaries" on public.beneficiaries;

create or replace function public.guard_beneficiary_soft_delete()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.deleted_at is distinct from old.deleted_at
     and auth.uid() is not null  -- end-user requests only; service role / SQL bypass
     and coalesce(public.my_org_role(old.organization_id), '') <> 'admin' then
    raise exception 'Only organization admins can delete or restore beneficiaries'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_beneficiary_soft_delete on public.beneficiaries;
create trigger guard_beneficiary_soft_delete
  before update of deleted_at on public.beneficiaries
  for each row execute function public.guard_beneficiary_soft_delete();

-- Soft delete goes through an RPC: a plain UPDATE that sets deleted_at fails
-- because the new row no longer satisfies the SELECT policy (deleted_at is null).
create or replace function public.soft_delete_beneficiary(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_org uuid;
begin
  select organization_id into v_org
  from public.beneficiaries
  where id = p_id and deleted_at is null;

  if v_org is null or coalesce(public.my_org_role(v_org), '') <> 'admin' then
    raise exception 'Only organization admins can delete beneficiaries'
      using errcode = '42501';
  end if;

  update public.beneficiaries set deleted_at = now() where id = p_id;
end;
$$;

revoke execute on function public.soft_delete_beneficiary(uuid) from public, anon;
grant execute on function public.soft_delete_beneficiary(uuid) to authenticated;


-- ─── 3. Beneficiary notes ────────────────────────────────────────────────────

create table if not exists public.beneficiary_notes (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  beneficiary_id  uuid not null references public.beneficiaries(id) on delete cascade,
  body            text not null check (length(trim(body)) > 0),
  created_by      uuid references auth.users(id) on delete set null default auth.uid(),
  created_at      timestamptz not null default now()
);

create index if not exists idx_beneficiary_notes_beneficiary
  on public.beneficiary_notes(beneficiary_id, created_at desc);

alter table public.beneficiary_notes enable row level security;

create policy "Members can view notes"
  on public.beneficiary_notes for select
  using (organization_id in (select public.get_my_org_ids()));

create policy "Admins and collectors can add notes"
  on public.beneficiary_notes for insert
  with check (
    public.my_org_role(organization_id) in ('admin', 'collector')
    and created_by = auth.uid()
    and exists (
      select 1 from public.beneficiaries b
      where b.id = beneficiary_id and b.organization_id = beneficiary_notes.organization_id
    )
  );

create policy "Authors and admins can delete notes"
  on public.beneficiary_notes for delete
  using (
    created_by = auth.uid()
    or public.my_org_role(organization_id) = 'admin'
  );

grant select, insert, delete on public.beneficiary_notes to authenticated;


-- ─── 4. Need schedule view ───────────────────────────────────────────────────
-- security_invoker makes the view respect the caller's RLS.

create or replace view public.need_schedule
with (security_invoker = true) as
select
  n.id,
  n.organization_id,
  n.beneficiary_id,
  n.type,
  n.frequency,
  n.urgency,
  n.urgency_rank,
  n.status,
  n.estimated_cost,
  n.description,
  n.start_date,
  ld.last_distribution_date,
  case
    when n.status <> 'active' then null
    when n.frequency = 'one_time' then
      case when ld.last_distribution_date is null
        then coalesce(n.start_date, n.created_at::date) end
    when ld.last_distribution_date is null then coalesce(n.start_date, n.created_at::date)
    when n.frequency = 'weekly'  then ld.last_distribution_date + 7
    when n.frequency = 'monthly' then (ld.last_distribution_date + interval '1 month')::date
    when n.frequency = 'yearly'  then (ld.last_distribution_date + interval '1 year')::date
  end as next_due_date,
  n.end_date
from public.beneficiary_needs n
-- Needs of soft-deleted beneficiaries must not surface as due.
join public.beneficiaries b on b.id = n.beneficiary_id and b.deleted_at is null
left join lateral (
  select max(d.distribution_date) as last_distribution_date
  from public.aid_distributions d
  where d.need_id = n.id and d.deleted_at is null
) ld on true
where n.deleted_at is null;

grant select on public.need_schedule to authenticated;

create index if not exists idx_distributions_need
  on public.aid_distributions(need_id, distribution_date desc)
  where deleted_at is null and need_id is not null;


-- ─── 5. Org summary RPC ──────────────────────────────────────────────────────
-- security invoker (default): RLS scopes every count to the caller's orgs.

create or replace function public.org_summary(p_org_id uuid)
returns table (
  total_beneficiaries   bigint,
  active_beneficiaries  bigint,
  active_needs          bigint,
  recurring_needs       bigint,
  urgent_needs          bigint,
  total_donations       numeric,
  total_distributed     numeric,
  distributions_this_month bigint
)
language sql stable set search_path = public as $$
  with live_needs as (
    select n.frequency, n.urgency
    from beneficiary_needs n
    join beneficiaries b on b.id = n.beneficiary_id and b.deleted_at is null
    where n.organization_id = p_org_id and n.deleted_at is null and n.status = 'active'
  )
  select
    (select count(*) from beneficiaries where organization_id = p_org_id and deleted_at is null),
    (select count(*) from beneficiaries where organization_id = p_org_id and deleted_at is null and status = 'active'),
    (select count(*) from live_needs),
    (select count(*) from live_needs where frequency <> 'one_time'),
    (select count(*) from live_needs where urgency in ('high', 'critical')),
    (select coalesce(sum(amount), 0) from donations where organization_id = p_org_id and deleted_at is null),
    (select coalesce(sum(amount), 0) from aid_distributions where organization_id = p_org_id and deleted_at is null),
    (select count(*) from aid_distributions where organization_id = p_org_id and deleted_at is null
       and distribution_date >= date_trunc('month', current_date)::date);
$$;

revoke execute on function public.org_summary(uuid) from public, anon;
grant execute on function public.org_summary(uuid) to authenticated;


-- ─── 6. Member invites: look up users by email (service role only) ───────────

create or replace function public.get_user_id_by_email(p_email text)
returns uuid language sql stable security definer set search_path = auth, public as $$
  select id from auth.users where lower(email) = lower(trim(p_email)) limit 1;
$$;

revoke execute on function public.get_user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.get_user_id_by_email(text) to service_role;

-- Members list shows emails to admins, so expose them through a guarded RPC
-- instead of opening up auth.users.
create or replace function public.org_member_emails(p_org_id uuid)
returns table (user_id uuid, email text)
language sql stable security definer set search_path = auth, public as $$
  select m.user_id, u.email::text
  from public.organization_members m
  join auth.users u on u.id = m.user_id
  where m.organization_id = p_org_id
    and public.my_org_role(p_org_id) = 'admin';
$$;

revoke execute on function public.org_member_emails(uuid) from public, anon;
grant execute on function public.org_member_emails(uuid) to authenticated;

-- organization_members.user_id pointed only at auth.users, so PostgREST could
-- not embed profiles (the Settings members query failed and listed nobody).
-- profiles.id always equals auth.users.id (on_auth_user_created trigger).
alter table public.organization_members
  add constraint organization_members_user_profile_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

-- Members need to see each other's names; profiles were self-only.
create policy "Members can view profiles of co-members"
  on public.profiles for select
  using (
    id in (
      select user_id from public.organization_members
      where organization_id in (select public.get_my_org_ids())
    )
  );


-- ─── 7. Protect the org owner's admin membership ─────────────────────────────

create or replace function public.guard_owner_membership()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_owner uuid;
begin
  -- End-user requests only: service role, SQL and FK cascades bypass.
  if auth.uid() is null then
    return coalesce(new, old);
  end if;

  select owner_id into v_owner from public.organizations where id = old.organization_id;

  if old.user_id = v_owner and (tg_op = 'DELETE' or new.role <> 'admin' or new.status <> 'active') then
    raise exception 'The organization owner must remain an active admin'
      using errcode = '42501';
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists guard_owner_membership on public.organization_members;
create trigger guard_owner_membership
  before update or delete on public.organization_members
  for each row execute function public.guard_owner_membership();


-- ─── 9. Invitees can see their own pending invitations ───────────────────────
-- Both SELECT policies required an *active* membership, so a pending invitee
-- could never see the invite they were supposed to accept.

create policy "Users can view their own memberships"
  on public.organization_members for select
  using (user_id = auth.uid());

create policy "Invitees can view organizations that invited them"
  on public.organizations for select
  using (
    id in (select organization_id from public.organization_members where user_id = auth.uid())
  );


-- ─── 10. No blank names / cities ─────────────────────────────────────────────
-- NOT NULL alone accepted '' (e.g. a name of only spaces, trimmed client-side).
-- NOT VALID: enforced for new/updated rows without failing on legacy data.

alter table public.beneficiaries
  add constraint beneficiaries_full_name_not_blank check (length(trim(full_name)) > 0) not valid,
  add constraint beneficiaries_city_not_blank check (length(trim(city)) > 0) not valid;


-- ─── 11. Admin soft-delete of distributions and donations ────────────────────
-- Same RLS constraint as beneficiaries: the SELECT policy hides deleted rows,
-- so setting deleted_at must go through a definer function.

create or replace function public.soft_delete_distribution(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_org uuid;
begin
  select organization_id into v_org from public.aid_distributions where id = p_id and deleted_at is null;
  if v_org is null or coalesce(public.my_org_role(v_org), '') <> 'admin' then
    raise exception 'Only organization admins can delete distributions' using errcode = '42501';
  end if;
  update public.aid_distributions set deleted_at = now() where id = p_id;
end;
$$;

create or replace function public.soft_delete_donation(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_org uuid;
begin
  select organization_id into v_org from public.donations where id = p_id and deleted_at is null;
  if v_org is null or coalesce(public.my_org_role(v_org), '') <> 'admin' then
    raise exception 'Only organization admins can delete donations' using errcode = '42501';
  end if;
  update public.donations set deleted_at = now() where id = p_id;
end;
$$;

revoke execute on function public.soft_delete_distribution(uuid) from public, anon;
revoke execute on function public.soft_delete_donation(uuid) from public, anon;
grant execute on function public.soft_delete_distribution(uuid) to authenticated;
grant execute on function public.soft_delete_donation(uuid) to authenticated;


-- ─── 12. Possible duplicate beneficiaries ────────────────────────────────────
-- Same national ID, or same phone compared on its last 9 digits so
-- "+20 100 555 1212" matches "01005551212". Security invoker: RLS scopes it.

create or replace function public.find_possible_duplicates(
  p_org_id uuid,
  p_phone text,
  p_national_id text,
  p_exclude uuid default null
)
returns table (id uuid, full_name text, city text, phone text, national_id text, match text)
language sql stable set search_path = public as $$
  select b.id, b.full_name, b.city, b.phone, b.national_id,
         case when nullif(trim(p_national_id), '') is not null
                   and b.national_id = trim(p_national_id) then 'national_id' else 'phone' end
  from beneficiaries b
  where b.organization_id = p_org_id
    and b.deleted_at is null
    and (p_exclude is null or b.id <> p_exclude)
    and (
      (nullif(trim(p_national_id), '') is not null and b.national_id = trim(p_national_id))
      or (
        length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) >= 7
        and right(regexp_replace(b.phone, '\D', '', 'g'), 9) = right(regexp_replace(p_phone, '\D', '', 'g'), 9)
      )
    )
  limit 5;
$$;

revoke execute on function public.find_possible_duplicates(uuid, text, text, uuid) from public, anon;
grant execute on function public.find_possible_duplicates(uuid, text, text, uuid) to authenticated;


-- ─── 13. Only admins may edit distributions ──────────────────────────────────
-- PRD §5.2/§11: collectors record distributions; admins manage them. The old
-- FOR ALL policy let collectors rewrite amounts after the fact.

drop policy if exists "Admins and collectors can manage distributions" on public.aid_distributions;

create policy "Admins and collectors can record distributions"
  on public.aid_distributions for insert
  with check (
    organization_id in (select public.get_my_org_ids())
    and public.my_org_role(organization_id) in ('admin', 'collector')
  );

create policy "Admins can edit distributions"
  on public.aid_distributions for update
  using (
    organization_id in (select public.get_my_org_ids())
    and public.my_org_role(organization_id) = 'admin'
  );
