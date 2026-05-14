<template>
  <div class="w-full max-w-md">
    <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 mb-4">
          <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white">{{ $t('auth.signup.title') }}</h1>
        <p class="text-brand-200 text-sm mt-1">{{ $t('auth.signup.subtitle') }}</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleSignup">
        <div>
          <Label class="block text-sm font-medium text-brand-100 mb-1.5" for="full_name">{{ $t('auth.signup.fullName') }}</Label>
          <Input
            id="full_name"
            v-model="form.full_name"
            type="text"
            autocomplete="name"
            required
            :placeholder="$t('auth.signup.fullNamePlaceholder')"
            class="w-full bg-white/10 text-white border-white/20 placeholder:text-white/40 focus-visible:ring-brand-400/30"
          />
        </div>

        <div>
          <Label class="block text-sm font-medium text-brand-100 mb-1.5" for="s-email">{{ $t('auth.signup.email') }}</Label>
          <Input
            id="s-email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
            class="w-full bg-white/10 text-white border-white/20 placeholder:text-white/40 focus-visible:ring-brand-400/30"
          />
        </div>

        <div>
          <Label class="block text-sm font-medium text-brand-100 mb-1.5" for="s-password">{{ $t('auth.signup.password') }}</Label>
          <Input
            id="s-password"
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            required
            minlength="8"
            :placeholder="$t('auth.signup.passwordHint')"
            class="w-full bg-white/10 text-white border-white/20 placeholder:text-white/40 focus-visible:ring-brand-400/30"
          />
        </div>

        <p v-if="error" class="text-red-300 text-sm">{{ error }}</p>

        <Button type="submit" :disabled="loading" class="w-full mt-2 bg-brand-600 hover:bg-brand-700 text-white" size="lg">
          <svg v-if="loading" class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ loading ? $t('auth.signup.submitting') : $t('auth.signup.submit') }}
        </Button>
      </form>

      <p class="text-center text-sm text-brand-200 mt-6">
        {{ $t('auth.signup.hasAccount') }}
        <NuxtLink to="/login" class="text-white font-medium hover:underline">{{ $t('auth.signup.signIn') }}</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

useHead({ title: 'Sign Up — Amanah' })

const supabase = useSupabaseClient()
const form = reactive({ full_name: '', email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function handleSignup() {
  loading.value = true
  error.value = ''
  const { error: err } = await supabase.auth.signUp({
    email: form.email,
    password: form.password,
    options: { data: { full_name: form.full_name } },
  })
  loading.value = false
  if (err) {
    error.value = err.message
  } else {
    await navigateTo('/onboarding')
  }
}
</script>
