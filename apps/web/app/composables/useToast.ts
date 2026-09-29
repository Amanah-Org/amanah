export type ToastTone = "success" | "info" | "error";

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

let nextId = 1;

/** Short, auto-dismissing confirmations ("Distribution saved"). Rendered by <AppToaster /> in app.vue. */
export function useToast() {
  const toasts = useState<Toast[]>("toasts", () => []);

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function show(message: string, tone: ToastTone = "success", durationMs = 3500) {
    if (import.meta.server) return;
    const id = nextId++;
    toasts.value = [...toasts.value.slice(-2), { id, message, tone }];
    setTimeout(() => dismiss(id), durationMs);
  }

  return {
    toasts,
    dismiss,
    success: (message: string) => show(message, "success"),
    info: (message: string) => show(message, "info", 5000),
    error: (message: string) => show(message, "error", 6000),
  };
}
