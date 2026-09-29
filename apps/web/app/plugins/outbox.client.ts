export default defineNuxtPlugin((nuxtApp) => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const outbox = useOutboxStore()
  const toast = useToast()
  // Plugin context (not a component), so use the i18n instance the module installed.
  const { t } = nuxtApp.$i18n as { t: (key: string, named: Record<string, unknown>, plural: number) => string }

  const setup = () =>
    outbox.init(supabase, user.value?.id ?? null, (count) => {
      toast.success(t('offline.synced', { n: count }, count))
      // Lists were loaded before these records reached the server.
      nuxtApp.runWithContext(() => refreshNuxtData())
    })

  setup()
  // Each user has their own queue; switching accounts must not replay someone else's writes.
  watch(() => user.value?.id, (id, previous) => {
    if (id !== previous) {
      setup()
      outbox.flush()
    }
  })

  window.addEventListener('online', () => {
    outbox.online = true
    outbox.flush(true)
  })
  window.addEventListener('offline', () => {
    outbox.online = false
  })

  // navigator.onLine can say "online" on a dead connection (weak mobile signal):
  // keep retrying while anything is waiting.
  setInterval(() => {
    if (outbox.hasPending) outbox.flush()
  }, 20_000)

  outbox.flush()
})
