<template>
  <div class="min-h-screen bg-canvas">
    <!-- Nav -->
    <header class="page-container flex items-center justify-between py-5">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <span class="font-bold text-ink-900 text-lg">Amanah</span>
      </div>
      <div class="flex items-center gap-2 sm:gap-3">
        <LanguageSwitcher />
        <NuxtLink v-if="user" to="/dashboard" class="btn-primary btn-sm">{{ $t('landing.openApp') }}</NuxtLink>
        <template v-else>
          <NuxtLink to="/login" class="btn-ghost btn-sm">{{ $t('auth.login.submit') }}</NuxtLink>
          <NuxtLink to="/signup" class="btn-primary btn-sm hidden sm:inline-flex">{{ $t('landing.getStarted') }}</NuxtLink>
        </template>
      </div>
    </header>

    <!-- Hero -->
    <section class="page-container pt-12 pb-20 sm:pt-20 text-center">
      <p class="inline-block text-xs font-semibold tracking-wide uppercase text-brand-800 bg-brand-100 rounded-full px-3 py-1 mb-5">
        {{ $t('landing.eyebrow') }}
      </p>
      <h1 class="text-4xl sm:text-5xl font-bold text-ink-900 max-w-3xl mx-auto leading-tight">{{ $t('landing.heroTitle') }}</h1>
      <p class="text-lg text-ink-600 max-w-2xl mx-auto mt-5">{{ $t('landing.heroBody') }}</p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <NuxtLink :to="user ? '/dashboard' : '/signup'" class="btn-primary btn-lg">
          {{ user ? $t('landing.openApp') : $t('landing.ctaPrimary') }}
        </NuxtLink>
        <a href="#features" class="btn-outline btn-lg">{{ $t('landing.ctaSecondary') }}</a>
      </div>
    </section>

    <!-- Problem → features -->
    <section id="features" class="bg-white border-y border-surface-200 py-20">
      <div class="page-container">
        <h2 class="text-2xl sm:text-3xl font-bold text-center text-ink-900">{{ $t('landing.featuresTitle') }}</h2>
        <p class="text-ink-600 text-center max-w-2xl mx-auto mt-3">{{ $t('landing.featuresBody') }}</p>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          <div v-for="f in features" :key="f.key" class="card bg-canvas shadow-none">
            <div class="w-10 h-10 rounded-xl bg-white text-brand-700 ring-1 ring-brand-200 flex items-center justify-center mb-4">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                <path stroke-linecap="round" stroke-linejoin="round" :d="f.icon" />
              </svg>
            </div>
            <h3 class="font-semibold text-ink-900">{{ $t(`landing.features.${f.key}.title`) }}</h3>
            <p class="text-sm text-ink-600 mt-1.5">{{ $t(`landing.features.${f.key}.body`) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Transparency -->
    <section class="page-container py-20 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-ink-900">{{ $t('landing.transparencyTitle') }}</h2>
        <p class="text-ink-600 mt-4">{{ $t('landing.transparencyBody') }}</p>
        <ul class="mt-5 space-y-2 text-sm text-ink-700">
          <li v-for="i in 3" :key="i" class="flex gap-2">
            <Check class="w-4 h-4 mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />{{ $t(`landing.transparencyPoints.${i - 1}`) }}
          </li>
        </ul>
      </div>
      <div class="card grid grid-cols-2 gap-4 text-center" aria-hidden="true">
        <div v-for="s in sampleStats" :key="s.key" class="rounded-xl bg-canvas p-5">
          <p class="text-2xl font-bold text-brand-700">{{ s.value }}</p>
          <p class="text-xs text-ink-500 mt-1">{{ $t(`public.${s.key}`) }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-brand-600 text-white">
      <div class="page-container py-16 text-center">
        <h2 class="text-2xl sm:text-3xl font-bold text-white">{{ $t('landing.ctaTitle') }}</h2>
        <p class="text-brand-100 mt-3">{{ $t('landing.ctaBody') }}</p>
        <NuxtLink :to="user ? '/dashboard' : '/signup'" class="btn bg-white text-brand-800 hover:bg-brand-50 active:bg-brand-100 btn-lg mt-8 inline-flex">
          {{ user ? $t('landing.openApp') : $t('landing.ctaPrimary') }}
        </NuxtLink>
      </div>
    </section>

    <footer class="page-container py-8 text-center text-xs text-ink-500">© {{ year }} Amanah</footer>
  </div>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'

definePageMeta({ layout: false })

const { t } = useI18n()
useHead({ title: () => `Amanah — ${t('landing.eyebrow')}` })

const user = useSupabaseUser()
const year = new Date().getFullYear()

const features = [
  { key: 'profiles', icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z' },
  { key: 'recurring', icon: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182' },
  { key: 'distributions', icon: 'M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21' },
  { key: 'duplicates', icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z' },
  { key: 'roles', icon: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
  { key: 'mobile', icon: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3' },
]

const sampleStats = [
  { key: 'families', value: '1,240' },
  { key: 'distributed', value: '$86k' },
  { key: 'medical', value: '312' },
  { key: 'food', value: '4,580' },
]
</script>
