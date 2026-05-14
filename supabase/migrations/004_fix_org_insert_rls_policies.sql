-- Allow authenticated users to create a new organization (they become owner)
create policy "Authenticated users can create organizations"
  on public.organizations for insert
  with check (auth.uid() = owner_id);

-- Allow a user to insert themselves as the first member of an org they own
-- (bootstrap: no existing membership exists yet at this point)
create policy "Users can insert themselves into organizations they own"
  on public.organization_members for insert
  with check (
    user_id = auth.uid()
    and (
      -- first-time self-join on own org
      exists (select 1 from public.organizations where id = organization_id and owner_id = auth.uid())
      -- or an admin is inviting via server-side (service role bypasses RLS)
    )
  );
