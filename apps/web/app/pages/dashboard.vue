<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="text-2xl font-bold text-ink-900">{{ $t('dashboard.title') }}</h1>
        <p class="section-subtitle">{{ $t('dashboard.subtitle') }}</p>
      </div>
    </div>

    <!-- First run: nothing recorded yet -->
    <Card v-if="stats && !stats.total_beneficiaries && orgStore.canWrite" class="p-5 mb-6 border-brand-200 bg-brand-100">
      <h2 class="section-title">{{ $t('dashboard.gettingStarted.title') }}</h2>
      <p class="text-sm text-ink-600 mt-1">{{ $t('dashboard.gettingStarted.body') }}</p>
      <ol class="mt-4 space-y-2 text-sm">
        <li>
          <NuxtLink to="/beneficiaries?add=1" class="text-brand-700 font-medium hover:underline">1. {{ $t('dashboard.gettingStarted.addBeneficiary') }}</NuxtLink>
        </li>
        <li class="text-ink-600">2. {{ $t('dashboard.gettingStarted.addNeed') }}</li>
        <li v-if="orgStore.isAdmin">
          <NuxtLink to="/settings?section=members" class="text-brand-700 font-medium hover:underline">3. {{ $t('dashboard.gettingStarted.invite') }}</NuxtLink>
        </li>
      </ol>
    </Card>

    <!-- On phones the actionable due list comes before the metric cards. -->
    <div class="flex flex-col">
      <div class="order-2 md:order-1 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:mb-8">
        <Card v-for="metric in metrics" :key="metric.label" class="p-4 sm:p-5">
          <p class="text-xs font-medium text-ink-500 uppercase tracking-wide">{{ metric.label }}</p>
          <p class="text-xl sm:text-2xl font-bold mt-1" :class="metric.valueClass ?? 'text-ink-900'">
            <span v-if="pending" class="block h-7 w-16 rounded-lg bg-ink-100 animate-pulse" />
            <template v-else>{{ metric.value }}</template>
          </p>
          <Badge v-if="metric.badge" class="mt-2" :class="metric.badgeClass">{{ metric.badge }}</Badge>
        </Card>
      </div>

      <div class="order-1 md:order-2 grid md:grid-cols-2 gap-6 mb-6 md:mb-0">
        <!-- Due / overdue recurring needs -->
        <Card class="p-5">
          <h2 class="section-title mb-4">{{ $t('dashboard.upcomingNeeds.title') }}</h2>

          <div v-if="!upcomingNeeds?.length" class="text-sm text-ink-400 py-4 text-center">
            {{ stats?.active_needs ? $t('dashboard.upcomingNeeds.empty') : $t('dashboard.upcomingNeeds.noNeeds') }}
          </div>

          <ul v-else class="divide-y divide-surface-200 -mx-1">
            <li v-for="need in upcomingNeeds" :key="need.id" class="flex items-center justify-between gap-2 px-1 py-3">
              <NuxtLink :to="`/beneficiaries/${need.beneficiary_id}?tab=needs`" class="min-w-0 group">
                <p class="text-sm font-medium text-ink-800 truncate group-hover:text-brand-700">{{ need.beneficiary?.full_name }}</p>
                <p class="text-xs text-ink-500">
                  {{ label('needType', need.type) }} · {{ label('frequency', need.frequency) }}
                  <span v-if="dueStatus(need)" :class="dueStatus(need)!.urgent ? 'text-danger-600 font-medium' : 'text-ink-500'"> · {{ dueStatus(need)!.text }}</span>
                </p>
              </NuxtLink>
              <div class="flex items-center gap-2 shrink-0">
                <Badge :class="badge('urgency', need.urgency)">{{ label('urgency', need.urgency) }}</Badge>
                <Button
                  v-if="orgStore.canWrite"
                  size="sm"
                  variant="secondary"
                  @click="navigateTo(`/beneficiaries/${need.beneficiary_id}?tab=needs&distribute=${need.id}`)"
                >
                  {{ $t('dashboard.upcomingNeeds.record') }}
                </Button>
              </div>
            </li>
          </ul>
        </Card>

        <!-- Recent Distributions -->
        <Card class="p-5">
          <h2 class="section-title mb-4">{{ $t('dashboard.recentDistributions.title') }}</h2>

          <div v-if="!recentDistributions?.length" class="text-sm text-ink-400 py-4 text-center">
            {{ $t('dashboard.recentDistributions.empty') }}
          </div>

          <ul v-else class="divide-y divide-surface-200 -mx-1">
            <li v-for="dist in recentDistributions" :key="dist.id" class="px-1">
              <NuxtLink :to="`/beneficiaries/${dist.beneficiary_id}?tab=history`" class="flex items-center justify-between group py-3">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-ink-800 truncate group-hover:text-brand-700">{{ dist.beneficiary?.full_name }}</p>
                  <p class="text-xs text-ink-500">{{ $t(`distributions.types.${dist.type}`) }}</p>
                </div>
                <div class="text-end shrink-0 ms-2">
                  <p v-if="dist.amount" class="text-sm font-semibold text-ink-800">{{ formatMoney(dist.amount) }}</p>
                  <p class="text-xs text-ink-400">{{ formatDate(dist.distribution_date, { month: 'short', day: 'numeric' }) }}</p>
                </div>
              </NuxtLink>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AidDistribution, NeedSchedule, OrgSummary } from '@amanah/types'

