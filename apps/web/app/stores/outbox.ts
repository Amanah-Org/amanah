import { defineStore } from "pinia";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Offline outbox: writes made while the connection is down (or flaky) are kept
 * on this device and replayed in order once it's back.
 *
 * Inserts carry client-generated ids, so replaying one that already reached the
 * server is harmless (primary-key conflict = already synced), and later
 * operations can reference rows created offline.
 */

export type OutboxOp =
  | { kind: "insert"; table: string; row: Record<string, unknown> }
  | { kind: "update"; table: string; id: string; values: Record<string, unknown> }
  | { kind: "audit"; body: Record<string, unknown> };

export interface QueuedOp {
  id: string;
  op: OutboxOp;
  /** Human-readable description shown in the sync panel. */
  label: string;
  queuedAt: string;
  error?: string;
}

export type WriteResult = { ok: true; queued: boolean } | { ok: false; error: string };

const STORAGE_PREFIX = "amanah_outbox:";

// Not reactive state: set once by plugins/outbox.client.ts.
let client: SupabaseClient | null = null;
let storageKey: string | null = null;
let onSynced: ((count: number) => void) | null = null;

/** Connection problems and server hiccups are worth retrying; anything else is a real rejection. */
const isTransient = (status: number) => status === 0 || status === 408 || status === 429 || status >= 500;

async function execute(op: OutboxOp): Promise<{ transient: boolean; error?: string }> {
  if (op.kind === "audit") {
    try {
      await $fetch("/api/audit-log", { method: "POST", body: op.body });
      return { transient: false };
    } catch (err) {
      const status = (err as { response?: { status: number } }).response?.status ?? 0;
      return { transient: isTransient(status), error: (err as Error).message };
    }
  }

  if (!client) return { transient: true };
  const res =
    op.kind === "insert"
      ? await client.from(op.table).insert(op.row)
      : await client.from(op.table).update(op.values).eq("id", op.id);

  if (!res.error) return { transient: false };
  if (isTransient(res.status)) return { transient: true };
  // Replayed insert that had already been stored before the connection dropped.
  if (op.kind === "insert" && res.error.code === "23505" && res.error.message.includes("_pkey")) {
    return { transient: false };
  }
  return { transient: false, error: res.error.message };
}

export const useOutboxStore = defineStore("outbox", {
  state: () => ({
    queue: [] as QueuedOp[],
    online: true,
    syncing: false,
  }),

  getters: {
    /** Anything left to replay (including audit entries). */
    hasPending: (state) => state.queue.some((q) => !q.error),
    /** What the user recorded; audit entries ride along silently. */
    pendingCount: (state) => state.queue.filter((q) => !q.error && q.op.kind !== "audit").length,
    failed: (state) => state.queue.filter((q) => q.error),
  },

  actions: {
    init(supabase: SupabaseClient, userId: string | null, synced: (count: number) => void) {
      client = supabase;
      onSynced = synced;
      storageKey = userId ? STORAGE_PREFIX + userId : null;
      this.online = navigator.onLine;
      try {
        this.queue = storageKey ? JSON.parse(localStorage.getItem(storageKey) ?? "[]") : [];
      } catch {
        this.queue = [];
      }
    },

    persist() {
      if (!storageKey) return;
      try {
        if (this.queue.length) localStorage.setItem(storageKey, JSON.stringify(this.queue));
        else localStorage.removeItem(storageKey);
      } catch {
        // Storage full or blocked: the queue still lives in memory for this session.
      }
    },

    enqueue(op: OutboxOp, label: string) {
      this.queue.push({ id: crypto.randomUUID(), op, label, queuedAt: new Date().toISOString() });
      this.persist();
    },

    /** Write now if possible, otherwise keep it for later. */
    async run(op: OutboxOp, label: string): Promise<WriteResult> {
      // Earlier offline writes go first so references (e.g. a need on a new beneficiary) resolve.
      if (this.online && this.hasPending) await this.flush();

      if (this.online && !this.hasPending) {
        const result = await execute(op);
        if (!result.transient) return result.error ? { ok: false, error: result.error } : { ok: true, queued: false };
      }
      this.enqueue(op, label);
      return { ok: true, queued: true };
    },

    /** Replay queued writes in order. Stops at the first connection problem. */
    async flush(includeFailed = false) {
      if (this.syncing || !this.queue.length || !this.online) return;
      this.syncing = true;
      let synced = 0;
      try {
        for (const item of [...this.queue]) {
          if (item.error && !includeFailed) continue;
          const result = await execute(item.op);
          if (result.transient) break;
          if (result.error && item.op.kind !== "audit") {
            item.error = result.error;
            continue;
          }
          // Synced (or an audit entry the server refused, which isn't worth keeping).
          this.queue = this.queue.filter((q) => q.id !== item.id);
          if (item.op.kind !== "audit") synced++;
        }
      } finally {
        this.syncing = false;
        this.persist();
      }
      if (synced) onSynced?.(synced);
    },

    discard(id: string) {
      this.queue = this.queue.filter((q) => q.id !== id);
      this.persist();
    },

    /** Queued inserts into `table` matching `filter` — to show "waiting to sync" rows in lists. */
    pendingInserts(table: string, filter: (row: Record<string, unknown>) => boolean) {
      return this.queue
        .filter((q) => q.op.kind === "insert" && q.op.table === table && !q.error)
        .map((q) => (q.op as Extract<OutboxOp, { kind: "insert" }>).row)
        .filter(filter);
    },
  },
});
