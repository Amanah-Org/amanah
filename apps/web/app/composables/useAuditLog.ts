export function useAuditLog() {
  const orgStore = useOrgStore();
  const outbox = useOutboxStore();

  async function logAction(action: string, entityType: string, entityId?: string, metadata?: Record<string, unknown>) {
    if (!orgStore.currentOrgId) return;
    // Writes go server-side so user_id and org_id cannot be forged client-side.
    // Queued like any other write when offline, so the trail stays complete.
    await outbox.run(
      { kind: "audit", body: { action, entityType, orgId: orgStore.currentOrgId, entityId, metadata } },
      action,
    );
  }

  return { logAction };
}
