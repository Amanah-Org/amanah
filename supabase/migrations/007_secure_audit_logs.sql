-- ============================================================
-- Amanah — Secure Audit Log Writes
-- ============================================================
-- Fix: The INSERT policy on audit_logs used `with check (true)`,
-- which allowed any authenticated user to insert rows with arbitrary
-- user_id / org_id values, enabling audit trail forgery.
--
-- All audit log writes now go through the server-side Nitro handler
-- (server/api/audit-log.post.ts) which uses the service-role client.
-- The service role bypasses RLS entirely, so no INSERT policy is needed.
-- ============================================================

-- Revoke the direct INSERT privilege from regular authenticated users.
revoke insert on public.audit_logs from authenticated;

-- Drop the permissive policy (it was only reached by the authenticated
-- role anyway — the service role never hits RLS).
drop policy if exists "Service role can insert audit logs" on public.audit_logs;
