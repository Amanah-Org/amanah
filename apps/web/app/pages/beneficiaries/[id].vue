<template>
  <div v-if="pending" class="flex justify-center py-12">
    <svg class="animate-spin w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  </div>

  <div v-else-if="!beneficiary" class="text-center py-12">
    <p class="text-slate-500">{{ $t('beneficiaries.notFound') }}</p>
    <NuxtLink to="/beneficiaries" class="btn-secondary mt-4 inline-flex">{{ $t('beneficiaries.back') }}</NuxtLink>
  </div>

  <div v-else>
    <!-- Header -->
    <div class="mb-6">
      <NuxtLink to="/beneficiaries" class="text-sm text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1 mb-3">
        {{ $t('beneficiaries.backToBeneficiaries') }}
      </NuxtLink>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">{{ beneficiary.full_name }}</h1>
          <div class="flex items-center gap-2 mt-1">
            <Badge :class="statusClass(beneficiary.status)">{{ beneficiary.status }}</Badge>
            <span class="text-sm text-slate-500">{{ beneficiary.city }}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <Button variant="secondary" size="sm" @click="showEditModal = true">{{ $t('common.edit') }}</Button>
          <Button size="sm" @click="openDistributionModal()">{{ $t('beneficiaries.addDistribution') }}</Button>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-surface-200 mb-6">
      <nav class="flex gap-0 overflow-x-auto -mb-px">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="px-4 py-2.5 text-sm font-medium border-b-2 shrink-0 transition-colors"
          :class="[
            activeTab === tab.id
              ? 'border-brand-600 text-brand-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200',
          ]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Tab: Personal Info -->
    <Card v-if="activeTab === 'info'" class="max-w-2xl p-6">
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
        <InfoRow :label="$t('beneficiaries.info.fullName')" :value="beneficiary.full_name" />
        <InfoRow :label="$t('beneficiaries.info.phone')" :value="beneficiary.phone" />
        <InfoRow :label="$t('beneficiaries.info.nationalId')" :value="beneficiary.national_id" />
        <InfoRow :label="$t('beneficiaries.info.gender')" :value="beneficiary.gender" />
        <InfoRow :label="$t('beneficiaries.info.birthDate')" :value="beneficiary.birth_date" />
        <InfoRow :label="$t('beneficiaries.info.city')" :value="beneficiary.city" />
        <InfoRow :label="$t('beneficiaries.info.address')" :value="beneficiary.address" />
        <InfoRow :label="$t('beneficiaries.info.familySize')" :value="beneficiary.family_size?.toString()" />
        <InfoRow :label="$t('beneficiaries.info.employment')" :value="beneficiary.employment_status" />
        <InfoRow :label="$t('beneficiaries.info.monthlyIncome')" :value="beneficiary.monthly_income ? `$${beneficiary.monthly_income}` : undefined" />
        <InfoRow :label="$t('beneficiaries.info.category')" :value="beneficiary.category" />
        <InfoRow :label="$t('beneficiaries.info.healthConditions')" :value="beneficiary.health_conditions" class="sm:col-span-2" />
      </dl>
    </Card>

    <!-- Tab: Needs -->
    <div v-else-if="activeTab === 'needs'">
      <div class="flex justify-end mb-4">
        <Button size="sm" @click="showNeedModal = true">{{ $t('beneficiaries.needs.addButton') }}</Button>
      </div>
      <Card v-if="!needs?.length" class="text-center text-slate-400 py-8">{{ $t('beneficiaries.needs.empty') }}</Card>
      <div v-else class="space-y-3">
        <Card v-for="need in needs" :key="need.id" class="p-5 flex items-start justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <p class="font-semibold text-slate-800 capitalize">{{ need.type }}</p>
              <Badge :class="urgencyClass(need.urgency)">{{ need.urgency }}</Badge>
              <Badge class="badge-slate capitalize">{{ need.frequency.replace('_', ' ') }}</Badge>
            </div>
            <p v-if="need.description" class="text-sm text-slate-500">{{ need.description }}</p>
            <p v-if="need.estimated_cost" class="text-sm text-slate-500 mt-1">
              {{ $t('beneficiaries.needs.estCost', { cost: need.estimated_cost }) }}
            </p>
            <div class="flex flex-wrap items-center gap-2 mt-3">
              <Button size="sm" @click="markNeedAsDistributed(need)">{{ $t('beneficiaries.needs.markDistributed') }}</Button>
              <Button
                v-if="need.status !== 'completed'"
                size="sm"
                variant="secondary"
                @click="updateNeedStatus(need.id, 'completed')"
              >
                {{ $t('beneficiaries.needs.complete') }}
              </Button>
              <Button
                v-if="need.status === 'active'"
                size="sm"
                variant="secondary"
                @click="updateNeedStatus(need.id, 'paused')"
              >
                {{ $t('beneficiaries.needs.pause') }}
              </Button>
              <Button
                v-if="need.status === 'paused'"
                size="sm"
                variant="secondary"
                @click="updateNeedStatus(need.id, 'active')"
              >
                {{ $t('beneficiaries.needs.activate') }}
              </Button>
            </div>
          </div>
          <Badge class="shrink-0" :class="needStatusClass(need.status)">{{ need.status }}</Badge>
        </Card>
      </div>
    </div>

    <!-- Tab: Distribution History -->
    <div v-else-if="activeTab === 'history'">
      <Card v-if="!distributions?.length" class="text-center text-slate-400 py-8">{{ $t('beneficiaries.history.empty') }}</Card>
      <div v-else class="space-y-3">
        <Card v-for="dist in distributions" :key="dist.id" class="p-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="font-semibold text-slate-800 capitalize">{{ dist.type.replace(/_/g, ' ') }}</p>
              <p v-if="dist.notes" class="text-sm text-slate-500 mt-0.5">{{ dist.notes }}</p>
            </div>
            <div class="text-right shrink-0">
              <p v-if="dist.amount" class="font-semibold text-slate-900">${{ dist.amount }}</p>
              <p class="text-xs text-slate-400 mt-0.5">{{ formatDate(dist.distribution_date) }}</p>
            </div>
          </div>
          <a
            v-if="dist.proof_attachment_url"
            :href="dist.proof_attachment_url"
            target="_blank"
            class="text-xs text-brand-600 hover:underline mt-2 inline-block"
          >{{ $t('beneficiaries.history.viewProof') }}</a>
        </Card>
      </div>
    </div>

    <!-- Tab: Attachments -->
    <div v-else-if="activeTab === 'attachments'">
      <Card class="p-5 mb-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="font-semibold text-slate-900">{{ $t('beneficiaries.attachments.title') }}</h3>
            <p class="text-xs text-slate-500 mt-1">{{ $t('beneficiaries.attachments.hint') }}</p>
          </div>
          <Input type="file" accept="image/*,application/pdf" class="max-w-xs" @change="uploadAttachment" />
        </div>
        <p v-if="attachmentError" class="text-sm text-red-500 mt-3">{{ attachmentError }}</p>
      </Card>

      <Card v-if="!allAttachments.length" class="text-center text-slate-400 py-8">{{ $t('beneficiaries.attachments.empty') }}</Card>
      <div v-else class="space-y-3">
        <Card v-for="file in allAttachments" :key="file.id" class="p-4 flex items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="font-medium text-slate-800 truncate">{{ file.file_name }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ file.file_type }} · {{ formatBytes(file.file_size) }}</p>
          </div>
          <a :href="file.file_url" target="_blank" class="text-sm text-brand-600 hover:underline shrink-0">{{ $t('beneficiaries.attachments.view') }}</a>
        </Card>
      </div>
    </div>

    <!-- Tab: Notes -->
    <Card v-else-if="activeTab === 'notes'" class="max-w-2xl p-6">
      <p v-if="beneficiary.notes" class="text-slate-700 whitespace-pre-wrap">{{ beneficiary.notes }}</p>
      <p v-else class="text-slate-400 text-sm">{{ $t('beneficiaries.notes.empty') }}</p>
    </Card>

    <!-- Modals -->
    <AddNeedModal
      v-if="showNeedModal"
      :beneficiary-id="beneficiary.id"
      @close="showNeedModal = false"
      @created="refreshNeeds"
    />
    <AddDistributionModal
      v-if="showDistModal"
      :beneficiary-id="beneficiary.id"
      :initial-need-id="selectedNeedId"
      :initial-type="selectedDistributionType"
      @close="showDistModal = false"
      @created="onDistributionCreated"
    />
  </div>
