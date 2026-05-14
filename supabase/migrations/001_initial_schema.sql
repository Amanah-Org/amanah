-- ============================================================
-- Amanah — Initial Schema Migration
-- ============================================================
-- Run this in your Supabase SQL Editor or via `supabase db push`
-- ============================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
-- Extends auth.users. Do NOT create a separate users table.

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── ORGANIZATIONS ───────────────────────────────────────────────────────────

create table if not exists public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  owner_id   uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

alter table public.organizations enable row level security;

-- ─── ORGANIZATION MEMBERS ────────────────────────────────────────────────────

create table if not exists public.organization_members (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            text not null default 'viewer'
                    check (role in ('admin', 'collector', 'viewer')),
  status          text not null default 'active'
                    check (status in ('pending', 'active')),
  invited_by      uuid references auth.users(id),
  created_at      timestamptz default now(),
  unique (organization_id, user_id)
);

alter table public.organization_members enable row level security;

-- ─── Helper: get org IDs where current user is a member ──────────────────────

create or replace function public.get_my_org_ids()
returns setof uuid language sql security definer stable
as $$
  select organization_id
  from public.organization_members
  where user_id = auth.uid()
    and status = 'active';
$$;

-- ─── Helper: get role in org ─────────────────────────────────────────────────

create or replace function public.my_org_role(org_id uuid)
returns text language sql security definer stable
as $$
  select role from public.organization_members
  where organization_id = org_id
    and user_id = auth.uid()
    and status = 'active'
  limit 1;
$$;

-- Organizations RLS
create policy "Members can view their organizations"
  on public.organizations for select
  using (id in (select public.get_my_org_ids()));

create policy "Admins can update their organization"
  on public.organizations for update
  using (public.my_org_role(id) = 'admin');

-- Organization members RLS
create policy "Members can view org members"
  on public.organization_members for select
  using (organization_id in (select public.get_my_org_ids()));

create policy "Admins can manage members"
  on public.organization_members for all
  using (public.my_org_role(organization_id) = 'admin');

-- ─── BENEFICIARIES ───────────────────────────────────────────────────────────

create table if not exists public.beneficiaries (
  id                 uuid primary key default gen_random_uuid(),
  organization_id    uuid not null references public.organizations(id) on delete cascade,
  full_name          text not null,
  phone              text,
  national_id        text,
  gender             text check (gender in ('male', 'female', 'other')),
  birth_date         date,
  address            text,
  city               text not null,
  family_size        integer,
  employment_status  text,
  monthly_income     numeric,
  health_conditions  text,
  category           text,
  status             text not null default 'active'
                       check (status in ('active', 'inactive', 'archived')),
  notes              text,
  created_by         uuid references auth.users(id),
  created_at         timestamptz default now(),
  updated_at         timestamptz default now(),
  deleted_at         timestamptz                    -- soft delete
);

-- Fast search indexes
create index if not exists idx_beneficiaries_org
  on public.beneficiaries(organization_id);
create index if not exists idx_beneficiaries_status
  on public.beneficiaries(organization_id, status) where deleted_at is null;
create index if not exists idx_beneficiaries_name_trgm
  on public.beneficiaries using gin(full_name gin_trgm_ops);
create index if not exists idx_beneficiaries_phone_trgm
  on public.beneficiaries using gin(phone gin_trgm_ops);
create index if not exists idx_beneficiaries_national_id
  on public.beneficiaries(national_id) where national_id is not null;

alter table public.beneficiaries enable row level security;

create policy "Members can view org beneficiaries"
  on public.beneficiaries for select
  using (organization_id in (select public.get_my_org_ids())
    and deleted_at is null);

create policy "Admins and collectors can insert beneficiaries"
  on public.beneficiaries for insert
  with check (
    public.my_org_role(organization_id) in ('admin', 'collector')
  );

create policy "Admins and collectors can update beneficiaries"
  on public.beneficiaries for update
  using (
    organization_id in (select public.get_my_org_ids())
    and public.my_org_role(organization_id) in ('admin', 'collector')
  );

create policy "Only admins can delete (soft) beneficiaries"
  on public.beneficiaries for update
  using (public.my_org_role(organization_id) = 'admin');

-- ─── BENEFICIARY NEEDS ───────────────────────────────────────────────────────

create table if not exists public.beneficiary_needs (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations(id) on delete cascade,
  beneficiary_id   uuid not null references public.beneficiaries(id) on delete cascade,
  type             text not null
                     check (type in ('food','medicine','rent','surgery','education','utilities','other')),
  description      text,
  estimated_cost   numeric,
  frequency        text not null
                     check (frequency in ('one_time','weekly','monthly','yearly')),
  urgency          text not null default 'medium'
                     check (urgency in ('low','medium','high','critical')),
  status           text not null default 'active'
                     check (status in ('active','completed','paused')),
  start_date       date,
  end_date         date,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  deleted_at       timestamptz
);

create index if not exists idx_needs_beneficiary
  on public.beneficiary_needs(beneficiary_id) where deleted_at is null;
create index if not exists idx_needs_org_urgency
  on public.beneficiary_needs(organization_id, urgency) where deleted_at is null and status = 'active';

alter table public.beneficiary_needs enable row level security;

create policy "Members can view needs"
  on public.beneficiary_needs for select
  using (organization_id in (select public.get_my_org_ids())
    and deleted_at is null);

