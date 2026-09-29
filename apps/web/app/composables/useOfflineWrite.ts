import type { WriteResult } from "~/stores/outbox";

/**
 * Inserts/updates that survive a dropped connection (see stores/outbox.ts).
 * Inserts must include a client-generated `id` (crypto.randomUUID()).
 */
export function useOfflineWrite() {
  const outbox = useOutboxStore();
  const toast = useToast();
  const { t } = useI18n();

  return {
    insert: (table: string, row: Record<string, unknown> & { id: string }, label: string) =>
      outbox.run({ kind: "insert", table, row }, label),

    update: (table: string, id: string, values: Record<string, unknown>, label: string) =>
      outbox.run({ kind: "update", table, id, values }, label),

    /** Toast for a successful write: "Saved" now, or "saved on this device" when queued. */
    confirm(result: WriteResult, savedMessage: string) {
      if (!result.ok) return;
      if (result.queued) toast.info(t("offline.savedOnDevice"));
      else toast.success(savedMessage);
    },
  };
}
