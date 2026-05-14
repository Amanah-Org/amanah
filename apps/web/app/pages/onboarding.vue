<template>
  <div
    class="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex items-center justify-center p-4"
  >
    <div class="w-full max-w-lg">
      <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-500 mb-4">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21"
              />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">{{ $t('onboarding.title') }}</h1>
          <p class="text-brand-200 text-sm mt-1">{{ $t('onboarding.subtitle') }}</p>
        </div>

        <form class="space-y-5" @submit.prevent="handleCreate">
          <div>
            <Label class="block text-sm font-medium text-brand-100 mb-1.5" for="org_name">{{ $t('onboarding.orgName') }}</Label>
            <Input
              id="org_name"
              v-model="form.name"
              type="text"
              required
              :placeholder="$t('onboarding.orgNamePlaceholder')"
              class="w-full bg-white/10 text-white border-white/20 placeholder:text-white/40 focus-visible:ring-brand-400/30"
              @input="autoSlug"
            />
          </div>

          <div>
            <Label class="block text-sm font-medium text-brand-100 mb-1.5" for="org_slug">{{ $t('onboarding.slug') }}</Label>
            <div
              class="flex items-center rounded-xl border border-white/20 bg-white/10 overflow-hidden focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/30 transition-colors"
            >
              <span class="px-3 text-white/40 text-sm shrink-0">{{ $t('onboarding.slugPrefix') }}</span>
              <input
                id="org_slug"
                v-model="form.slug"
                type="text"
                required
                pattern="[a-z0-9-]+"
                placeholder="al-rahma"
                class="flex-1 bg-transparent px-0 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
            </div>
            <p class="text-white/40 text-xs mt-1">{{ $t('onboarding.slugHint') }}</p>
          </div>

          <p v-if="error" class="text-red-300 text-sm">{{ error }}</p>

          <Button type="submit" :disabled="loading" class="w-full bg-brand-600 hover:bg-brand-700 text-white" size="lg">
            <svg v-if="loading" class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading ? $t('onboarding.submitting') : $t('onboarding.submit') }}
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Organization } from "@amanah/types";

useHead({ title: "Create Organization — Amanah" });
definePageMeta({ layout: false });

const { t } = useI18n()
const user = useSupabaseUser();
const orgStore = useOrgStore();
const form = reactive({ name: "", slug: "" });
const loading = ref(false);
const error = ref("");

function autoSlug() {
  form.slug = form.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

async function handleCreate() {
  if (!user.value) return;
  loading.value = true;
  error.value = "";

  const supabase = useSupabaseClient();

  const { data: org, error: orgErr } = await supabase
    .from("organizations")
    .insert({ name: form.name.trim(), slug: form.slug.trim(), owner_id: user.value.id })
    .select()
    .single();

  if (orgErr) {
    error.value = orgErr.code === "23505"
      ? t('onboarding.slugTaken')
      : orgErr.message;
    loading.value = false;
    return;
  }

  const { error: memberErr } = await supabase
    .from("organization_members")
    .insert({ organization_id: org.id, user_id: user.value.id, role: "admin", status: "active" });

  if (memberErr) {
    await supabase.from("organizations").delete().eq("id", org.id);
    error.value = memberErr.message;
    loading.value = false;
    return;
  }

  orgStore.setOrg(org as Organization, "admin");
  await navigateTo("/dashboard");
  loading.value = false;
}
</script>
