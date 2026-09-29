<template>
  <div class="min-h-screen flex bg-canvas">
    <!-- Sidebar -->
    <aside class="hidden md:flex flex-col w-64 bg-white border-e border-surface-200 shrink-0">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 py-5 border-b border-surface-200">
        <div class="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div>
          <span class="font-bold text-ink-900 text-base leading-none">Amanah</span>
          <p class="text-xs text-ink-500 mt-1 leading-none">{{ $t('app.tagline') }}</p>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.href"
          :to="item.href"
          :aria-current="isActive(item.href) ? 'page' : undefined"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
          :class="[
            isActive(item.href)
              ? 'bg-brand-100 text-brand-800 font-semibold ring-1 ring-inset ring-brand-200'
              : 'text-ink-500 hover:bg-brand-900/[0.06] hover:text-ink-800',
          ]"
        >
          <span class="w-5 h-5 shrink-0 flex items-center justify-center" :class="isActive(item.href) ? 'text-brand-600' : ''" v-html="item.icon" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- Language switcher + sign out -->
      <div class="px-3 py-4 border-t border-surface-200 space-y-3">
        <OrgSwitcher />
        <LanguageSwitcher />
        <button
          class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-ink-500 hover:bg-brand-900/[0.06] hover:text-ink-700 transition-colors"
          @click="signOut"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          {{ $t('nav.signOut') }}
        </button>
      </div>
    </aside>

    <!-- Mobile header -->
    <div class="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-surface-200 h-14 flex items-center px-4 gap-3 shadow-sm" :inert="mobileOpen || undefined">
      <button ref="menuBtn" class="p-3 -ms-3 rounded-lg text-ink-700 hover:bg-brand-900/[0.06]" :aria-label="$t('nav.menu')" :aria-expanded="mobileOpen" @click="mobileOpen = !mobileOpen">
        <svg class="w-5 h-5 text-ink-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <span class="font-bold text-ink-900">Amanah</span>
      </div>
    </div>

    <!-- Mobile drawer -->
    <Transition
      enter-active-class="transition-transform duration-200"
      enter-from-class="-translate-x-full rtl:translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full rtl:translate-x-full"
    >
      <div v-if="mobileOpen" class="md:hidden fixed inset-0 z-50 flex" role="dialog" aria-modal="true" :aria-label="$t('nav.menu')" @keydown.esc="mobileOpen = false">
        <div class="w-64 bg-white h-full flex flex-col border-e border-surface-200 shadow-dialog">
          <div class="flex items-center justify-between px-5 py-5 border-b border-surface-200">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span class="font-bold text-ink-900">Amanah</span>
            </div>
            <button ref="closeBtn" class="p-3 -me-3 rounded-lg text-ink-500 hover:bg-brand-900/[0.06] hover:text-ink-800" :aria-label="$t('nav.closeMenu')" @click="mobileOpen = false">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <NuxtLink
              v-for="item in navItems"
              :key="item.href"
              :to="item.href"
              :aria-current="isActive(item.href) ? 'page' : undefined"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              :class="[
                isActive(item.href)
                  ? 'bg-brand-100 text-brand-800 font-semibold ring-1 ring-inset ring-brand-200'
                  : 'text-ink-500 hover:bg-brand-900/[0.06] hover:text-ink-800',
              ]"
              @click="mobileOpen = false"
            >
              <span class="w-5 h-5 shrink-0 flex items-center justify-center" :class="isActive(item.href) ? 'text-brand-600' : ''" v-html="item.icon" />
              {{ item.label }}
            </NuxtLink>
          </nav>
          <div class="px-3 py-4 border-t border-surface-200 space-y-3">
            <OrgSwitcher />
            <LanguageSwitcher />
            <button
              class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-ink-500 hover:bg-brand-900/[0.06] hover:text-ink-700 transition-colors"
              @click="signOut"
            >
              <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              {{ $t('nav.signOut') }}
            </button>
          </div>
        </div>
        <div class="flex-1 bg-ink-950/50" @click="mobileOpen = false" />
      </div>
    </Transition>

    <!-- Main content -->
    <main class="flex-1 overflow-auto pt-14 md:pt-0" :inert="mobileOpen || undefined">
      <ClientOnly><SyncStatus /></ClientOnly>
      <!-- Invitations are otherwise invisible to people who already belong to an organization. -->
      <NuxtLink
        v-if="orgStore.pendingInvites"
        to="/invite/accept"
        class="block bg-warning-50 border-b border-warning-200 text-warning-900 text-sm px-4 py-2.5 text-center hover:bg-warning-100"
      >
        {{ $t('nav.pendingInvites', { n: orgStore.pendingInvites }, orgStore.pendingInvites) }}
      </NuxtLink>
      <div class="page-container py-7">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const { t } = useI18n()
const supabase = useSupabaseClient()
const orgStore = useOrgStore()
const route = useRoute()
const mobileOpen = ref(false)
const menuBtn = ref<HTMLButtonElement | null>(null)
const closeBtn = ref<HTMLButtonElement | null>(null)

// The open drawer is a modal dialog: focus moves into it, the page behind is inert, and focus returns to the menu button on close.
watch(mobileOpen, async (open) => {
  await nextTick()
  ;(open ? closeBtn : menuBtn).value?.focus()
})

// Close the drawer on any navigation (sign-out, redirects, programmatic links), not only nav-link taps.
watch(() => route.fullPath, () => (mobileOpen.value = false))

const navItems = computed(() => [
  {
    href: '/dashboard',
    label: t('nav.dashboard'),
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>`,
  },
  {
    href: '/beneficiaries',
    label: t('nav.beneficiaries'),
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>`,
  },
  {
    href: '/donations',
    label: t('nav.donations'),
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>`,
  },
  {
    href: '/settings',
    label: t('nav.settings'),
    icon: `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
  },
])

function isActive(href: string) {
  return route.path === href || route.path.startsWith(href + '/')
}

const outbox = useOutboxStore()

async function signOut() {
  // Unsynced changes stay on this device and sync the next time this user signs in.
  if (outbox.queue.length && !confirm(t('offline.signOutWarning', { n: outbox.queue.length }, outbox.queue.length))) return
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>
