import type { H3Event } from "h3";
import type { OrgRole } from "@amanah/types";
import { serverSupabaseUser } from "#supabase/server";

/**
 * Resolves the calling user and verifies they are an active member of `orgId`
 * with one of `roles` (any role when omitted). Throws 401/403 otherwise.
 */
export async function requireOrgMember(event: H3Event, orgId: string, roles?: OrgRole[]) {
  // serverSupabaseUser throws a generic 500 when there is no/expired session.
  const user = await serverSupabaseUser(event).catch(() => null);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }

  const admin = useSupabaseAdmin();
  const { data: member } = await admin
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("organization_id", orgId)
    .eq("status", "active")
    .maybeSingle();

  if (!member || (roles && !roles.includes(member.role as OrgRole))) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  return { user, role: member.role as OrgRole, admin };
}

export async function writeAuditLog(entry: {
  userId: string;
  orgId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  await useSupabaseAdmin().from("audit_logs").insert({
    user_id: entry.userId,
    org_id: entry.orgId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    metadata: entry.metadata ?? null,
  });
}
