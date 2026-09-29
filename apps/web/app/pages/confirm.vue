<template>
  <div class="w-full max-w-md text-center text-white">
    <p class="text-brand-100">{{ error || $t("auth.confirm.waiting") }}</p>
    <NuxtLink v-if="error" to="/login" class="underline text-sm mt-4 inline-block">{{ $t("auth.forgotPassword.backToLogin") }}</NuxtLink>
  </div>
</template>

<script setup lang="ts">
// Supabase email-confirmation callback: the client exchanges the code from the
// URL, then we continue to the app (the org middleware routes to onboarding).
definePageMeta({ layout: "auth" });

const user = useSupabaseUser();
const error = ref("");

onMounted(() => {
  const params = new URLSearchParams(window.location.search + "&" + window.location.hash.slice(1));
  if (params.get("error_description")) error.value = params.get("error_description")!;
});

watch(
  user,
  (u) => {
    if (u) navigateTo("/dashboard");
  },
  { immediate: true },
);
</script>
