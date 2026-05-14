<template>
  <div class="w-full max-w-md">
    <!-- Card -->
    <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 mb-4">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white">{{ $t('auth.login.title') }}</h1>
        <p class="text-brand-200 text-sm mt-1">{{ $t('auth.login.subtitle') }}</p>
      </div>

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <Label class="block text-sm font-medium text-brand-100 mb-1.5" for="email">
            {{ $t('auth.login.email') }}
          </Label>
          <Input
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
            class="w-full bg-white/10 text-white border-white/20 placeholder:text-white/40 focus-visible:ring-brand-400/30"
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1.5">
            <Label class="block text-sm font-medium text-brand-100" for="password">{{ $t('auth.login.password') }}</Label>
            <NuxtLink to="/forgot-password" class="text-xs text-brand-300 hover:text-white transition-colors">
              {{ $t('auth.login.forgotPassword') }}
            </NuxtLink>
          </div>
          <Input
            id="password"
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            required
            placeholder="••••••••"
            class="w-full bg-white/10 text-white border-white/20 placeholder:text-white/40 focus-visible:ring-brand-400/30"
          />
        </div>

        <p v-if="error" class="text-red-300 text-sm">{{ error }}</p>

        <Button
          type="submit"
          :disabled="loading"
          class="w-full mt-2 bg-brand-600 hover:bg-brand-700 text-white"
          size="lg"
        >
          <svg v-if="loading" class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ loading ? $t('auth.login.submitting') : $t('auth.login.submit') }}
        </Button>
      </form>

      <p class="text-center text-sm text-brand-200 mt-6">
        {{ $t('auth.login.noAccount') }}
        <NuxtLink to="/signup" class="text-white font-medium hover:underline">{{ $t('auth.login.signUp') }}</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

useHead({ title: 'Sign In — Amanah' })

const supabase = useSupabaseClient()
const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  const { error: err } = await supabase.auth.signInWithPassword({
    email: form.email,
    password: form.password,
  })
  loading.value = false
  if (err) {
    error.value = err.message
  } else {
    await navigateTo('/dashboard')
  }
}
</script>
