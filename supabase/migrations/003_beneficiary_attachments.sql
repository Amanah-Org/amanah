-- ============================================================
-- Amanah — Beneficiary Attachments
-- ============================================================

create table if not exists public.beneficiary_attachments (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  beneficiary_id  uuid not null references public.beneficiaries(id) on delete cascade,
  file_name       text not null,
  file_type       text not null,
  file_size       bigint not null,
  file_url        text not null,
  uploaded_by     uuid references auth.users(id),
  created_at      timestamptz default now(),
  deleted_at      timestamptz
);

create index if not exists idx_beneficiary_attachments_org
  on public.beneficiary_attachments(organization_id) where deleted_at is null;
create index if not exists idx_beneficiary_attachments_beneficiary
  on public.beneficiary_attachments(beneficiary_id, created_at desc) where deleted_at is null;

alter table public.beneficiary_attachments enable row level security;

create policy "Members can view beneficiary attachments"
  on public.beneficiary_attachments for select
  using (
    organization_id in (select public.get_my_org_ids())
    and deleted_at is null
  );

create policy "Admins and collectors can manage beneficiary attachments"
  on public.beneficiary_attachments for all
  using (
    organization_id in (select public.get_my_org_ids())
    and public.my_org_role(organization_id) in ('admin', 'collector')
  );

-- Storage bucket for uploaded documents and proofs.
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', true)
on conflict (id) do nothing;

create policy "Authenticated can upload attachment objects"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'attachments');

create policy "Authenticated can read attachment objects"
  on storage.objects for select to authenticated
  using (bucket_id = 'attachments');

grant select, insert, update, delete on public.beneficiary_attachments to authenticated;
