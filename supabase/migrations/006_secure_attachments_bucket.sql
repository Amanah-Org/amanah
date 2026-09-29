-- ============================================================
-- Amanah — Secure Attachments Storage Bucket
-- ============================================================
-- Fixes:
--   1. Bucket was public: true — files were world-readable without auth.
--   2. Storage INSERT/SELECT policies had no path scoping — any
--      authenticated user could read/write any org's files.
-- ============================================================

-- Make the bucket private so Supabase CDN enforces auth on every read.
-- Files are now served only via short-lived signed URLs.
update storage.buckets
set public = false
where id = 'attachments';

-- Drop the old permissive policies.
drop policy if exists "Authenticated can upload attachment objects" on storage.objects;
drop policy if exists "Authenticated can read attachment objects"   on storage.objects;

-- INSERT: user may only upload into a path whose first segment is one
-- of their own organization IDs.
-- get_my_org_ids() returns setof uuid; alias the column explicitly so the
-- cast to text compiles cleanly.
create policy "Users can upload to their own org path"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] in (
      select org_id::text from public.get_my_org_ids() as t(org_id)
    )
  );

-- SELECT: user may only read objects whose first path segment matches
-- one of their own organization IDs.  Required so that createSignedUrl()
-- succeeds from the client SDK.
create policy "Users can read their own org attachments"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] in (
      select org_id::text from public.get_my_org_ids() as t(org_id)
    )
  );
