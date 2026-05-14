-- ============================================================
-- Amanah — Schema Cleanup & Fixes
-- ============================================================
-- Addresses 6 issues found during schema review:
--   1. Remove duplicate/dead org INSERT policies (org creation is server-side only)
--   2. Allow collectors to record donations
--   3. Add updated_at to organization_members
--   4. Auto-populate distributed_by on aid_distributions
--   5. Auto-transfer org ownership when owner account is deleted
-- ============================================================


-- ─── 1. Remove Dead Org INSERT Policies ──────────────────────────────────────
-- Organization and first-member creation is handled exclusively by
-- server/api/organizations.post.ts using the service role (bypasses RLS).
-- The client-side INSERT policies below were never fully functional
-- (my_org_role() returns NULL at bootstrap time) and were superseded by the
-- server-side approach. Keeping them is misleading.

drop policy if exists "Users can create organizations"
  on public.organizations;

drop policy if exists "Authenticated users can create organizations"
  on public.organizations;

drop policy if exists "Org owners can bootstrap first admin membership"
  on public.organization_members;

drop policy if exists "Users can insert themselves into organizations they own"
  on public.organization_members;


-- ─── 2. Allow Collectors to Record Donations ─────────────────────────────────
-- Collectors work in the field and receive cash donations — they need INSERT.
-- Admins retain full management (update/delete). Viewers remain read-only.

drop policy if exists "Admins can manage donations"
  on public.donations;

create policy "Admins and collectors can insert donations"
  on public.donations for insert
  with check (
    organization_id in (select public.get_my_org_ids())
    and public.my_org_role(organization_id) in ('admin', 'collector')
  );

create policy "Admins can update and delete donations"
  on public.donations for update
  using (
    organization_id in (select public.get_my_org_ids())
    and public.my_org_role(organization_id) = 'admin'
  );

create policy "Admins can delete donations"
  on public.donations for delete
  using (
    organization_id in (select public.get_my_org_ids())
    and public.my_org_role(organization_id) = 'admin'
  );


-- ─── 3. Add updated_at to organization_members ───────────────────────────────
-- Role and status changes (e.g. viewer → collector, pending → active) now
-- get a reliable timestamp without having to query audit_logs.

alter table public.organization_members
  add column if not exists updated_at timestamptz default now();

create trigger set_updated_at
  before update on public.organization_members
  for each row execute function public.set_updated_at();


-- ─── 4. Auto-populate distributed_by on aid_distributions ────────────────────
-- Ensures distributed_by is always the authenticated user who created the row,
-- even if the caller forgets to pass it. Server-side inserts that already
-- set distributed_by are not overridden.

create or replace function public.set_distributed_by()
returns trigger language plpgsql as $$
begin
  if new.distributed_by is null then
    new.distributed_by := auth.uid();
  end if;
  return new;
end;
$$;

create trigger set_distributed_by
  before insert on public.aid_distributions
  for each row execute function public.set_distributed_by();

grant execute on function public.set_distributed_by() to authenticated;


-- ─── 5. Auto-transfer Org Ownership on Account Deletion ──────────────────────
-- organizations.owner_id is ON DELETE SET NULL, so deleting an auth.users row
-- orphans the org. This BEFORE UPDATE trigger intercepts the NULL assignment
-- and transfers ownership to the next-oldest active admin in the org.
-- If no other admin exists, owner_id is left NULL (org is de facto frozen
-- until an admin is promoted via the server API).

create or replace function public.handle_org_owner_nulled()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.owner_id is null and old.owner_id is not null then
    new.owner_id := (
      select user_id
      from public.organization_members
      where organization_id = new.id
        and role = 'admin'
        and status = 'active'
        and user_id != old.owner_id
      order by created_at
      limit 1
    );
  end if;
  return new;
end;
$$;

create trigger on_org_owner_nulled
  before update of owner_id on public.organizations
  for each row execute function public.handle_org_owner_nulled();

grant execute on function public.handle_org_owner_nulled() to authenticated;
