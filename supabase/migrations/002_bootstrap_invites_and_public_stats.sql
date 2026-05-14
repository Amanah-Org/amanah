-- ============================================================
-- Amanah — Bootstrap, Invites, and Public Stats Fixes
-- ============================================================

-- Allow authenticated users to create organizations they own.
create policy "Users can create organizations"
  on public.organizations for insert
  with check (
    auth.uid() is not null
    and owner_id = auth.uid()
  );

-- Allow organization creators to bootstrap their own admin membership row.
create policy "Org owners can bootstrap first admin membership"
  on public.organization_members for insert
  with check (
    user_id = auth.uid()
    and role = 'admin'
    and status = 'active'
    and exists (
      select 1
      from public.organizations o
      where o.id = organization_id
        and o.owner_id = auth.uid()
    )
  );

-- Allow invited users to accept their own pending invites securely via RPC.
create or replace function public.accept_org_invite(p_org_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.organization_members
  set status = 'active'
  where organization_id = p_org_id
    and user_id = auth.uid()
    and status = 'pending';
end;
$$;

grant execute on function public.accept_org_invite(uuid) to authenticated;

-- Recreate public stats view with isolated aggregates to avoid row multiplication.
create or replace view public.public_org_stats as
with b as (
  select
    organization_id,
    count(distinct id) as total_families
  from public.beneficiaries
  where deleted_at is null
  group by organization_id
),
d as (
  select
    organization_id,
    coalesce(sum(amount), 0) as total_distributed
  from public.aid_distributions
  where deleted_at is null
  group by organization_id
),
ad as (
  select
    organization_id,
    count(distinct case when type = 'medicine' then id end) as medical_distributions,
    count(distinct case when type = 'food_package' then id end) as food_distributions
  from public.aid_distributions
  where deleted_at is null
  group by organization_id
)
select
  o.id as org_id,
  o.slug,
  o.name as org_name,
  coalesce(b.total_families, 0) as total_families,
  coalesce(d.total_distributed, 0) as total_distributed,
  coalesce(ad.medical_distributions, 0) as medical_distributions,
  coalesce(ad.food_distributions, 0) as food_distributions
from public.organizations o
left join b on b.organization_id = o.id
left join d on d.organization_id = o.id
left join ad on ad.organization_id = o.id;

grant select on public.public_org_stats to anon, authenticated;
