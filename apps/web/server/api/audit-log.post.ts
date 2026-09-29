export default defineEventHandler(async (event) => {
  const { action, entityType, entityId, orgId, metadata } = await readBody<{
    action: string;
    entityType: string;
    entityId?: string;
    orgId: string;
    metadata?: Record<string, unknown>;
  }>(event);

  if (!action?.trim() || !entityType?.trim() || !orgId?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Missing required fields" });
  }

  // Verify the caller is an active member of the claimed org before writing.
  const { user } = await requireOrgMember(event, orgId);

  await writeAuditLog({ userId: user.id, orgId, action, entityType, entityId, metadata });

  return { ok: true };
});
