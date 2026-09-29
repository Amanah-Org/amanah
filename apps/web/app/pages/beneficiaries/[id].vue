<template>
  <div v-if="pending && !beneficiary" class="flex justify-center py-12">
    <svg class="animate-spin w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  </div>

  <div v-else-if="!beneficiary" class="text-center py-12">
    <p class="text-ink-500">{{ $t('beneficiaries.notFound') }}</p>
    <NuxtLink to="/beneficiaries" class="btn-outline mt-4 inline-flex"><ArrowLeft class="w-4 h-4 rtl:rotate-180" aria-hidden="true" />{{ $t('beneficiaries.back') }}</NuxtLink>
  </div>

  <div v-else>
    <!-- Header -->
    <div class="mb-6">
      <NuxtLink to="/beneficiaries" class="text-sm text-brand-600 hover:text-brand-800 font-medium inline-flex items-center gap-1 mb-3 py-3 -my-3">
        <ArrowLeft class="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
        {{ $t('beneficiaries.backToBeneficiaries') }}
      </NuxtLink>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="min-w-0">
          <h1 class="text-2xl font-bold text-ink-900 break-words">{{ beneficiary.full_name }}</h1>
          <div class="flex flex-wrap items-center gap-2 mt-1">
            <Badge :class="badge('status', beneficiary.status)">{{ label('status', beneficiary.status) }}</Badge>
            <Badge v-if="beneficiary.category" class="badge-blue">{{ beneficiary.category }}</Badge>
            <span class="text-sm text-ink-500">{{ beneficiary.city }}</span>
          </div>
        </div>
        <div class="flex flex-wrap gap-2">
          <Button v-if="orgStore.canWrite" variant="secondary" size="sm" @click="showEditModal = true">{{ $t('common.edit') }}</Button>
          <Button v-if="orgStore.canWrite" size="sm" @click="openDistributionModal()">{{ $t('beneficiaries.addDistribution') }}</Button>
        </div>
      </div>
      <p v-if="pageError" class="text-sm text-danger-600 mt-3">{{ pageError }}</p>
    </div>

    <!-- Tabs -->
    <div class="border-b border-surface-200 mb-6">
      <nav class="grid grid-cols-5 sm:flex -mb-px" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          role="tab"
          :aria-selected="activeTab === tab.id"
          class="px-1 sm:px-4 py-2.5 min-h-11 sm:min-h-0 text-xs sm:text-sm font-medium border-b-2 text-center sm:shrink-0 transition-colors truncate"
          :class="activeTab === tab.id
            ? 'border-brand-600 text-brand-700'
            : 'border-transparent text-ink-500 hover:text-ink-700 hover:border-ink-200'"
          @click="activeTab = tab.id"
        >
          <span class="sm:hidden">{{ tab.short }}</span>
          <span class="hidden sm:inline">{{ tab.label }}</span>
          <span v-if="tab.count" class="hidden sm:inline ms-1 text-xs text-ink-400">({{ tab.count }})</span>
        </button>
      </nav>
    </div>

    <!-- Tab: Personal Info -->
    <Card v-if="activeTab === 'info'" class="max-w-2xl p-6">
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
        <InfoRow :label="$t('beneficiaries.info.fullName')" :value="beneficiary.full_name" />
        <InfoRow :label="$t('beneficiaries.info.phone')" :value="beneficiary.phone" ltr />
        <InfoRow :label="$t('beneficiaries.info.nationalId')" :value="beneficiary.national_id" ltr />
        <InfoRow :label="$t('beneficiaries.info.gender')" :value="beneficiary.gender ? $t(`beneficiaries.modal.gender${capitalize(beneficiary.gender)}`) : null" />
        <InfoRow :label="$t('beneficiaries.info.birthDate')" :value="beneficiary.birth_date ? formatDate(beneficiary.birth_date) : null" />
        <InfoRow :label="$t('beneficiaries.info.city')" :value="beneficiary.city" />
        <InfoRow :label="$t('beneficiaries.info.address')" :value="beneficiary.address" />
        <InfoRow :label="$t('beneficiaries.info.familySize')" :value="beneficiary.family_size?.toString()" />
        <InfoRow :label="$t('beneficiaries.info.employment')" :value="beneficiary.employment_status" />
        <InfoRow :label="$t('beneficiaries.info.monthlyIncome')" :value="beneficiary.monthly_income != null ? formatMoney(beneficiary.monthly_income) : null" />
        <InfoRow :label="$t('beneficiaries.info.category')" :value="beneficiary.category" />
        <InfoRow :label="$t('beneficiaries.info.registered')" :value="formatDate(beneficiary.created_at)" />
        <InfoRow :label="$t('beneficiaries.info.healthConditions')" :value="beneficiary.health_conditions" class="sm:col-span-2" />
      </dl>
      <div v-if="orgStore.isAdmin" class="mt-6 pt-4 border-t border-surface-200">
        <button class="text-sm text-danger-600 hover:underline py-3 -my-3" @click="deleteBeneficiary">{{ $t('beneficiaries.deleteButton') }}</button>
      </div>
    </Card>

    <!-- Tab: Needs -->
    <div v-else-if="activeTab === 'needs'">
      <div v-if="orgStore.canWrite" class="flex justify-end mb-4">
        <Button size="sm" @click="openNeedModal(null)">{{ $t('beneficiaries.needs.addButton') }}</Button>
      </div>
      <ClientOnly>
        <Card v-for="need in pendingNeeds" :key="need.id" class="p-4 mb-3 bg-warning-50/50 border-warning-200">
          <div class="flex flex-wrap items-center gap-2">
            <p class="font-semibold text-ink-800">{{ label('needType', need.type) }}</p>
            <Badge class="badge-slate">{{ label('frequency', need.frequency) }}</Badge>
            <span class="text-xs text-warning-700">{{ $t('offline.waitingToSync') }}</span>
          </div>
        </Card>
      </ClientOnly>
      <Card v-if="!needs?.length && !pendingNeeds.length" class="text-center text-ink-400 py-8">{{ $t('beneficiaries.needs.empty') }}</Card>
      <div v-else class="space-y-3">
        <Card
          v-for="need in needs"
          :key="need.id"
          class="p-4 sm:p-5"
          :class="{ 'opacity-60': need.status === 'completed' }"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <p class="font-semibold text-ink-800">{{ label('needType', need.type) }}</p>
                <Badge :class="badge('urgency', need.urgency)">{{ label('urgency', need.urgency) }}</Badge>
                <Badge class="badge-slate">{{ label('frequency', need.frequency) }}</Badge>
              </div>
              <p v-if="need.description" class="text-sm text-ink-500">{{ need.description }}</p>
              <p class="text-xs text-ink-500 mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5">
                <span v-if="need.estimated_cost" class="whitespace-nowrap">{{ $t('beneficiaries.needs.estCost', { cost: formatMoney(need.estimated_cost) }) }}</span>
                <span class="whitespace-nowrap">{{ $t('beneficiaries.needs.lastGiven') }}: {{ formatDate(schedule[need.id]?.last_distribution_date) }}</span>
                <span v-if="need.status === 'active' && schedule[need.id] && dueStatus(schedule[need.id]!)" :class="{ 'text-danger-600 font-medium': dueStatus(schedule[need.id]!)!.urgent }" class="whitespace-nowrap">
                  {{ dueStatus(schedule[need.id]!)!.text }}
                </span>
              </p>
            </div>
            <Badge class="shrink-0" :class="badge('needStatus', need.status)">{{ label('needStatus', need.status) }}</Badge>
          </div>
          <div v-if="orgStore.canWrite" class="grid grid-cols-3 gap-2 mt-3 sm:flex sm:flex-wrap sm:items-center">
            <Button v-if="need.status !== 'completed'" size="sm" class="col-span-3 sm:col-auto" @click="markNeedAsDistributed(need)">
              {{ $t('beneficiaries.needs.markDistributed') }}
            </Button>
            <Button size="sm" variant="secondary" class="w-full sm:w-auto" @click="openNeedModal(need)">{{ $t('common.edit') }}</Button>
            <Button v-if="need.status !== 'completed'" size="sm" variant="secondary" class="w-full sm:w-auto" @click="updateNeedStatus(need.id, 'completed')">
              {{ $t('beneficiaries.needs.complete') }}
            </Button>
            <Button v-if="need.status === 'active'" size="sm" variant="secondary" class="w-full sm:w-auto" @click="updateNeedStatus(need.id, 'paused')">
              {{ $t('beneficiaries.needs.pause') }}
            </Button>
            <Button v-if="need.status !== 'active'" size="sm" variant="secondary" class="w-full sm:w-auto" @click="updateNeedStatus(need.id, 'active')">
              {{ $t('beneficiaries.needs.activate') }}
            </Button>
          </div>
        </Card>
      </div>
    </div>

    <!-- Tab: Distribution History (grouped by month) -->
    <div v-else-if="activeTab === 'history'">
      <ClientOnly>
        <div v-if="pendingDistributions.length" class="mb-6">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-warning-700 mb-2">{{ $t('offline.waitingToSync') }}</h3>
          <Card v-for="dist in pendingDistributions" :key="dist.id" class="p-4 mb-2 bg-warning-50/50 border-warning-200">
            <div class="flex items-start justify-between gap-4">
              <p class="font-semibold text-ink-800">{{ $t(`distributions.types.${dist.type}`) }}</p>
              <div class="text-end shrink-0">
                <p v-if="dist.amount" class="font-semibold text-ink-900">{{ formatMoney(dist.amount) }}</p>
                <p class="text-xs text-ink-400 mt-0.5">{{ formatDate(dist.distribution_date, { month: 'short', day: 'numeric' }) }}</p>
              </div>
            </div>
          </Card>
        </div>
      </ClientOnly>
      <Card v-if="!distributions?.length" class="text-center text-ink-400 py-8">{{ $t('beneficiaries.history.empty') }}</Card>
      <div v-else class="space-y-6">
        <section v-for="group in distributionsByMonth" :key="group.key">
          <h3 class="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">
            {{ group.label }} · {{ formatMoney(group.total) }}
          </h3>
          <div class="space-y-2">
            <Card v-for="dist in group.items" :key="dist.id" class="p-4">
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <p class="font-semibold text-ink-800">{{ $t(`distributions.types.${dist.type}`) }}</p>
                  <p v-if="dist.notes" class="text-sm text-ink-500 mt-0.5">{{ dist.notes }}</p>
                  <p v-if="dist.distributed_by && people[dist.distributed_by]" class="text-xs text-ink-400 mt-1">
                    {{ $t('beneficiaries.history.by', { name: people[dist.distributed_by] }) }}
                  </p>
                  <button
                    v-if="dist.proof_attachment_url"
                    class="text-xs text-brand-600 hover:underline mt-1"
                    @click="openFile(dist.proof_attachment_url)"
                  >{{ $t('beneficiaries.history.viewProof') }}</button>
                </div>
                <div class="text-end shrink-0">
                  <p v-if="dist.amount" class="font-semibold text-ink-900">{{ formatMoney(dist.amount) }}</p>
                  <p class="text-xs text-ink-400 mt-0.5">{{ formatDate(dist.distribution_date, { month: 'short', day: 'numeric' }) }}</p>
                  <div v-if="orgStore.isAdmin" class="flex justify-end gap-3 mt-1 text-xs text-ink-400">
                    <button class="link-action hover:text-brand-700" @click="editDistribution(dist)">{{ $t('common.edit') }}</button>
                    <button class="link-action hover:text-danger-600" @click="deleteDistribution(dist)">{{ $t('common.delete') }}</button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </div>

    <!-- Tab: Attachments -->
    <div v-else-if="activeTab === 'attachments'">
      <Card v-if="orgStore.canWrite" class="p-5 mb-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="font-semibold text-ink-900">{{ $t('beneficiaries.attachments.title') }}</h3>
            <p class="text-xs text-ink-500 mt-1">{{ $t('beneficiaries.attachments.hint') }}</p>
          </div>
          <Input type="file" accept="image/*,application/pdf" class="sm:max-w-xs" :disabled="uploading" @change="uploadAttachment" />
        </div>
        <p v-if="uploading" class="text-sm text-ink-500 mt-3">{{ $t('beneficiaries.attachments.uploading') }}</p>
        <p v-if="attachmentError" class="text-sm text-danger-600 mt-3">{{ attachmentError }}</p>
      </Card>

      <Card v-if="!allAttachments.length" class="text-center text-ink-400 py-8">{{ $t('beneficiaries.attachments.empty') }}</Card>
      <div v-else class="space-y-3">
        <Card v-for="file in allAttachments" :key="file.id" class="p-4 flex items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="font-medium text-ink-800 truncate">{{ file.file_name }}</p>
            <p class="text-xs text-ink-500 mt-1">{{ file.file_type }} · {{ formatBytes(file.file_size) }}</p>
          </div>
          <button class="text-sm text-brand-600 hover:underline shrink-0" @click="openFile(file.file_url)">{{ $t('beneficiaries.attachments.view') }}</button>
        </Card>
      </div>
    </div>

    <!-- Tab: Notes (timestamped) -->
    <div v-else-if="activeTab === 'notes'" class="max-w-2xl space-y-4">
      <form v-if="orgStore.canWrite" class="space-y-2" @submit.prevent="addNote">
        <Label for="note-body" class="sr-only">{{ $t('beneficiaries.notes.add') }}</Label>
        <Textarea id="note-body" v-model="noteBody" rows="3" class="resize-none bg-white" :placeholder="$t('beneficiaries.notes.placeholder')" />
        <div class="flex justify-end">
          <Button type="submit" size="sm" :disabled="savingNote || !noteBody.trim()">
            {{ savingNote ? $t('common.saving') : $t('beneficiaries.notes.add') }}
          </Button>
        </div>
      </form>

      <Card v-if="beneficiary.notes" class="p-5 bg-warning-50/40">
        <p class="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-1">{{ $t('beneficiaries.notes.general') }}</p>
        <p class="text-ink-700 whitespace-pre-wrap text-sm">{{ beneficiary.notes }}</p>
      </Card>

      <p v-if="!notes?.length && !beneficiary.notes && !pendingNotes.length" class="text-ink-400 text-sm text-center py-6">{{ $t('beneficiaries.notes.empty') }}</p>

      <ClientOnly>
        <Card v-for="note in pendingNotes" :key="note.id" class="p-4 bg-warning-50/50 border-warning-200">
          <p class="text-ink-700 whitespace-pre-wrap text-sm">{{ note.body }}</p>
          <p class="text-xs text-warning-700 mt-2">{{ $t('offline.waitingToSync') }} · {{ formatDateTime(note.created_at) }}</p>
        </Card>
      </ClientOnly>

      <Card v-for="note in notes" :key="note.id" class="p-4">
        <p class="text-ink-700 whitespace-pre-wrap text-sm">{{ note.body }}</p>
        <div class="flex items-center justify-between mt-2 text-xs text-ink-400">
          <span>{{ (note.created_by && people[note.created_by]) || $t('settings.members.unknown') }} · {{ formatDateTime(note.created_at) }}</span>
          <button
            v-if="note.created_by === user?.id || orgStore.isAdmin"
            class="link-action hover:text-danger-600"
            @click="deleteNote(note.id)"
          >{{ $t('common.delete') }}</button>
        </div>
      </Card>
    </div>

    <!-- Modals -->
    <AddBeneficiaryModal
      v-if="showEditModal"
      :beneficiary="beneficiary"
      @close="showEditModal = false"
      @created="onBeneficiaryUpdated"
    />
    <AddNeedModal
      v-if="showNeedModal"
      :beneficiary-id="beneficiary.id"
      :need="editingNeed"
      @close="showNeedModal = false"
      @created="onNeedSaved"
    />
    <AddDistributionModal
      v-if="showDistModal"
      :beneficiary-id="beneficiary.id"
      :needs="needs ?? []"
      :distributions="[...pendingDistributions, ...(distributions ?? [])]"
      :distribution="editingDistribution"
      :initial-need-id="selectedNeedId"
      :initial-type="selectedDistributionType"
      @close="showDistModal = false"
      @created="onDistributionCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import type { Beneficiary, BeneficiaryNeed, BeneficiaryNote, AidDistribution, NeedSchedule } from '@amanah/types'

