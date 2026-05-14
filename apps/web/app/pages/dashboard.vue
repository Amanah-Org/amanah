<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">{{ $t('dashboard.title') }}</h1>
        <p class="section-subtitle">{{ $t('dashboard.subtitle') }}</p>
      </div>
    </div>

    <!-- Metrics Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card v-for="metric in metrics" :key="metric.label" class="p-5">
        <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">{{ metric.label }}</p>
        <p class="text-2xl font-bold text-slate-900 mt-1">
          <span v-if="pending" class="block h-7 w-16 rounded-lg bg-slate-100 animate-pulse" />
          <template v-else>{{ metric.value }}</template>
        </p>
        <Badge
          v-if="metric.badge"
          class="mt-2"
          :class="metric.badgeClass"
        >{{ metric.badge }}</Badge>
      </Card>
    </div>

    <!-- Two-column layout -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Upcoming Recurring Needs -->
      <Card class="p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">{{ $t('dashboard.upcomingNeeds.title') }}</h2>
          <NuxtLink to="/beneficiaries" class="text-sm text-brand-600 hover:text-brand-700 font-medium">
            {{ $t('dashboard.upcomingNeeds.viewAll') }}
          </NuxtLink>
        </div>

        <div v-if="!upcomingNeeds?.length" class="text-sm text-slate-400 py-4 text-center">
          {{ $t('dashboard.upcomingNeeds.empty') }}
        </div>

        <ul v-else class="divide-y divide-surface-200 -mx-1">
          <li
            v-for="need in upcomingNeeds"
            :key="need.id"
            class="flex items-center justify-between px-1 py-3"
          >
            <div class="min-w-0">
              <p class="text-sm font-medium text-slate-800 truncate">{{ need.beneficiary?.full_name }}</p>
              <p class="text-xs text-slate-500 capitalize">{{ need.type }} · {{ need.frequency }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0 ml-2">
              <Badge :class="urgencyClass(need.urgency)">{{ need.urgency }}</Badge>
            </div>
          </li>
        </ul>
      </Card>

      <!-- Recent Distributions -->
      <Card class="p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="section-title">{{ $t('dashboard.recentDistributions.title') }}</h2>
          <NuxtLink to="/beneficiaries" class="text-sm text-brand-600 hover:text-brand-700 font-medium">
            {{ $t('dashboard.recentDistributions.viewAll') }}
          </NuxtLink>
        </div>

        <div v-if="!recentDistributions?.length" class="text-sm text-slate-400 py-4 text-center">
          {{ $t('dashboard.recentDistributions.empty') }}
        </div>

        <ul v-else class="divide-y divide-surface-200 -mx-1">
          <li
            v-for="dist in recentDistributions"
            :key="dist.id"
            class="flex items-center justify-between px-1 py-3"
          >
            <div class="min-w-0">
              <p class="text-sm font-medium text-slate-800 truncate">{{ dist.beneficiary?.full_name }}</p>
              <p class="text-xs text-slate-500 capitalize">{{ dist.type.replace(/_/g, ' ') }}</p>
            </div>
            <div class="text-right shrink-0 ml-2">
              <p v-if="dist.amount" class="text-sm font-semibold text-slate-800">${{ dist.amount }}</p>
              <p class="text-xs text-slate-400">{{ formatDate(dist.distribution_date) }}</p>
            </div>
          </li>
        </ul>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AidDistribution, BeneficiaryNeed } from '@amanah/types'

useHead({ title: 'Dashboard — Amanah' })

const { t } = useI18n()
const supabase = useSupabaseClient()
const orgStore = useOrgStore()

const { data: stats, pending } = await useAsyncData('dashboard-stats', async () => {
  const orgId = orgStore.currentOrgId
  if (!orgId) return null

  const [
    { count: total },
    { count: active },
    { count: recurring },
    { count: urgent },
    { data: donationAgg },
    { data: distAgg },
    { count: thisMonth },
  ] = await Promise.all([
    supabase.from('beneficiaries').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).is('deleted_at', null),
    supabase.from('beneficiaries').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'active').is('deleted_at', null),
    supabase.from('beneficiary_needs').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'active').is('deleted_at', null),
    supabase.from('beneficiary_needs').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).eq('status', 'active').in('urgency', ['high', 'critical']).is('deleted_at', null),
    supabase.from('donations').select('amount').eq('organization_id', orgId).is('deleted_at', null),
    supabase.from('aid_distributions').select('amount').eq('organization_id', orgId).is('deleted_at', null),
    supabase.from('aid_distributions').select('*', { count: 'exact', head: true }).eq('organization_id', orgId).gte('distribution_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)).is('deleted_at', null),
  ])

  const totalDonations = (donationAgg ?? []).reduce((s, d) => s + (d.amount ?? 0), 0)
  const totalDistributed = (distAgg ?? []).reduce((s, d) => s + (d.amount ?? 0), 0)

  return { total, active, recurring, urgent, totalDonations, totalDistributed, balance: totalDonations - totalDistributed, thisMonth }
}, { watch: [() => orgStore.currentOrgId] })

const metrics = computed(() => [
  { label: t('dashboard.metrics.totalBeneficiaries'), value: stats.value?.total ?? 0 },
  {
    label: t('dashboard.metrics.activeCases'),
    value: stats.value?.active ?? 0,
    badge: stats.value?.urgent ? t('dashboard.metrics.urgent', { n: stats.value.urgent }) : undefined,
    badgeClass: 'badge-red',
  },
  { label: t('dashboard.metrics.totalDonations'), value: `$${(stats.value?.totalDonations ?? 0).toLocaleString()}` },
  {
    label: t('dashboard.metrics.balanceRemaining'),
    value: `$${(stats.value?.balance ?? 0).toLocaleString()}`,
    badge: stats.value?.thisMonth ? t('dashboard.metrics.thisMonth', { n: stats.value.thisMonth }) : undefined,
    badgeClass: 'badge-green',
  },
])

const { data: upcomingNeeds } = await useAsyncData('upcoming-needs', async () => {
  const orgId = orgStore.currentOrgId
  if (!orgId) return []
  const { data } = await supabase
    .from('beneficiary_needs')
    .select('*, beneficiary:beneficiaries(id, full_name)')
    .eq('organization_id', orgId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('urgency', { ascending: false })
    .limit(5)
  return (data ?? []) as (BeneficiaryNeed & { beneficiary: { id: string; full_name: string } | null })[]
}, { watch: [() => orgStore.currentOrgId] })

const { data: recentDistributions } = await useAsyncData('recent-distributions', async () => {
  const orgId = orgStore.currentOrgId
  if (!orgId) return []
  const { data } = await supabase
    .from('aid_distributions')
    .select('*, beneficiary:beneficiaries(id, full_name)')
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .order('distribution_date', { ascending: false })
    .limit(5)
  return (data ?? []) as (AidDistribution & { beneficiary: { id: string; full_name: string } | null })[]
}, { watch: [() => orgStore.currentOrgId] })

function urgencyClass(u: string) {
  return { low: 'badge-slate', medium: 'badge-yellow', high: 'badge-red', critical: 'badge-red' }[u] ?? 'badge-slate'
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>
