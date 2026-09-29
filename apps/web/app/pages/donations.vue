<template>
  <div>
    <div class="page-header gap-3">
      <div>
        <h1 class="text-2xl font-bold text-ink-900">{{ $t('donations.title') }}</h1>
        <p class="section-subtitle">{{ $t('donations.subtitle') }}</p>
      </div>
      <Button v-if="orgStore.canWrite" id="add-donation-btn" class="shrink-0" @click="openModal()">{{ $t('donations.addButton') }}</Button>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
      <Card class="p-5">
        <p class="text-xs font-medium text-ink-500 uppercase tracking-wide">{{ $t('donations.summary.totalDonations') }}</p>
        <p class="text-2xl font-bold text-ink-900 mt-1">{{ formatMoney(totalDonations) }}</p>
      </Card>
      <Card class="p-5">
        <p class="text-xs font-medium text-ink-500 uppercase tracking-wide">{{ $t('donations.summary.totalDistributed') }}</p>
        <p class="text-2xl font-bold text-ink-900 mt-1">{{ formatMoney(totalDistributed) }}</p>
      </Card>
      <Card class="col-span-2 sm:col-span-1 p-5">
        <p class="text-xs font-medium text-ink-500 uppercase tracking-wide">{{ $t('donations.summary.balance') }}</p>
        <p class="text-2xl font-bold mt-1" :class="balance >= 0 ? 'text-brand-700' : 'text-danger-600'">{{ formatMoney(balance) }}</p>
      </Card>
    </div>

    <!-- Table -->
    <Card class="overflow-hidden p-0">
      <Table class="w-full text-sm">
        <TableHeader class="bg-surface-50 border-b border-surface-200">
          <TableRow>
            <TableHead class="text-start px-5 py-3 font-medium text-ink-500">{{ $t('donations.table.donor') }}</TableHead>
            <TableHead class="text-start px-5 py-3 font-medium text-ink-500">{{ $t('donations.table.amount') }}</TableHead>
            <TableHead class="text-start px-5 py-3 font-medium text-ink-500 hidden sm:table-cell">{{ $t('donations.table.method') }}</TableHead>
            <TableHead class="text-start px-5 py-3 font-medium text-ink-500">{{ $t('donations.table.date') }}</TableHead>
            <TableHead v-if="orgStore.isAdmin" class="px-3 py-3 hidden sm:table-cell" />
          </TableRow>
        </TableHeader>
        <TableBody class="divide-y divide-surface-200">
          <TableRow v-if="pending && !donations?.length">
            <TableCell :colspan="5" class="px-5 py-8 text-center text-ink-400">{{ $t('donations.table.loading') }}</TableCell>
          </TableRow>
          <TableRow v-else-if="!donations?.length">
            <TableCell :colspan="5" class="px-5 py-8 text-center text-ink-400">{{ $t('donations.table.empty') }}</TableCell>
          </TableRow>
          <TableRow v-for="d in pendingDonations" :key="d.id" class="bg-warning-50/60">
            <TableCell class="px-5 py-3.5 font-medium text-ink-800">
              {{ d.is_anonymous ? $t('donations.table.anonymous') : (d.donor_name ?? '—') }}
              <p class="text-xs font-normal text-warning-700">{{ $t('offline.waitingToSync') }}</p>
            </TableCell>
            <TableCell class="px-5 py-3.5 font-semibold text-ink-900">{{ formatMoney(d.amount) }}</TableCell>
            <TableCell class="px-5 py-3.5 text-ink-600 hidden sm:table-cell">{{ label('paymentMethod', d.payment_method) }}</TableCell>
            <TableCell class="px-5 py-3.5 text-ink-500">{{ formatDate(d.donated_at.slice(0, 10)) }}</TableCell>
            <TableCell v-if="orgStore.isAdmin" class="hidden sm:table-cell" />
          </TableRow>
          <TableRow
            v-for="d in donations"
            :key="d.id"
            class="hover:bg-brand-50 transition-colors"
            :class="{ 'cursor-pointer': orgStore.isAdmin }"
            @click="orgStore.isAdmin && openModal(d)"
          >
            <TableCell class="px-5 py-3.5 font-medium text-ink-800">
              {{ d.is_anonymous ? $t('donations.table.anonymous') : (d.donor_name ?? '—') }}
            </TableCell>
            <TableCell class="px-5 py-3.5 font-semibold text-ink-900">{{ formatMoney(d.amount) }}</TableCell>
            <TableCell class="px-5 py-3.5 text-ink-600 hidden sm:table-cell">
              {{ label('paymentMethod', d.payment_method) }}
            </TableCell>
            <!-- Stored as a timestamp at UTC midnight: show the calendar date, not a timezone-shifted one. -->
            <TableCell class="px-5 py-3.5 text-ink-500">{{ formatDate(d.donated_at.slice(0, 10)) }}</TableCell>
            <!-- On phones the row itself opens the editor, which also offers Delete. -->
            <TableCell v-if="orgStore.isAdmin" class="px-3 py-3.5 text-end whitespace-nowrap hidden sm:table-cell">
              <button class="text-xs text-ink-400 hover:text-brand-700 me-3" @click.stop="openModal(d)">{{ $t('common.edit') }}</button>
              <button class="text-xs text-ink-400 hover:text-danger-600" @click.stop="deleteDonation(d)">{{ $t('common.delete') }}</button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>

    <!-- Add Donation Modal -->
    <Dialog :open="showModal" @update:open="showModal = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ editing ? $t('donations.modal.editTitle') : $t('donations.modal.title') }}</DialogTitle>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="handleAddDonation">
          <div class="flex items-center gap-3">
            <input id="is_anon" v-model="donationForm.is_anonymous" type="checkbox" class="rounded">
            <Label for="is_anon" class="flex-1 py-3 sm:py-0 cursor-pointer">{{ $t('donations.modal.isAnonymous') }}</Label>
          </div>

          <div v-if="!donationForm.is_anonymous">
            <Label for="donor_name" class="mb-1.5 block">{{ $t('donations.modal.donorName') }}</Label>
            <Input id="donor_name" v-model="donationForm.donor_name" :placeholder="$t('donations.modal.donorNamePlaceholder')" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="d-amount" class="mb-1.5 block">{{ $t('donations.modal.amount') }}</Label>
              <Input id="d-amount" v-model.number="donationForm.amount" type="number" inputmode="decimal" min="0.01" step="0.01" required :placeholder="$t('donations.modal.amountPlaceholder')" />
            </div>
            <div>
              <Label for="d-method" class="mb-1.5 block">{{ $t('donations.modal.method') }}</Label>
              <select id="d-method" v-model="donationForm.payment_method" class="input">
                <option value="">{{ $t('donations.modal.methodSelect') }}</option>
                <option value="cash">{{ $t('donations.modal.cash') }}</option>
                <option value="bank_transfer">{{ $t('donations.modal.bankTransfer') }}</option>
                <option value="wallet">{{ $t('donations.modal.wallet') }}</option>
                <option value="other">{{ $t('donations.modal.other') }}</option>
              </select>
            </div>
          </div>

          <div>
            <Label for="d-donated_at" class="mb-1.5 block">{{ $t('donations.modal.date') }}</Label>
            <Input id="d-donated_at" v-model="donationForm.donated_at" type="date" required />
          </div>

          <div>
            <Label for="d-dnotes" class="mb-1.5 block">{{ $t('donations.modal.notes') }}</Label>
            <Textarea id="d-dnotes" v-model="donationForm.notes" class="resize-none" rows="2" />
          </div>

          <p v-if="donationError" class="text-sm text-danger-600">{{ donationError }}</p>

          <button v-if="editing" type="button" class="text-sm text-danger-600 hover:underline" @click="deleteDonation(editing!)">
            {{ $t('common.delete') }}
          </button>

          <DialogFooter class="sm:justify-start gap-2">
            <Button type="button" variant="secondary" class="flex-1" @click="showModal = false">{{ $t('common.cancel') }}</Button>
            <Button type="submit" :disabled="donationLoading" class="flex-1">
              {{ donationLoading ? $t('donations.modal.submitting') : editing ? $t('common.save') : $t('donations.modal.submit') }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { Donation, OrgSummary } from '@amanah/types'

const { t } = useI18n()
useHead({ title: () => `${t('donations.title')} — Amanah` })
const { formatDate, formatMoney, label } = useFormat()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const orgStore = useOrgStore()
const { logAction } = useAuditLog()
const write = useOfflineWrite()
const toast = useToast()
const outbox = useOutboxStore()
const showModal = ref(false)
/** Donation being edited (admins), or null when recording a new one. */
const editing = ref<Donation | null>(null)
const donationLoading = ref(false)
const donationError = ref('')

const donationForm = reactive({
  is_anonymous: false,
  donor_name: '',
  amount: undefined as number | undefined,
  payment_method: '',
  donated_at: localToday(),
  notes: '',
})

const { data: donations, pending, refresh } = await useAsyncData('donations', async (nuxtApp) => {
  const orgId = orgStore.currentOrgId
  if (!orgId) return []
  const res = await supabase
    .from('donations')
    .select('*')
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .order('donated_at', { ascending: false })
  return keepOnNetworkError(nuxtApp, 'donations', res, (res.data ?? []) as Donation[])
}, { watch: [() => orgStore.currentOrgId], ...keepWhenOffline })

// The queue lives in this browser only; render it after hydration to match the server HTML.
const mounted = ref(false)
onMounted(() => (mounted.value = true))
const pendingDonations = computed(() =>
  mounted.value ? (outbox.pendingInserts('donations', (r) => r.organization_id === orgStore.currentOrgId) as unknown as Donation[]) : [],
)

// Totals come from the database: summing rows client-side is capped by PostgREST's row limit.
const { data: summary, refresh: refreshSummary } = await useAsyncData('donations-summary', async (nuxtApp) => {
  const orgId = orgStore.currentOrgId
  if (!orgId) return null
  const res = await supabase.rpc('org_summary', { p_org_id: orgId }).single()
  return keepOnNetworkError(nuxtApp, 'donations-summary', res, res.data as OrgSummary | null)
}, { watch: [() => orgStore.currentOrgId], ...keepWhenOffline })

const totalDonations = computed(() => Number(summary.value?.total_donations ?? 0))
const totalDistributed = computed(() => Number(summary.value?.total_distributed ?? 0))
const balance = computed(() => totalDonations.value - totalDistributed.value)

function openModal(donation: Donation | null = null) {
  editing.value = donation
  Object.assign(donationForm, {
    is_anonymous: donation?.is_anonymous ?? false,
    donor_name: donation?.donor_name ?? '',
    amount: donation?.amount ?? undefined,
    payment_method: donation?.payment_method ?? '',
    donated_at: donation?.donated_at.slice(0, 10) ?? localToday(),
    notes: donation?.notes ?? '',
  })
  donationError.value = ''
  showModal.value = true
}

async function deleteDonation(d: Donation) {
  if (!outbox.online) {
    toast.error(t('offline.needsConnection'))
    return
  }
  if (!confirm(t('donations.deleteConfirm'))) return
  const { error } = await supabase.rpc('soft_delete_donation', { p_id: d.id })
  if (error) {
    toast.error(error.message)
    return
  }
  await logAction('donation_deleted', 'donation', d.id, { amount: d.amount, donor_name: d.donor_name })
  toast.success(t('toast.donationDeleted'))
  showModal.value = false
  editing.value = null
  await Promise.all([refresh(), refreshSummary()])
}

async function handleAddDonation() {
  if (!orgStore.currentOrgId) {
    donationError.value = t('common.noOrg')
    return
  }
  if (!donationForm.is_anonymous && !donationForm.donor_name.trim()) {
    donationError.value = t('donations.modal.donorRequired')
    return
  }
  donationLoading.value = true
  donationError.value = ''

  const values = {
    is_anonymous: donationForm.is_anonymous,
    donor_name: donationForm.is_anonymous ? null : donationForm.donor_name.trim() || null,
    amount: donationForm.amount!,
    payment_method: donationForm.payment_method || null,
    donated_at: donationForm.donated_at,
    notes: donationForm.notes.trim() || null,
  }
  const description = `${values.donor_name ?? t('donations.table.anonymous')} · ${formatMoney(values.amount)}`

  if (editing.value) {
    const before = editing.value
    const result = await write.update('donations', before.id, values, `${t('donations.modal.editTitle')}: ${description}`)
    donationLoading.value = false
    if (!result.ok) {
      donationError.value = result.error
      return
    }
    const changes = Object.fromEntries(
      Object.entries(values)
        .filter(([key, value]) => (key === 'donated_at' ? before.donated_at.slice(0, 10) : before[key as keyof Donation]) !== value)
        .map(([key, value]) => [key, { from: before[key as keyof Donation], to: value }]),
    )
    await logAction('donation_updated', 'donation', before.id, { changes })
    write.confirm(result, t('toast.donationUpdated'))
  } else {
    const id = crypto.randomUUID()
    const result = await write.insert(
      'donations',
      { id, ...values, organization_id: orgStore.currentOrgId, created_by: user.value?.id },
      `${t('donations.modal.title')}: ${description}`,
    )
    donationLoading.value = false
    if (!result.ok) {
      donationError.value = result.error
      return
    }
    await logAction('donation_created', 'donation', id, {
      amount: values.amount,
      payment_method: values.payment_method,
      is_anonymous: values.is_anonymous,
    })
    write.confirm(result, t('toast.donationCreated'))
  }
  showModal.value = false
  editing.value = null
  await Promise.all([refresh(), refreshSummary()])
}
</script>
