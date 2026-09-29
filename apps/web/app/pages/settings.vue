<template>
  <div>
    <div class="page-header">
      <h1 class="text-2xl font-bold text-ink-900">{{ $t('settings.title') }}</h1>
    </div>

    <div class="grid md:grid-cols-4 gap-6">
      <nav class="flex md:flex-col gap-1 overflow-x-auto">
        <button
          v-for="s in sections"
          :key="s.id"
          class="text-start px-3 py-2.5 min-h-11 md:min-h-0 rounded-xl text-sm font-medium transition-colors shrink-0"
          :class="activeSection === s.id ? 'bg-white text-brand-800 shadow-card ring-1 ring-brand-200' : 'text-ink-600 hover:bg-brand-900/[0.06]'"
          @click="activeSection = s.id"
        >
          {{ s.label }}
        </button>
      </nav>

      <div class="md:col-span-3 min-w-0">
        <!-- Organization -->
        <Card v-if="activeSection === 'org'" class="p-6">
          <h2 class="section-title mb-4">{{ $t('settings.org.title') }}</h2>
          <form v-if="orgStore.isAdmin" class="space-y-4 max-w-md" @submit.prevent="saveOrg">
            <div>
              <Label for="org-name" class="mb-1.5 block">{{ $t('settings.org.name') }}</Label>
              <Input id="org-name" v-model="orgName" required />
            </div>
            <Button type="submit" size="sm" :disabled="savingOrg || orgName.trim() === orgStore.currentOrg?.name">
              {{ savingOrg ? $t('common.saving') : $t('common.save') }}
            </Button>
          </form>
          <dl class="space-y-4" :class="{ 'mt-6 pt-6 border-t border-surface-200': orgStore.isAdmin }">
            <div v-if="!orgStore.isAdmin">
              <dt class="text-xs font-medium text-ink-400 uppercase tracking-wide">{{ $t('settings.org.name') }}</dt>
              <dd class="mt-0.5 text-sm text-ink-800 font-medium">{{ orgStore.currentOrg?.name ?? '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-ink-400 uppercase tracking-wide">{{ $t('settings.org.publicPage') }}</dt>
              <dd class="mt-0.5 text-sm">
                <NuxtLink :to="publicPath" target="_blank" class="text-brand-600 hover:underline font-mono break-all" dir="ltr">{{ publicUrl }}</NuxtLink>
                <p class="text-xs text-ink-400 mt-1">{{ $t('settings.org.publicPageHint') }}</p>
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-ink-400 uppercase tracking-wide">{{ $t('settings.org.role') }}</dt>
              <dd class="mt-0.5">
                <Badge class="badge-green">{{ label('role', orgStore.currentRole) }}</Badge>
              </dd>
            </div>
          </dl>
        </Card>

        <!-- Members -->
        <div v-else-if="activeSection === 'members'" class="space-y-6">
          <Card v-if="orgStore.isAdmin" class="p-6">
            <h2 class="section-title mb-1">{{ $t('settings.members.inviteTitle') }}</h2>
            <p class="text-sm text-ink-500 mb-4">{{ $t('settings.members.inviteHint') }}</p>
            <form class="flex flex-col sm:flex-row gap-3" @submit.prevent="invite">
              <Input v-model="inviteForm.email" type="email" required :placeholder="$t('auth.login.email')" class="sm:flex-1" dir="ltr" />
              <select v-model="inviteForm.role" :class="selectClass" class="sm:w-36" :aria-label="$t('settings.members.role')">
                <option v-for="r in roles" :key="r" :value="r">{{ label('role', r) }}</option>
              </select>
              <Button type="submit" :disabled="inviting">{{ inviting ? $t('settings.members.inviting') : $t('settings.members.invite') }}</Button>
            </form>
            <p v-if="inviteError" class="text-sm text-danger-600 mt-3">{{ inviteError }}</p>
            <p class="text-xs text-ink-400 mt-3">{{ $t('settings.members.rolesHelp') }}</p>
          </Card>

          <Card class="p-6">
            <h2 class="section-title mb-4">{{ $t('settings.members.title') }}</h2>
            <p v-if="memberError" class="text-sm text-danger-600 mb-3">{{ memberError }}</p>
            <ul class="divide-y divide-surface-200 -mx-1">
              <li v-for="m in members" :key="m.id" class="flex flex-wrap items-center justify-between gap-3 px-1 py-3">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-ink-800">
                    {{ m.profile?.full_name || emails[m.user_id] || $t('settings.members.unknown') }}
                    <span v-if="m.user_id === user?.id" class="text-xs text-ink-400">({{ $t('settings.members.you') }})</span>
                  </p>
                  <p v-if="emails[m.user_id]" class="text-xs text-ink-400" dir="ltr">{{ emails[m.user_id] }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <Badge v-if="m.status === 'pending'" class="badge-yellow">{{ $t('settings.members.pending') }}</Badge>
                  <template v-if="orgStore.isAdmin && !isProtected(m)">
                    <select
                      :value="m.role"
                      :class="selectClass"
                      class="sm:h-8 w-32 sm:py-1"
                      :aria-label="$t('settings.members.role')"
                      @change="changeRole(m, ($event.target as HTMLSelectElement).value as OrgRole)"
                    >
                      <!-- :selected (not only :value on the select) so the server-rendered HTML carries the right role; otherwise a full page load shows every member as the first option. -->
                      <option v-for="r in roles" :key="r" :value="r" :selected="r === m.role">{{ label('role', r) }}</option>
                    </select>
                    <Button size="sm" variant="ghost" class="text-danger-600 hover:bg-danger-50" @click="removeMember(m)">
                      {{ m.status === 'pending' ? $t('settings.members.revoke') : $t('settings.members.remove') }}
                    </Button>
                  </template>
                  <Badge v-else class="badge-slate">{{ label('role', m.role) }}</Badge>
                </div>
              </li>
            </ul>
          </Card>
        </div>

        <!-- Activity (audit log, admins) -->
        <Card v-else-if="activeSection === 'activity'" class="p-6">
          <h2 class="section-title mb-4">{{ $t('settings.activity.title') }}</h2>
          <p v-if="!activity?.length" class="text-sm text-ink-400">{{ $t('settings.activity.empty') }}</p>
          <ul v-else class="divide-y divide-surface-200 -mx-1">
            <li v-for="log in activity" :key="log.id" class="px-1 py-2.5 flex items-start justify-between gap-3 text-sm">
              <div class="min-w-0">
                <p class="text-ink-800">
                  <span class="font-medium">{{ (log.user_id && memberNames[log.user_id]) || $t('settings.members.unknown') }}</span>
                  · {{ actionLabel(log.action) }}
                </p>
                <p v-if="activityDetail(log)" class="text-xs text-ink-500 truncate">{{ activityDetail(log) }}</p>
              </div>
              <span class="text-xs text-ink-400 shrink-0">{{ formatDateTime(log.created_at) }}</span>
            </li>
          </ul>
        </Card>

        <!-- Language -->
        <Card v-else-if="activeSection === 'language'" class="p-6">
          <h2 class="section-title mb-4">{{ $t('settings.language.title') }}</h2>
          <p class="text-sm text-ink-500 mb-4">{{ $t('settings.language.label') }}</p>
          <LanguageSwitcher class="max-w-xs" />
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AuditLog, Organization, OrganizationMember, OrgRole } from '@amanah/types'

const { t, te } = useI18n()
useHead({ title: () => `${t('settings.title')} — Amanah` })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const orgStore = useOrgStore()
const { logAction } = useAuditLog()
const { formatDateTime, label } = useFormat()
const toast = useToast()

const selectClass =
  'input'
const roles: OrgRole[] = ['admin', 'collector', 'viewer']

const activeSection = ref((useRoute().query.section as string) || 'org')
const sections = computed(() => [
  { id: 'org', label: t('settings.sections.org') },
  { id: 'members', label: t('settings.sections.members') },
  ...(orgStore.isAdmin ? [{ id: 'activity', label: t('settings.sections.activity') }] : []),
  { id: 'language', label: t('settings.sections.language') },
])

// ─── Organization ─────────────────────────────────────────────────────────────
const orgName = ref(orgStore.currentOrg?.name ?? '')
const savingOrg = ref(false)
const publicPath = computed(() => `/public/${orgStore.currentOrg?.slug ?? ''}`)
const requestUrl = useRequestURL()
const publicUrl = computed(() => requestUrl.origin + publicPath.value)

async function saveOrg() {
  if (!orgStore.currentOrg) return
  savingOrg.value = true
  const { data, error } = await supabase
    .from('organizations')
    .update({ name: orgName.value.trim() })
    .eq('id', orgStore.currentOrg.id)
    .select()
    .single()
  savingOrg.value = false
  if (error) {
    toast.error(error.message)
    return
  }
  orgStore.setOrg(data as Organization, orgStore.currentRole!)
  await logAction('organization_updated', 'organization', data.id, { name: data.name })
  toast.success(t('settings.org.saved'))
}

// ─── Members ──────────────────────────────────────────────────────────────────
const { data: members, refresh: refreshMembers } = await useAsyncData('members', async () => {
  const orgId = orgStore.currentOrgId
  if (!orgId) return []
  const { data } = await supabase
    .from('organization_members')
    .select('*, profile:profiles(id, full_name)')
    .eq('organization_id', orgId)
    .order('created_at')
  return (data ?? []) as unknown as OrganizationMember[]
}, { watch: [() => orgStore.currentOrgId] })

// Emails are only returned to admins (enforced by the RPC).
const { data: emailRows, refresh: refreshEmails } = await useAsyncData('member-emails', async () => {
  if (!orgStore.currentOrgId || !orgStore.isAdmin) return []
  const { data } = await supabase.rpc('org_member_emails', { p_org_id: orgStore.currentOrgId })
  return (data ?? []) as { user_id: string; email: string }[]
}, { watch: [() => orgStore.currentOrgId] })
const emails = computed<Record<string, string>>(() => Object.fromEntries((emailRows.value ?? []).map((r) => [r.user_id, r.email])))
const memberNames = computed<Record<string, string>>(() =>
  Object.fromEntries((members.value ?? []).map((m) => [m.user_id, m.profile?.full_name || emails.value[m.user_id] || ''])),
)

const inviteForm = reactive({ email: '', role: 'collector' as OrgRole })
const inviting = ref(false)
const inviteError = ref('')
const memberError = ref('')

/** You can't edit yourself or the owner (the database also enforces the owner rule). */
function isProtected(m: OrganizationMember) {
  return m.user_id === user.value?.id || m.user_id === orgStore.currentOrg?.owner_id
}

async function invite() {
  if (!orgStore.currentOrgId) return
  inviting.value = true
  inviteError.value = ''
  try {
    const res = await $fetch<{ emailSent: boolean }>('/api/invites', {
      method: 'POST',
      body: { orgId: orgStore.currentOrgId, email: inviteForm.email, role: inviteForm.role },
    })
    toast.success(t(res.emailSent ? 'settings.members.invitedNew' : 'settings.members.invitedExisting', { email: inviteForm.email }))
    inviteForm.email = ''
    await Promise.all([refreshMembers(), refreshEmails()])
  } catch (err: unknown) {
    const msg = (err as { data?: { statusMessage?: string }; statusMessage?: string }).data?.statusMessage
      ?? (err as { statusMessage?: string }).statusMessage ?? ''
    inviteError.value = te(`settings.members.errors.${msg}`) ? t(`settings.members.errors.${msg}`) : msg || t('onboarding.unknownError')
  } finally {
    inviting.value = false
  }
}

async function changeRole(m: OrganizationMember, role: OrgRole) {
  memberError.value = ''
  const { error } = await supabase.from('organization_members').update({ role }).eq('id', m.id)
  if (error) {
    memberError.value = error.message
  } else {
    await logAction('member_role_changed', 'organization_member', m.id, { user_id: m.user_id, from: m.role, to: role })
    toast.success(t('toast.roleChanged', { role: label('role', role) }))
  }
  await refreshMembers()
}

async function removeMember(m: OrganizationMember) {
  const name = memberNames.value[m.user_id] || t('settings.members.unknown')
  if (!confirm(t('settings.members.removeConfirm', { name }))) return
  memberError.value = ''
  const { error } = await supabase.from('organization_members').delete().eq('id', m.id)
  if (error) {
    memberError.value = error.message
    return
  }
  await logAction(m.status === 'pending' ? 'invite_revoked' : 'member_removed', 'organization_member', m.id, { user_id: m.user_id, role: m.role })
  toast.success(t(m.status === 'pending' ? 'toast.inviteRevoked' : 'toast.memberRemoved'))
  await refreshMembers()
}

// ─── Activity ────────────────────────────────────────────────────────────────
const { data: activity } = await useAsyncData('audit-activity', async () => {
  if (!orgStore.currentOrgId || !orgStore.isAdmin) return []
  const { data } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('org_id', orgStore.currentOrgId)
    .order('created_at', { ascending: false })
    .limit(100)
  return (data ?? []) as AuditLog[]
}, { watch: [() => orgStore.currentOrgId, activeSection] })

function actionLabel(action: string) {
  return te(`settings.activity.actions.${action}`) ? t(`settings.activity.actions.${action}`) : action.replace(/_/g, ' ')
}

function activityDetail(log: AuditLog) {
  const m = log.metadata ?? {}
  return [m.full_name, m.email, m.name, m.file_name, m.amount != null ? `$${m.amount}` : null]
    .filter(Boolean)
    .join(' · ')
}
</script>
