<template>
  <div class="w-full max-w-md">
    <div class="bg-white rounded-2xl p-8 shadow-dialog">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-ink-900">{{ $t('auth.resetPassword.title') }}</h1>
        <p class="text-ink-500 text-sm mt-1">{{ $t('auth.resetPassword.subtitle') }}</p>
      </div>

      <div v-if="linkInvalid" class="text-center space-y-4">
        <p class="text-sm text-danger-600">{{ $t('auth.resetPassword.linkInvalid') }}</p>
        <NuxtLink to="/forgot-password" class="text-brand-600 font-medium underline text-sm">{{ $t('auth.resetPassword.requestNew') }}</NuxtLink>
      </div>

      <form v-else class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <Label class="block text-sm font-medium text-ink-700 mb-1.5" for="rp-password">{{ $t('auth.resetPassword.newPassword') }}</Label>
          <Input
            id="rp-password"
            v-model="password"
            :aria-invalid="error ? 'true' : undefined"
            :aria-describedby="error ? 'form-error' : undefined"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
            class="w-full"
          />
        </div>
        <div>
          <Label class="block text-sm font-medium text-ink-700 mb-1.5" for="rp-password-confirm">{{ $t('auth.resetPassword.confirmPassword') }}</Label>
          <Input
            id="rp-password-confirm"
            v-model="confirmPassword"
            :aria-invalid="error ? 'true' : undefined"
            :aria-describedby="error ? 'form-error' : undefined"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
            class="w-full"
          />
        </div>

        <p v-if="error" id="form-error" role="alert" class="text-danger-600 text-sm">{{ error }}</p>
        <p v-if="success" class="text-brand-700 text-sm">{{ success }}</p>

        <Button type="submit" :disabled="loading" class="w-full mt-2" size="lg">
          {{ loading ? $t('auth.resetPassword.submitting') : $t('auth.resetPassword.submit') }}
        </Button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "auth" });

const { t } = useI18n()
useHead(() => ({ title: `${t("auth.resetPassword.title")} — Amanah` }));
const supabase = useSupabaseClient();
const authError = useAuthError()
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const error = ref("");
const success = ref("");
const linkInvalid = ref(false);

// The recovery link signs the user in (PKCE code exchange). Without a session —
// expired link, or opened on another device/browser — updating the password can't work.
onMounted(async () => {
  const { data } = await supabase.auth.getSession();
  linkInvalid.value = !data.session;
});

async function handleSubmit() {
  error.value = "";
  success.value = "";
  if (password.value !== confirmPassword.value) {
    error.value = t('auth.resetPassword.mismatch');
    return;
  }
  loading.value = true;
  const { error: updateErr } = await supabase.auth.updateUser({ password: password.value });
  loading.value = false;
  if (updateErr) {
    error.value = authError(updateErr);
    return;
  }
  success.value = t('auth.resetPassword.success');
  // The recovery link already signed them in.
  setTimeout(() => {
    navigateTo("/dashboard");
  }, 800);
}
</script>