</template>

<script setup lang="ts">
import type { Beneficiary, BeneficiaryNeed, AidDistribution } from '@amanah/types'

const route = useRoute()
const { t } = useI18n()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const orgStore = useOrgStore()
const { logAction } = useAuditLog()
const id = route.params.id as string

const showEditModal = ref(false)
const showNeedModal = ref(false)
const showDistModal = ref(false)
const activeTab = ref('info')
const selectedNeedId = ref<string | null>(null)
const selectedDistributionType = ref<AidDistribution['type'] | null>(null)
const attachmentError = ref('')

const tabs = computed(() => [
  { id: 'info', label: t('beneficiaries.tabs.info') },
  { id: 'needs', label: t('beneficiaries.tabs.needs') },
  { id: 'history', label: t('beneficiaries.tabs.history') },
  { id: 'attachments', label: t('beneficiaries.tabs.attachments') },
  { id: 'notes', label: t('beneficiaries.tabs.notes') },
])

const { data: beneficiary, pending } = await useAsyncData(`beneficiary-${id}`, async () => {
  const { data } = await supabase
    .from('beneficiaries')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  return data as Beneficiary | null
})

useHead(() => ({
  title: beneficiary.value ? `${beneficiary.value.full_name} — Amanah` : 'Beneficiary — Amanah',
}))

