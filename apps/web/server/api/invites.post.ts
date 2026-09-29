import type { OrgRole } from "@amanah/types";

const ROLES: OrgRole[] = ["admin", "collector", "viewer"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Admin-only: invite a user to the organization by email.
 * - Existing account → a pending membership they accept at /invite/accept.
 * - New email → Supabase sends an invite email linking to /invite/accept,
 *   where they set a password and accept.
 */
export default defineEventHandler(async (event) => {
  const { orgId, email: rawEmail, role } = await readBody<{ orgId: string; email: string; role: OrgRole }>(event);
  const email = rawEmail?.trim().toLowerCase();

  if (!orgId || !email || !EMAIL_RE.test(email) || !ROLES.includes(role)) {
    throw createError({ statusCode: 400, statusMessage: "A valid email and role are required" });
  }

  const { user, admin } = await requireOrgMember(event, orgId, ["admin"]);

  let inviteeId: string | null = null;
  const { data: existingId, error: lookupErr } = await admin.rpc("get_user_id_by_email", { p_email: email });
  if (lookupErr) {
    throw createError({ statusCode: 500, statusMessage: lookupErr.message });
  }
  inviteeId = existingId as string | null;

  let emailSent = false;
  if (!inviteeId) {
    const redirectTo = `${getRequestURL(event).origin}/invite/accept`;
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
    if (error || !data.user) {
      throw createError({ statusCode: 502, statusMessage: error?.message ?? "Could not send invite" });
    }
    inviteeId = data.user.id;
    emailSent = true;
  }

  const { data: membership } = await admin
    .from("organization_members")
    .select("id, status")
    .eq("organization_id", orgId)
    .eq("user_id", inviteeId)
    .maybeSingle();

  if (membership) {
    throw createError({
      statusCode: 409,
      statusMessage: membership.status === "active" ? "already_member" : "already_invited",
    });
  }

  const { data: member, error: insertErr } = await admin
    .from("organization_members")
    .insert({ organization_id: orgId, user_id: inviteeId, role, status: "pending", invited_by: user.id })
    .select("id")
    .single();

  if (insertErr) {
    throw createError({ statusCode: 500, statusMessage: insertErr.message });
  }

  await writeAuditLog({
    userId: user.id,
    orgId,
    action: "member_invited",
    entityType: "organization_member",
    entityId: member.id,
    metadata: { email, role, new_account: emailSent },
  });

  return { id: member.id, emailSent };
});
