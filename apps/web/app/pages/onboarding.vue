<template>
  <div
    class="min-h-screen bg-brand-600 flex items-center justify-center p-4"
  >
    <div class="w-full max-w-lg">
      <div class="bg-white rounded-2xl p-8 shadow-dialog">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-600 mb-4">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21"
              />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-ink-900">{{ $t("onboarding.title") }}</h1>
          <p class="text-ink-500 text-sm mt-1">{{ $t("onboarding.subtitle") }}</p>
        </div>

        <form class="space-y-5" @submit.prevent="handleCreate">
          <div>
            <Label class="block text-sm font-medium text-ink-700 mb-1.5" for="org_name">{{
              $t("onboarding.orgName")
            }}</Label>
            <Input
            id="org_name"
            v-model="form.name"
              :aria-invalid="error ? 'true' : undefined"
              :aria-describedby="error ? 'form-error' : undefined"
              type="text"
              required
              :placeholder="$t('onboarding.orgNamePlaceholder')"
              class="w-full"
            />
          </div>

          <div>
            <Label class="block text-sm font-medium text-ink-700 mb-1.5" for="org_slug">{{
              $t("onboarding.slug")
            }}</Label>
            <div
              class="flex items-center rounded-xl border border-input bg-white overflow-hidden focus-within:border-brand-600 focus-within:outline focus-within:outline-2 focus-within:outline-brand-600 transition-colors"
            >
              <span class="px-3 text-ink-500 text-sm shrink-0">{{ $t("onboarding.slugPrefix") }}</span>
              <input
                id="org_slug"
                v-model="form.slug"
                type="text"
                required
                pattern="[a-z0-9][a-z0-9-]{1,38}[a-z0-9]"
                dir="ltr"
                placeholder="al-rahma"
                class="flex-1 bg-transparent px-0 py-2.5 text-base sm:text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
                @input="slugEdited = true"
              >
            </div>
            <p class="text-ink-500 text-xs mt-1">{{ $t("onboarding.slugHint") }}</p>
          </div>

          <p v-if="error" id="form-error" role="alert" class="text-danger-600 text-sm">{{ error }}</p>

          <Button type="submit" :disabled="loading" class="w-full" size="lg">
            <svg v-if="loading" class="animate-spin w-4 h-4 me-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading ? $t("onboarding.submitting") : $t("onboarding.submit") }}
          </Button>
        </form>

        <p class="text-center text-sm text-ink-500 mt-6">
          <NuxtLink v-if="orgStore.currentOrgId" to="/dashboard" class="hover:text-ink-900 underline">{{ $t("nav.dashboard") }}</NuxtLink>
          <button v-else type="button" class="hover:text-ink-900 underline" @click="signOut">{{ $t("nav.signOut") }}</button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Organization } from "@amanah/types";

definePageMeta({ layout: false });

const { t } = useI18n();
useHead(() => ({ title: `${t("onboarding.title")} — Amanah` }));
const user = useSupabaseUser();
const orgStore = useOrgStore();
const form = reactive({ name: "", slug: "" });
const loading = ref(false);
const error = ref("");

// Non-Latin names (e.g. Arabic) produce no usable characters; fall back to a stable random slug.
const fallbackSlug = `org-${Math.random().toString(36).slice(2, 8)}`;

// Derive the slug from the name until the user edits the slug themselves.
// (A raw @input handler on the name field ran before v-model updated, lagging one keystroke.)
const slugEdited = ref(false);
watch(
  () => form.name,
  () => {
    if (!slugEdited.value) autoSlug();
  },
);

function autoSlug() {
  const slug = form.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  form.slug = slug.length >= 3 ? slug : form.name.trim() ? fallbackSlug : "";
}

async function signOut() {
  await useSupabaseClient().auth.signOut();
  orgStore.$reset();
  await navigateTo("/login");
}

async function handleCreate() {
  if (!user.value) return;
  loading.value = true;
  error.value = "";

  try {
    const org = await $fetch<Organization>("/api/organizations", {
      method: "POST",
      body: { name: form.name.trim(), slug: form.slug.trim() },
    });

    orgStore.setOrg(org, "admin");
    await navigateTo("/dashboard");
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    const message = (err as { statusMessage?: string }).statusMessage;
    error.value =
      status === 409
        ? t("onboarding.slugTaken")
        : message === "invalid_slug"
          ? t("onboarding.slugHint")
          : (message ?? t("onboarding.unknownError"));
  } finally {
    loading.value = false;
  }
}
</script>