const route = useRoute()
const { t } = useI18n()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const orgStore = useOrgStore()
const { logAction } = useAuditLog()
const { formatDate, formatDateTime, formatMoney, dueStatus, label, badge } = useFormat()
const outbox = useOutboxStore()
const write = useOfflineWrite()
const toast = useToast()
const id = route.params.id as string

const TAB_IDS = ['info', 'needs', 'history', 'attachments', 'notes'] as const
type TabId = (typeof TAB_IDS)[number]

const showEditModal = ref(false)
const showNeedModal = ref(false)
const showDistModal = ref(false)
const editingNeed = ref<BeneficiaryNeed | null>(null)
const editingDistribution = ref<AidDistribution | null>(null)
const activeTab = ref<TabId>(TAB_IDS.includes(route.query.tab as TabId) ? (route.query.tab as TabId) : 'info')
const selectedNeedId = ref<string | null>(null)
const selectedDistributionType = ref<AidDistribution['type'] | null>(null)
const attachmentError = ref('')
const uploading = ref(false)
const pageError = ref('')
const noteBody = ref('')
const savingNote = ref(false)

const { data: beneficiary, pending, refresh: refreshBeneficiary } = await useAsyncData(`beneficiary-${id}`, async (nuxtApp) => {
  const res = await supabase.from('beneficiaries').select('*').eq('id', id).is('deleted_at', null).maybeSingle()
  return keepOnNetworkError(nuxtApp, `beneficiary-${id}`, res, res.data as Beneficiary | null)
}, keepWhenOffline)

