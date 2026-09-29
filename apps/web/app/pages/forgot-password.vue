<template>
  <div class="w-full max-w-md">
    <div class="bg-white rounded-2xl p-8 shadow-dialog">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-ink-900">{{ $t('auth.forgotPassword.title') }}</h1>
        <p class="text-ink-500 text-sm mt-1">{{ $t('auth.forgotPassword.subtitle') }}</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <Label class="block text-sm font-medium text-ink-700 mb-1.5" for="fp-email">
            {{ $t('auth.forgotPassword.email') }}
          </Label>
          <Input
            id="fp-email"
            v-model="email"
            :aria-invalid="error ? 'true' : undefined"
            :aria-describedby="error ? 'form-error' : undefined"
            type="email"
            dir="ltr"
            autocomplete="email"
            required
            placeholder="you@example.com"
            class="w-full"
          />
        </div>

        <p v-if="error" id="form-error" role="alert" class="text-danger-600 text-sm">{{ error }}</p>
        <p v-if="success" class="text-brand-700 text-sm">{{ success }}</p>

        <Button type="submit" :disabled="loading" class="w-full mt-2" size="lg">
          {{ loading ? $t('auth.forgotPassword.submitting') : $t('auth.forgotPassword.submit') }}
        </Button>
      </form>

      <p class="text-center text-sm text-ink-500 mt-6">
        <NuxtLink to="/login" class="text-brand-600 font-medium hover:text-brand-800 hover:underline">{{ $t('auth.forgotPassword.backToLogin') }}</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "auth" });

const { t } = useI18n()
useHead(() => ({ title: `${t("auth.forgotPassword.title")} — Amanah` }));
const supabase = useSupabaseClient();
const authError = useAuthError()
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
    error.value = authError(resetErr);
    return;
  }
  success.value = t('auth.forgotPassword.success');
}
</script>