create policy "Admins and collectors can manage needs"
  on public.beneficiary_needs for all
  using (
    organization_id in (select public.get_my_org_ids())
    and public.my_org_role(organization_id) in ('admin', 'collector')
  );

-- ─── AID DISTRIBUTIONS ───────────────────────────────────────────────────────

create table if not exists public.aid_distributions (
  id                   uuid primary key default gen_random_uuid(),
  organization_id      uuid not null references public.organizations(id) on delete cascade,
  beneficiary_id       uuid not null references public.beneficiaries(id) on delete cascade,
  need_id              uuid references public.beneficiary_needs(id) on delete set null,
  type                 text not null
                         check (type in ('cash','food_package','medicine','rent_payment','utilities','surgery_support','education_support','other')),
  amount               numeric,
  notes                text,
  proof_attachment_url text,
  distributed_by       uuid references auth.users(id),
  distribution_date    date not null,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now(),
  deleted_at           timestamptz
);

create index if not exists idx_distributions_org
  on public.aid_distributions(organization_id) where deleted_at is null;
create index if not exists idx_distributions_beneficiary
  on public.aid_distributions(beneficiary_id, distribution_date desc) where deleted_at is null;

alter table public.aid_distributions enable row level security;

create policy "Members can view distributions"
  on public.aid_distributions for select
  using (organization_id in (select public.get_my_org_ids())
    and deleted_at is null);

create policy "Admins and collectors can manage distributions"
  on public.aid_distributions for all
  using (
    organization_id in (select public.get_my_org_ids())
    and public.my_org_role(organization_id) in ('admin', 'collector')
  );

-- ─── DONATIONS ───────────────────────────────────────────────────────────────

create table if not exists public.donations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  donor_name      text,
  is_anonymous    boolean not null default false,
  amount          numeric not null,
  currency        text not null default 'USD',
  payment_method  text check (payment_method in ('cash','bank_transfer','wallet','other')),
  notes           text,
  donated_at      timestamptz not null,
  created_by      uuid references auth.users(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  deleted_at      timestamptz
);

create index if not exists idx_donations_org
  on public.donations(organization_id, donated_at desc) where deleted_at is null;

alter table public.donations enable row level security;

create policy "Members can view donations"
  on public.donations for select
  using (organization_id in (select public.get_my_org_ids())
    and deleted_at is null);

create policy "Admins can manage donations"
  on public.donations for all
  using (
    organization_id in (select public.get_my_org_ids())
    and public.my_org_role(organization_id) = 'admin'
  );

-- ─── AUDIT LOGS ──────────────────────────────────────────────────────────────

create table if not exists public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  org_id      uuid references public.organizations(id) on delete cascade,
  action      text not null,
  entity_type text not null,
  entity_id   uuid,
  metadata    jsonb,
  created_at  timestamptz default now()
);

create index if not exists idx_audit_org
  on public.audit_logs(org_id, created_at desc);

alter table public.audit_logs enable row level security;

create policy "Admins can view audit logs"
  on public.audit_logs for select
  using (
    org_id in (select public.get_my_org_ids())
    and public.my_org_role(org_id) = 'admin'
  );

-- System can insert audit logs (used from server/triggers)
create policy "Service role can insert audit logs"
  on public.audit_logs for insert
  with check (true);

-- ─── Automatic updated_at trigger ────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.beneficiaries
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.beneficiary_needs
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.aid_distributions
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.donations
  for each row execute function public.set_updated_at();

-- ─── Public Stats View (for transparency page) ───────────────────────────────

create or replace view public.public_org_stats as
select
  o.id                                                        as org_id,
  o.slug,
  o.name                                                      as org_name,
  count(distinct b.id)                                        as total_families,
  coalesce(sum(d.amount), 0)                                  as total_distributed,
  count(distinct case when ad.type = 'medicine' then ad.id end) as medical_distributions,
  count(distinct case when ad.type = 'food_package' then ad.id end) as food_distributions
from public.organizations o
left join public.beneficiaries b
  on b.organization_id = o.id and b.deleted_at is null
left join public.aid_distributions ad
  on ad.organization_id = o.id and ad.deleted_at is null
left join public.donations d
  on d.organization_id = o.id and d.deleted_at is null
group by o.id, o.slug, o.name;

-- No RLS on this view — it's intentionally public aggregate data

-- ─── GRANTS ──────────────────────────────────────────────────────────────────
-- Explicit grants are required when tables are created via SQL migrations.
-- Supabase only auto-grants when tables are created through the dashboard UI.

grant usage on schema public to anon, authenticated;

grant select                          on public.profiles               to authenticated;
grant update                          on public.profiles               to authenticated;
grant select, insert, update, delete  on public.organizations          to authenticated;
grant select, insert, update, delete  on public.organization_members   to authenticated;
grant select, insert, update, delete  on public.beneficiaries          to authenticated;
grant select, insert, update, delete  on public.beneficiary_needs      to authenticated;
grant select, insert, update, delete  on public.aid_distributions      to authenticated;
grant select, insert, update, delete  on public.donations              to authenticated;
grant select, insert, update, delete  on public.audit_logs             to authenticated;

grant select on public.public_org_stats to anon, authenticated;

grant execute on function public.get_my_org_ids()        to authenticated;
grant execute on function public.my_org_role(uuid)       to authenticated;
grant execute on function public.set_updated_at()        to authenticated;
