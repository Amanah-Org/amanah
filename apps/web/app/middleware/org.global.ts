const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/confirm', '/onboarding', '/invite/accept']

export default defineNuxtRouteMiddleware(async (to) => {
  if (publicRoutes.some(r => to.path === r) || to.path.startsWith('/public/')) return

  const user = useSupabaseUser()
  if (!user.value) return

  const orgStore = useOrgStore()
  if (!orgStore.loaded) await orgStore.load()
  if (!orgStore.currentOrgId) {
    // Invited users land on their invitation rather than creating a new org.
    return navigateTo(orgStore.pendingInvites ? '/invite/accept' : '/onboarding')
  }
})
