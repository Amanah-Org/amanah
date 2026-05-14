<template>
  <div>
    <div class="page-header">
      <h1 class="text-2xl font-bold text-slate-900">{{ $t('settings.title') }}</h1>
    </div>

    <div class="grid md:grid-cols-3 gap-6">
      <!-- Sidebar nav -->
      <nav class="space-y-1">
        <button
          v-for="s in sections"
          :key="s.id"
          class="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
          :class="activeSection === s.id ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-surface-100'"
          @click="activeSection = s.id"
        >
          {{ s.label }}
        </button>
      </nav>

      <!-- Content -->
      <div class="md:col-span-2">
        <!-- Organization settings -->
        <Card v-if="activeSection === 'org'" class="p-6">
          <h2 class="section-title mb-4">{{ $t('settings.org.title') }}</h2>
          <dl class="space-y-4">
            <div>
              <dt class="text-xs font-medium text-slate-400 uppercase tracking-wide">{{ $t('settings.org.name') }}</dt>
              <dd class="mt-0.5 text-sm text-slate-800 font-medium">{{ orgStore.currentOrg?.name ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-slate-400 uppercase tracking-wide">{{ $t('settings.org.slug') }}</dt>
              <dd class="mt-0.5 text-sm text-slate-800 font-mono">{{ orgStore.currentOrg?.slug ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-slate-400 uppercase tracking-wide">{{ $t('settings.org.role') }}</dt>
              <dd class="mt-0.5">
                <Badge class="capitalize badge-green">{{ orgStore.currentRole ?? '—' }}</Badge>
              </dd>
            </div>
          </dl>
        </Card>

        <!-- Members -->
        <Card v-else-if="activeSection === 'members'" class="p-6">
          <h2 class="section-title mb-4">{{ $t('settings.members.title') }}</h2>

          <ul class="divide-y divide-surface-200 -mx-1">
            <li v-for="m in members" :key="m.id" class="flex items-center justify-between px-1 py-3">
              <div>
                <p class="text-sm font-medium text-slate-800">{{ m.profile?.full_name ?? $t('settings.members.unknown') }}</p>
                <p class="text-xs text-slate-400 capitalize">{{ m.role }}</p>
              </div>
              <Badge :class="m.status === 'active' ? 'badge-green' : 'badge-yellow'">
                {{ m.status }}
              </Badge>
            </li>
          </ul>
        </Card>

        <!-- Language -->
        <Card v-else-if="activeSection === 'language'" class="p-6">
          <h2 class="section-title mb-4">{{ $t('settings.language.title') }}</h2>
          <p class="text-sm text-slate-500 mb-4">{{ $t('settings.language.label') }}</p>
          <LanguageSwitcher />
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrganizationMember } from '@amanah/types'

useHead({ title: 'Settings — Amanah' })

const { t } = useI18n()
const supabase = useSupabaseClient()
const orgStore = useOrgStore()

const activeSection = ref('org')

const sections = computed(() => [
  { id: 'org', label: t('settings.sections.org') },
  { id: 'members', label: t('settings.sections.members') },
  { id: 'language', label: t('settings.sections.language') },
])

const { data: members } = await useAsyncData('members', async () => {
  const orgId = orgStore.currentOrgId
  if (!orgId) return []
  const { data } = await supabase
    .from('organization_members')
    .select('*, profile:profiles(id, full_name)')
    .eq('organization_id', orgId)
    .order('created_at')
  return (data ?? []) as OrganizationMember[]
}, { watch: [() => orgStore.currentOrgId] })
</script>
