<template>
  <div class="min-h-screen bg-canvas">
    <header class="bg-white border-b border-surface-200">
      <div class="page-container py-5 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <h1 class="font-bold text-ink-900">{{ stats?.org_name ?? 'Amanah' }}</h1>
            <p class="text-xs text-ink-500">{{ $t('public.subtitle') }}</p>
          </div>
        </div>
        <LanguageSwitcher />
      </div>
    </header>

    <div v-if="pending" class="flex justify-center py-20">
      <svg class="animate-spin w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else-if="!stats" class="text-center py-20">
      <p class="text-ink-500">{{ $t('public.notFound') }}</p>
    </div>

    <div v-else class="page-container py-10">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div v-for="card in cards" :key="card.key" class="card text-center">
          <p class="text-2xl sm:text-3xl font-bold text-brand-700">{{ card.value }}</p>
          <p class="text-sm text-ink-500 mt-1">{{ $t(`public.${card.key}`) }}</p>
        </div>
      </div>

      <p class="text-xs text-ink-500 text-center">{{ $t('public.disclaimer') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const slug = route.params.organizationSlug as string
const { t } = useI18n()
const { formatMoney } = useFormat()

const supabase = useSupabaseClient()

const { data: stats, pending } = await useAsyncData(`public-${slug}`, async () => {
  const { data } = await supabase.from('public_org_stats').select('*').eq('slug', slug).maybeSingle()
  return data
})

useHead(() => ({ title: `${stats.value?.org_name ?? 'Amanah'} — ${t('public.subtitle')}` }))

const cards = computed(() => [
  { key: 'families', value: Number(stats.value?.total_families ?? 0).toLocaleString() },
  { key: 'distributed', value: formatMoney(stats.value?.total_distributed) },
  { key: 'medical', value: Number(stats.value?.medical_distributions ?? 0).toLocaleString() },
  { key: 'food', value: Number(stats.value?.food_distributions ?? 0).toLocaleString() },
])
</script>