const { t } = useI18n()
useHead({ title: () => `${t('dashboard.title')} — Amanah` })

const supabase = useSupabaseClient()
const orgStore = useOrgStore()
const { formatDate, formatMoney, dueStatus, label, badge } = useFormat()

const { data: stats, pending } = await useAsyncData('dashboard-stats', async (nuxtApp) => {
  const orgId = orgStore.currentOrgId
  if (!orgId) return null
  const res = await supabase.rpc('org_summary', { p_org_id: orgId }).single()
  return keepOnNetworkError(nuxtApp, 'dashboard-stats', res, res.data as OrgSummary | null)
}, { watch: [() => orgStore.currentOrgId], ...keepWhenOffline })

const metrics = computed(() => {
  const s = stats.value
  const balance = Number(s?.total_donations ?? 0) - Number(s?.total_distributed ?? 0)
  return [
    { label: t('dashboard.metrics.totalBeneficiaries'), value: s?.total_beneficiaries ?? 0 },
    {
      label: t('dashboard.metrics.activeCases'),
      value: s?.active_beneficiaries ?? 0,
      badge: s?.urgent_needs ? t('dashboard.metrics.urgent', { n: s.urgent_needs }) : undefined,
      badgeClass: 'badge-red',
    },
    { label: t('dashboard.metrics.recurringCases'), value: s?.recurring_needs ?? 0 },
    { label: t('dashboard.metrics.distributionsThisMonth'), value: s?.distributions_this_month ?? 0 },
    { label: t('dashboard.metrics.totalDonations'), value: formatMoney(s?.total_donations) },
    { label: t('dashboard.metrics.totalDistributed'), value: formatMoney(s?.total_distributed) },
    {
      label: t('dashboard.metrics.balanceRemaining'),
      value: formatMoney(balance),
      valueClass: balance < 0 ? 'text-danger-600' : 'text-brand-700',
    },
    { label: t('dashboard.metrics.activeNeeds'), value: s?.active_needs ?? 0 },
  ]
})

const { data: upcomingNeeds } = await useAsyncData('upcoming-needs', async (nuxtApp) => {
  const orgId = orgStore.currentOrgId
  if (!orgId) return []
  const res = await supabase
    .from('need_schedule')
    .select('*, beneficiary:beneficiaries(id, full_name)')
    .eq('organization_id', orgId)
    .eq('status', 'active')
    .not('next_due_date', 'is', null)
    .order('next_due_date', { ascending: true })
    .order('urgency_rank', { ascending: false })
    .limit(8)
  return keepOnNetworkError(nuxtApp, 'upcoming-needs', res, (res.data ?? []) as NeedSchedule[])
}, { watch: [() => orgStore.currentOrgId], ...keepWhenOffline })

const { data: recentDistributions } = await useAsyncData('recent-distributions', async (nuxtApp) => {
  const orgId = orgStore.currentOrgId
  if (!orgId) return []
  const res = await supabase
    .from('aid_distributions')
    .select('*, beneficiary:beneficiaries(id, full_name)')
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .order('distribution_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(8)
  return keepOnNetworkError(nuxtApp, 'recent-distributions', res, (res.data ?? []) as AidDistribution[])
}, { watch: [() => orgStore.currentOrgId], ...keepWhenOffline })
</script>
