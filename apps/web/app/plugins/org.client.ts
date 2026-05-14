// Auto-load org on app start
export default defineNuxtPlugin(async () => {
  const orgStore = useOrgStore()
  const user = useSupabaseUser()

  if (user.value && !orgStore.loaded) {
    await orgStore.load()
  }
})