useHead(() => ({
  title: beneficiary.value ? `${beneficiary.value.full_name} — Amanah` : 'Amanah',
}))

const { data: needs, refresh: refreshNeedRows } = await useAsyncData(`needs-${id}`, async (nuxtApp) => {
  const res = await supabase
    .from('beneficiary_needs')
    .select('*')
    .eq('beneficiary_id', id)
    .is('deleted_at', null)
    .order('urgency_rank', { ascending: false })
  const order = { active: 0, paused: 1, completed: 2 }
  return keepOnNetworkError(nuxtApp, `needs-${id}`, res, ((res.data ?? []) as BeneficiaryNeed[]).sort((a, b) => order[a.status] - order[b.status]))
}, keepWhenOffline)

const { data: scheduleRows, refresh: refreshSchedule } = await useAsyncData(`need-schedule-${id}`, async (nuxtApp) => {
  const res = await supabase
    .from('need_schedule')
    .select('id, start_date, last_distribution_date, next_due_date')
    .eq('beneficiary_id', id)
  return keepOnNetworkError(nuxtApp, `need-schedule-${id}`, res, (res.data ?? []) as Pick<NeedSchedule, 'id' | 'start_date' | 'last_distribution_date' | 'next_due_date'>[])
}, keepWhenOffline)
const schedule = computed(() => Object.fromEntries((scheduleRows.value ?? []).map((s) => [s.id, s])))

