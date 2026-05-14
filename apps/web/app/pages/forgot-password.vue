<template>
  <div class="w-full max-w-md">
    <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-white">{{ $t('auth.forgotPassword.title') }}</h1>
        <p class="text-brand-200 text-sm mt-1">{{ $t('auth.forgotPassword.subtitle') }}</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <Label class="block text-sm font-medium text-brand-100 mb-1.5" for="fp-email">
            {{ $t('auth.forgotPassword.email') }}
          </Label>
          <Input
            id="fp-email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
            class="w-full bg-white/10 text-white border-white/20 placeholder:text-white/40 focus-visible:ring-brand-400/30"
          />
        </div>

        <p v-if="error" class="text-red-300 text-sm">{{ error }}</p>
        <p v-if="success" class="text-green-300 text-sm">{{ success }}</p>

        <Button type="submit" :disabled="loading" class="w-full mt-2 bg-brand-600 hover:bg-brand-700 text-white" size="lg">
          {{ loading ? $t('auth.forgotPassword.submitting') : $t('auth.forgotPassword.submit') }}
        </Button>
      </form>

      <p class="text-center text-sm text-brand-200 mt-6">
        <NuxtLink to="/login" class="text-white font-medium hover:underline">{{ $t('auth.forgotPassword.backToLogin') }}</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "auth" });
useHead({ title: "Forgot Password — Amanah" });

const { t } = useI18n()
const supabase = useSupabaseClient();
const email = ref("");
const loading = ref(false);
const error = ref("");
const success = ref("");

async function handleSubmit() {
  loading.value = true;
  error.value = "";
  success.value = "";
  const redirectTo = `${window.location.origin}/reset-password`;
  const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.value, { redirectTo });
  loading.value = false;
  if (resetErr) {
    error.value = resetErr.message;
    return;
  }
  success.value = t('auth.forgotPassword.success');
}
</script>
