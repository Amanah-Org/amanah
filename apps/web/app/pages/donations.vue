<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">{{ $t('donations.title') }}</h1>
        <p class="section-subtitle">{{ $t('donations.subtitle') }}</p>
      </div>
      <Button id="add-donation-btn" @click="showModal = true">{{ $t('donations.addButton') }}</Button>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
      <Card class="p-5">
        <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">{{ $t('donations.summary.totalDonations') }}</p>
        <p class="text-2xl font-bold text-slate-900 mt-1">${{ totalDonations.toLocaleString() }}</p>
      </Card>
      <Card class="p-5">
        <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">{{ $t('donations.summary.totalDistributed') }}</p>
        <p class="text-2xl font-bold text-slate-900 mt-1">${{ totalDistributed.toLocaleString() }}</p>
      </Card>
      <Card class="col-span-2 sm:col-span-1 p-5">
        <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">{{ $t('donations.summary.balance') }}</p>
        <p class="text-2xl font-bold mt-1" :class="balance >= 0 ? 'text-brand-700' : 'text-red-600'">${{ balance.toLocaleString() }}</p>
      </Card>
    </div>

    <!-- Table -->
    <Card class="overflow-hidden p-0">
      <Table class="w-full text-sm">
        <TableHeader class="bg-surface-50 border-b border-surface-200">
          <TableRow>
            <TableHead class="text-left px-5 py-3 font-medium text-slate-500">{{ $t('donations.table.donor') }}</TableHead>
            <TableHead class="text-left px-5 py-3 font-medium text-slate-500">{{ $t('donations.table.amount') }}</TableHead>
            <TableHead class="text-left px-5 py-3 font-medium text-slate-500 hidden sm:table-cell">{{ $t('donations.table.method') }}</TableHead>
            <TableHead class="text-left px-5 py-3 font-medium text-slate-500">{{ $t('donations.table.date') }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="divide-y divide-surface-200">
          <TableRow v-if="pending">
            <TableCell colspan="4" class="px-5 py-8 text-center text-slate-400">{{ $t('donations.table.loading') }}</TableCell>
          </TableRow>
          <TableRow v-else-if="!donations?.length">
            <TableCell colspan="4" class="px-5 py-8 text-center text-slate-400">{{ $t('donations.table.empty') }}</TableCell>
          </TableRow>
          <TableRow v-for="d in donations" :key="d.id" class="hover:bg-surface-50 transition-colors">
            <TableCell class="px-5 py-3.5 font-medium text-slate-800">
              {{ d.is_anonymous ? $t('donations.table.anonymous') : (d.donor_name ?? '—') }}
            </TableCell>
            <TableCell class="px-5 py-3.5 font-semibold text-slate-900">${{ d.amount.toLocaleString() }}</TableCell>
            <TableCell class="px-5 py-3.5 text-slate-600 capitalize hidden sm:table-cell">
              {{ d.payment_method?.replace(/_/g, ' ') ?? '—' }}
            </TableCell>
            <TableCell class="px-5 py-3.5 text-slate-500">{{ formatDate(d.donated_at) }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>

    <!-- Add Donation Modal -->
    <Dialog :open="showModal" @update:open="showModal = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ $t('donations.modal.title') }}</DialogTitle>
        </DialogHeader>

        <form class="space-y-4" @submit.prevent="handleAddDonation">
          <div class="flex items-center gap-3">
            <input id="is_anon" v-model="donationForm.is_anonymous" type="checkbox" class="rounded" />
            <Label for="is_anon">{{ $t('donations.modal.isAnonymous') }}</Label>
          </div>

          <div v-if="!donationForm.is_anonymous">
            <Label for="donor_name" class="mb-1.5 block">{{ $t('donations.modal.donorName') }}</Label>
            <Input id="donor_name" v-model="donationForm.donor_name" :placeholder="$t('donations.modal.donorNamePlaceholder')" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="d-amount" class="mb-1.5 block">{{ $t('donations.modal.amount') }}</Label>
              <Input id="d-amount" v-model.number="donationForm.amount" type="number" min="0.01" step="0.01" required :placeholder="$t('donations.modal.amountPlaceholder')" />
            </div>
            <div>
              <Label for="d-method" class="mb-1.5 block">{{ $t('donations.modal.method') }}</Label>
              <select id="d-method" v-model="donationForm.payment_method" class="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
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

          <p v-if="donationError" class="text-sm text-red-500">{{ donationError }}</p>

          <DialogFooter class="sm:justify-start">
            <Button type="button" variant="secondary" class="flex-1" @click="showModal = false">{{ $t('common.cancel') }}</Button>
            <Button type="submit" :disabled="donationLoading" class="flex-1">
              {{ donationLoading ? $t('donations.modal.submitting') : $t('donations.modal.submit') }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { Donation } from '@amanah/types'

useHead({ title: 'Donations — Amanah' })

const { t } = useI18n()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const orgStore = useOrgStore()
const { logAction } = useAuditLog()
const showModal = ref(false)
const donationLoading = ref(false)
const donationError = ref('')

const donationForm = reactive({
  is_anonymous: false,
  donor_name: '',
  amount: undefined as number | undefined,
  payment_method: '',
  donated_at: new Date().toISOString().slice(0, 10),
  notes: '',
})

const { data: donations, pending, refresh } = await useAsyncData('donations', async () => {
  const orgId = orgStore.currentOrgId
  if (!orgId) return []
  const { data } = await supabase
    .from('donations')
    .select('*')
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .order('donated_at', { ascending: false })
  return (data ?? []) as Donation[]
}, { watch: [() => orgStore.currentOrgId] })

const { data: distTotal } = await useAsyncData('dist-total', async () => {
  const orgId = orgStore.currentOrgId
  if (!orgId) return []
  const { data } = await supabase
    .from('aid_distributions')
    .select('amount')
    .eq('organization_id', orgId)
    .is('deleted_at', null)
  return data ?? []
}, { watch: [() => orgStore.currentOrgId] })

const totalDonations = computed(() => (donations.value ?? []).reduce((s, d) => s + d.amount, 0))
const totalDistributed = computed(() => (distTotal.value ?? []).reduce((s, d) => s + (d.amount ?? 0), 0))
const balance = computed(() => totalDonations.value - totalDistributed.value)

async function handleAddDonation() {
  if (!orgStore.currentOrgId) {
    donationError.value = t('common.noOrg')
    return
  }
  donationLoading.value = true
  donationError.value = ''

  const { data, error } = await supabase
    .from('donations')
    .insert({
      organization_id: orgStore.currentOrgId,
      is_anonymous: donationForm.is_anonymous,
      donor_name: donationForm.is_anonymous ? null : donationForm.donor_name || null,
      amount: donationForm.amount!,
      payment_method: donationForm.payment_method || null,
      donated_at: donationForm.donated_at,
      notes: donationForm.notes || null,
      created_by: user.value?.id,
    })
    .select('id')
    .single()

  donationLoading.value = false
  if (error) {
    donationError.value = error.message
  } else {
    await logAction('donation_created', 'donation', data.id, {
      amount: donationForm.amount,
      payment_method: donationForm.payment_method || null,
      is_anonymous: donationForm.is_anonymous,
    })
    showModal.value = false
    await refresh()
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