const refreshNeeds = () => Promise.all([refreshNeedRows(), refreshSchedule()])

// Recorded on this device while offline, not on the server yet.
const pendingDistributions = computed(
  () => outbox.pendingInserts('aid_distributions', (r) => r.beneficiary_id === id) as unknown as AidDistribution[],
)
const pendingNotes = computed(
  () => outbox.pendingInserts('beneficiary_notes', (r) => r.beneficiary_id === id) as unknown as BeneficiaryNote[],
)
const pendingNeeds = computed(
  () => outbox.pendingInserts('beneficiary_needs', (r) => r.beneficiary_id === id) as unknown as BeneficiaryNeed[],
)

const { data: distributions, refresh: refreshDistributions } = await useAsyncData(`distributions-${id}`, async (nuxtApp) => {
  const res = await supabase
    .from('aid_distributions')
    .select('*')
    .eq('beneficiary_id', id)
    .is('deleted_at', null)
    .order('distribution_date', { ascending: false })
    .order('created_at', { ascending: false })
  return keepOnNetworkError(nuxtApp, `distributions-${id}`, res, (res.data ?? []) as AidDistribution[])
}, keepWhenOffline)

const { data: notes, refresh: refreshNotes } = await useAsyncData(`notes-${id}`, async (nuxtApp) => {
  const res = await supabase
    .from('beneficiary_notes')
    .select('*')
    .eq('beneficiary_id', id)
    .order('created_at', { ascending: false })
  return keepOnNetworkError(nuxtApp, `notes-${id}`, res, (res.data ?? []) as BeneficiaryNote[])
}, keepWhenOffline)

