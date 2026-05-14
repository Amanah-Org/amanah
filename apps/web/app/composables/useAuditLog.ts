export function useAuditLog() {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const orgStore = useOrgStore();

  async function logAction(action: string, entityType: string, entityId?: string, metadata?: Record<string, unknown>) {
    if (!orgStore.currentOrgId || !user.value) return;
    await supabase.from("audit_logs").insert({
      user_id: user.value.id,
      org_id: orgStore.currentOrgId,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      metadata: metadata ?? null,
    });
  }

  return { logAction };
}