const { data: needs, refresh: refreshNeeds } = await useAsyncData(`needs-${id}`, async () => {
  const { data } = await supabase
    .from('beneficiary_needs')
    .select('*')
    .eq('beneficiary_id', id)
    .is('deleted_at', null)
    .order('urgency', { ascending: false })
  return (data ?? []) as BeneficiaryNeed[]
})

const { data: distributions, refresh: refreshDistributions } = await useAsyncData(`distributions-${id}`, async () => {
  const { data } = await supabase
    .from('aid_distributions')
    .select('*')
    .eq('beneficiary_id', id)
    .is('deleted_at', null)
    .order('distribution_date', { ascending: false })
  return (data ?? []) as AidDistribution[]
})

type BeneficiaryAttachment = {
  id: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
}

const { data: attachments, refresh: refreshAttachments } = await useAsyncData(`attachments-${id}`, async () => {
  const { data } = await supabase
    .from('beneficiary_attachments')
    .select('id, file_name, file_type, file_size, file_url')
    .eq('beneficiary_id', id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  return (data ?? []) as BeneficiaryAttachment[]
})

const allAttachments = computed(() => {
  const uploaded = attachments.value ?? []
  const proofFiles = (distributions.value ?? [])
    .filter((d) => !!d.proof_attachment_url)
    .map((d) => ({
      id: `proof-${d.id}`,
      file_name: t('beneficiaries.attachments.proof', { date: formatDate(d.distribution_date) }),
      file_type: 'proof',
      file_size: 0,
      file_url: d.proof_attachment_url as string,
    }))
  return [...uploaded, ...proofFiles]
})

function statusClass(s: string) {
  return { active: 'badge-green', inactive: 'badge-slate', archived: 'badge-yellow' }[s] ?? 'badge-slate'
}
function urgencyClass(u: string) {
  return { low: 'badge-slate', medium: 'badge-yellow', high: 'badge-red', critical: 'badge-red' }[u] ?? 'badge-slate'
}
function needStatusClass(s: string) {
  return { active: 'badge-green', completed: 'badge-blue', paused: 'badge-yellow' }[s] ?? 'badge-slate'
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function formatBytes(size: number) {
  if (!size) return '—'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

async function updateNeedStatus(needId: string, status: 'active' | 'paused' | 'completed') {
  const { error } = await supabase.from('beneficiary_needs').update({ status }).eq('id', needId)
  if (error) return
  await logAction('need_status_updated', 'beneficiary_need', needId, { status })
  await refreshNeeds()
}

function markNeedAsDistributed(need: BeneficiaryNeed) {
  selectedNeedId.value = need.id
  selectedDistributionType.value = mapNeedTypeToDistribution(need.type)
  showDistModal.value = true
}

function openDistributionModal() {
  selectedNeedId.value = null
  selectedDistributionType.value = null
  showDistModal.value = true
}

async function onDistributionCreated() {
  selectedNeedId.value = null
  selectedDistributionType.value = null
  showDistModal.value = false
  await Promise.all([refreshDistributions(), refreshNeeds(), refreshAttachments()])
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

async function uploadAttachment(event: Event) {
  attachmentError.value = ''
  if (!orgStore.currentOrgId || !user.value) return
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) {
    attachmentError.value = t('beneficiaries.attachments.fileTooLarge')
    target.value = ''
    return
  }
  const validType = file.type.startsWith('image/') || file.type === 'application/pdf'
  if (!validType) {
    attachmentError.value = t('beneficiaries.attachments.invalidType')
    target.value = ''
    return
  }
  const ext = file.name.split('.').pop() ?? 'bin'
  const objectPath = `${orgStore.currentOrgId}/beneficiaries/${id}/attachments/${Date.now()}-${crypto.randomUUID()}.${ext}`
  const { error: uploadErr } = await supabase.storage.from('attachments').upload(objectPath, file, { upsert: false })
  if (uploadErr) {
    attachmentError.value = uploadErr.message
    return
  }
  const { data: publicUrl } = supabase.storage.from('attachments').getPublicUrl(objectPath)
  const { data, error: insertErr } = await supabase
    .from('beneficiary_attachments')
    .insert({
      organization_id: orgStore.currentOrgId,
      beneficiary_id: id,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_url: publicUrl.publicUrl,
      uploaded_by: user.value.id,
    })
    .select('id')
    .single()
  if (insertErr) {
    attachmentError.value = insertErr.message
    return
  }
  await logAction('attachment_uploaded', 'beneficiary_attachment', data.id, {
    beneficiary_id: id,
    file_name: file.name,
  })
  target.value = ''
  await refreshAttachments()
}
</script>