// Names for "distributed by" / note authors (profiles are visible to co-members).
const { data: peopleRows } = await useAsyncData(`people-${id}`, async () => {
  const { data } = await supabase.from('profiles').select('id, full_name')
  return data ?? []
}, keepWhenOffline)
const people = computed<Record<string, string>>(() =>
  Object.fromEntries((peopleRows.value ?? []).filter((p) => p.full_name).map((p) => [p.id, p.full_name as string])),
)

type BeneficiaryAttachment = { id: string; file_name: string; file_type: string; file_size: number; file_url: string }

const { data: attachments, refresh: refreshAttachments } = await useAsyncData(`attachments-${id}`, async (nuxtApp) => {
  const res = await supabase
    .from('beneficiary_attachments')
    .select('id, file_name, file_type, file_size, file_url')
    .eq('beneficiary_id', id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  return keepOnNetworkError(nuxtApp, `attachments-${id}`, res, (res.data ?? []) as BeneficiaryAttachment[])
}, keepWhenOffline)

const allAttachments = computed(() => {
  const proofFiles = (distributions.value ?? [])
    .filter((d) => !!d.proof_attachment_url)
    .map((d) => ({
      id: `proof-${d.id}`,
      file_name: t('beneficiaries.attachments.proof', { date: formatDate(d.distribution_date) }),
      file_type: t('beneficiaries.attachments.proofType'),
      file_size: 0,
      file_url: d.proof_attachment_url as string,
    }))
  return [...(attachments.value ?? []), ...proofFiles]
})

const tabs = computed(() => [
  { id: 'info' as const, label: t('beneficiaries.tabs.info'), short: t('beneficiaries.tabsShort.info') },
  { id: 'needs' as const, label: t('beneficiaries.tabs.needs'), short: t('beneficiaries.tabsShort.needs'), count: needs.value?.filter((n) => n.status === 'active').length },
  { id: 'history' as const, label: t('beneficiaries.tabs.history'), short: t('beneficiaries.tabsShort.history'), count: distributions.value?.length },
  { id: 'attachments' as const, label: t('beneficiaries.tabs.attachments'), short: t('beneficiaries.tabsShort.attachments'), count: allAttachments.value.length },
  { id: 'notes' as const, label: t('beneficiaries.tabs.notes'), short: t('beneficiaries.tabsShort.notes'), count: notes.value?.length },
])

watch(activeTab, (tab) => {
  navigateTo({ query: { ...route.query, tab, distribute: undefined } }, { replace: true })
})

const distributionsByMonth = computed(() => {
  const groups: { key: string; label: string; total: number; items: AidDistribution[] }[] = []
  for (const d of distributions.value ?? []) {
    const key = d.distribution_date.slice(0, 7)
    let group = groups.at(-1)
    if (group?.key !== key) {
      group = { key, label: formatDate(`${key}-01`, { month: 'long', year: 'numeric' }), total: 0, items: [] }
      groups.push(group)
    }
    group.items.push(d)
    group.total += Number(d.amount ?? 0)
  }
  return groups
})

// Deep link from the dashboard: ?distribute=<needId> opens the modal for that need.
onMounted(() => {
  const needId = route.query.distribute as string | undefined
  const need = needId && needs.value?.find((n) => n.id === needId)
  if (need && orgStore.canWrite) markNeedAsDistributed(need)
})

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
function formatBytes(size: number) {
  if (!size) return '—'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}
async function updateNeedStatus(needId: string, status: 'active' | 'paused' | 'completed') {
  pageError.value = ''
  const result = await write.update('beneficiary_needs', needId, { status }, `${t('beneficiaries.tabs.needs')}: ${label('needStatus', status)}`)
  if (!result.ok) {
    pageError.value = result.error
    return
  }
  await logAction('need_status_updated', 'beneficiary_need', needId, { status })
  write.confirm(result, t('toast.needStatus', { status: label('needStatus', status) }))
  if (result.queued) {
    // Show the change now; the server copy catches up when the device reconnects.
    needs.value = (needs.value ?? []).map((n) => (n.id === needId ? { ...n, status } : n))
  } else {
    await refreshNeeds()
  }
}

function openNeedModal(need: BeneficiaryNeed | null) {
  editingNeed.value = need
  showNeedModal.value = true
}

async function onNeedSaved() {
  showNeedModal.value = false
  editingNeed.value = null
  await refreshNeeds()
}

function markNeedAsDistributed(need: BeneficiaryNeed) {
  editingDistribution.value = null
  selectedNeedId.value = need.id
  selectedDistributionType.value = mapNeedTypeToDistribution(need.type)
  showDistModal.value = true
}

function openDistributionModal() {
  selectedNeedId.value = null
  selectedDistributionType.value = null
  editingDistribution.value = null
  showDistModal.value = true
}

function editDistribution(dist: AidDistribution) {
  selectedNeedId.value = null
  selectedDistributionType.value = null
  editingDistribution.value = dist
  showDistModal.value = true
}

async function onBeneficiaryUpdated() {
  showEditModal.value = false
  await refreshBeneficiary()
}

async function onDistributionCreated() {
  editingDistribution.value = null
  selectedNeedId.value = null
  selectedDistributionType.value = null
  showDistModal.value = false
  await Promise.all([refreshDistributions(), refreshNeeds(), refreshAttachments()])
}

/** Deleting needs a live connection (it isn't queued): a clear message beats a raw fetch error. */
function requireOnline() {
  if (outbox.online) return true
  toast.error(t('offline.needsConnection'))
  return false
}

async function deleteBeneficiary() {
  if (!requireOnline()) return
  if (!beneficiary.value || !confirm(t('beneficiaries.deleteConfirm', { name: beneficiary.value.full_name }))) return
  pageError.value = ''
  const { error } = await supabase.rpc('soft_delete_beneficiary', { p_id: id })
  if (error) {
    pageError.value = error.message
    return
  }
  await logAction('beneficiary_deleted', 'beneficiary', id, { full_name: beneficiary.value.full_name })
  toast.success(t('toast.beneficiaryDeleted'))
  clearNuxtData('beneficiaries')
  await navigateTo('/beneficiaries')
}

async function deleteDistribution(dist: AidDistribution) {
  if (!requireOnline()) return
  if (!confirm(t('beneficiaries.history.deleteConfirm'))) return
  pageError.value = ''
  const { error } = await supabase.rpc('soft_delete_distribution', { p_id: dist.id })
  if (error) {
    pageError.value = error.message
    return
  }
  await logAction('distribution_deleted', 'aid_distribution', dist.id, { beneficiary_id: id, type: dist.type, amount: dist.amount })
  toast.success(t('toast.distributionDeleted'))
  await Promise.all([refreshDistributions(), refreshNeeds()])
}

async function addNote() {
  if (!orgStore.currentOrgId || !noteBody.value.trim()) return
  savingNote.value = true
  pageError.value = ''
  const noteId = crypto.randomUUID()
  const result = await write.insert(
    'beneficiary_notes',
    {
      id: noteId,
      organization_id: orgStore.currentOrgId,
      beneficiary_id: id,
      body: noteBody.value.trim(),
      created_by: user.value?.id,
      // Written now, even if it only reaches the server later.
      created_at: new Date().toISOString(),
    },
    `${t('beneficiaries.notes.add')}: ${beneficiary.value?.full_name ?? ''}`,
  )
  savingNote.value = false
  if (!result.ok) {
    pageError.value = result.error
    return
  }
  await logAction('note_added', 'beneficiary_note', noteId, { beneficiary_id: id })
  write.confirm(result, t('toast.noteAdded'))
  noteBody.value = ''
  if (!result.queued) await refreshNotes()
}

async function deleteNote(noteId: string) {
  if (!requireOnline()) return
  if (!confirm(t('beneficiaries.notes.deleteConfirm'))) return
  const { error } = await supabase.from('beneficiary_notes').delete().eq('id', noteId)
  if (error) {
    pageError.value = error.message
    return
  }
  await logAction('note_deleted', 'beneficiary_note', noteId, { beneficiary_id: id })
  await refreshNotes()
}

function mapNeedTypeToDistribution(type: BeneficiaryNeed['type']): AidDistribution['type'] {
  const mapping: Record<BeneficiaryNeed['type'], AidDistribution['type']> = {
    food: 'food_package',
    medicine: 'medicine',
    rent: 'rent_payment',
    surgery: 'surgery_support',
    education: 'education_support',
    utilities: 'utilities',
    other: 'other',
  }
  return mapping[type]
}

async function openFile(storagePath: string) {
  // Opening the window synchronously avoids popup blockers; the signed URL is filled in after.
  const win = window.open('', '_blank')
  const { data, error } = await supabase.storage.from('attachments').createSignedUrl(storagePath, 300)
  if (error || !data?.signedUrl) {
    win?.close()
    pageError.value = error?.message ?? t('beneficiaries.attachments.openFailed')
    return
  }
  if (win) win.location.href = data.signedUrl
  else window.location.href = data.signedUrl
}

async function uploadAttachment(event: Event) {
  attachmentError.value = ''
  if (!outbox.online) {
    attachmentError.value = t('offline.needsConnection')
    ;(event.target as HTMLInputElement).value = ''
    return
  }
  if (!orgStore.currentOrgId || !user.value) return
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) {
    attachmentError.value = t('beneficiaries.attachments.fileTooLarge')
    target.value = ''
    return
  }
  if (!(file.type.startsWith('image/') || file.type === 'application/pdf')) {
    attachmentError.value = t('beneficiaries.attachments.invalidType')
    target.value = ''
    return
  }
  uploading.value = true
  const ext = file.name.split('.').pop() ?? 'bin'
  const objectPath = `${orgStore.currentOrgId}/beneficiaries/${id}/attachments/${Date.now()}-${crypto.randomUUID()}.${ext}`
  const { error: uploadErr } = await supabase.storage.from('attachments').upload(objectPath, file, { upsert: false })
  if (uploadErr) {
    uploading.value = false
    attachmentError.value = uploadErr.message
    return
  }
  // Store the storage path, not a public URL — signed URLs are generated on demand.
  const { data, error: insertErr } = await supabase
    .from('beneficiary_attachments')
    .insert({
      organization_id: orgStore.currentOrgId,
      beneficiary_id: id,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_url: objectPath,
      uploaded_by: user.value.id,
    })
    .select('id')
    .single()
  uploading.value = false
  if (insertErr) {
    attachmentError.value = insertErr.message
    return
  }
  await logAction('attachment_uploaded', 'beneficiary_attachment', data.id, { beneficiary_id: id, file_name: file.name })
  toast.success(t('toast.fileUploaded'))
  target.value = ''
  await refreshAttachments()
}
</script>
