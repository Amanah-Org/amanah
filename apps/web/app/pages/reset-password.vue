<template>
  <div class="w-full max-w-md">
    <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-white">{{ $t('auth.resetPassword.title') }}</h1>
        <p class="text-brand-200 text-sm mt-1">{{ $t('auth.resetPassword.subtitle') }}</p>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <Label class="block text-sm font-medium text-brand-100 mb-1.5" for="rp-password">{{ $t('auth.resetPassword.newPassword') }}</Label>
          <Input
            id="rp-password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
            class="w-full bg-white/10 text-white border-white/20 placeholder:text-white/40 focus-visible:ring-brand-400/30"
          />
        </div>
        <div>
          <Label class="block text-sm font-medium text-brand-100 mb-1.5" for="rp-password-confirm">{{ $t('auth.resetPassword.confirmPassword') }}</Label>
          <Input
            id="rp-password-confirm"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
            class="w-full bg-white/10 text-white border-white/20 placeholder:text-white/40 focus-visible:ring-brand-400/30"
          />
        </div>

        <p v-if="error" class="text-red-300 text-sm">{{ error }}</p>
        <p v-if="success" class="text-green-300 text-sm">{{ success }}</p>

        <Button type="submit" :disabled="loading" class="w-full mt-2 bg-brand-600 hover:bg-brand-700 text-white" size="lg">
          {{ loading ? $t('auth.resetPassword.submitting') : $t('auth.resetPassword.submit') }}
        </Button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "auth" });
useHead({ title: "Reset Password — Amanah" });

const { t } = useI18n()
const supabase = useSupabaseClient();
const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const error = ref("");
const success = ref("");

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
    error.value = updateErr.message;
    return;
  }
  success.value = t('auth.resetPassword.success');
  setTimeout(() => {
    navigateTo("/login");
  }, 800);
}
</script>
