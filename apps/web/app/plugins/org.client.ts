export default defineNuxtPlugin(async () => {
  const supabase = useSupabaseClient()
  const sessionRef = useSupabaseSession()
  const userRef = useSupabaseUser()
  const orgStore = useOrgStore()

  // The built-in supabase plugin registers onAuthStateChange but doesn't await
  // INITIAL_SESSION, so on a hard refresh the session ref is still null when
  // the auth-redirect middleware runs — causing a spurious redirect to /login.
  // Awaiting getSession() here forces the session into the shared useState refs
  // before any route middleware executes.
  if (!sessionRef.value) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      sessionRef.value = session
      userRef.value = session.user
    }
  }

  if (userRef.value && !orgStore.loaded) {
    await orgStore.load()
  }

  watch(userRef, async (newUser, oldUser) => {
    if (newUser?.id !== oldUser?.id) {
      orgStore.$reset()
      if (newUser) await orgStore.load()
    }
  })
})
