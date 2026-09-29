<template>
  <div class="w-full max-w-lg">
    <div class="bg-white rounded-2xl p-8 shadow-dialog">
      <h1 class="text-2xl font-bold text-ink-900 mb-1">{{ $t("invite.title") }}</h1>
      <p class="text-ink-500 text-sm mb-6">{{ $t("invite.subtitle") }}</p>

      <p v-if="error" class="text-sm text-danger-600 mb-4">{{ error }}</p>

      <p v-if="initializing" class="text-sm text-ink-500">{{ $t("common.loading") }}</p>

      <div v-else-if="!user" class="space-y-3">
        <p class="text-sm text-ink-700">{{ $t("invite.signInFirst") }}</p>
        <Button @click="navigateTo('/login')">{{ $t("invite.goToSignIn") }}</Button>
      </div>

      <!-- New accounts created by an invite have no password yet. -->
      <form v-else-if="needsPassword" class="space-y-4" @submit.prevent="setPassword">
        <p class="text-sm text-ink-700">{{ $t("invite.setPasswordHint") }}</p>
        <div>
          <Label class="block text-sm font-medium text-ink-700 mb-1.5" for="inv-name">{{ $t("auth.signup.fullName") }}</Label>
          <Input
            id="inv-name"
            v-model="fullName"
            autocomplete="name"
            required
            class="w-full"
          />
        </div>
        <div>
          <Label class="block text-sm font-medium text-ink-700 mb-1.5" for="inv-password">{{ $t("auth.signup.password") }}</Label>
          <Input
            id="inv-password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            minlength="8"
            required
            :placeholder="$t('auth.signup.passwordHint')"
            class="w-full"
          />
        </div>
        <Button type="submit" :disabled="loading" class="w-full">
          {{ loading ? $t("common.saving") : $t("invite.savePassword") }}
        </Button>
      </form>

      <p v-else-if="pendingInvites.length === 0" class="text-sm text-ink-700">
        {{ $t("invite.none") }}
        <NuxtLink to="/dashboard" class="underline">{{ $t("nav.dashboard") }}</NuxtLink>
      </p>

      <ul v-else class="space-y-3">
        <li v-for="invite in pendingInvites" :key="invite.id" class="border border-surface-200 rounded-xl p-4">
          <p class="font-semibold">{{ invite.organization?.name ?? "—" }}</p>
          <p class="text-xs text-ink-500 mt-1">{{ $t("invite.role") }}: {{ $t(`roles.${invite.role}`) }}</p>
          <Button class="mt-3" size="sm" :disabled="loading" @click="accept(invite.organization_id)">
            {{ loading ? $t("invite.accepting") : $t("invite.accept") }}
          </Button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrgRole } from "@amanah/types";

definePageMeta({ layout: "auth" });

const { t } = useI18n();
useHead({ title: () => `${t("invite.title")} — Amanah` });

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const orgStore = useOrgStore();
const initializing = ref(true);
const loading = ref(false);
const error = ref("");
const needsPassword = ref(false);
const fullName = ref("");
const password = ref("");

type PendingInvite = {
  id: string;
  organization_id: string;
  role: OrgRole;
  organization: { id: string; name: string } | null;
};
const pendingInvites = ref<PendingInvite[]>([]);

onMounted(async () => {
  // Supabase invite links carry implicit-flow tokens in the URL hash, which the
  // PKCE browser client refuses to auto-process, so establish the session here.
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  if (hash.get("error_description")) {
    error.value = hash.get("error_description")!;
  }
  if (accessToken && refreshToken) {
    const { data, error: sessionErr } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    history.replaceState(null, "", window.location.pathname);
    if (sessionErr) {
      error.value = sessionErr.message;
    } else {
      user.value = data.user;
      needsPassword.value = hash.get("type") === "invite";
      fullName.value = (data.user?.user_metadata?.full_name as string) ?? "";
    }
  }
  await loadInvites();
  initializing.value = false;
});

async function loadInvites() {
  if (!user.value) return;
  const { data, error: queryErr } = await supabase
    .from("organization_members")
    .select("id, organization_id, role, organization:organizations(id, name)")
    .eq("user_id", user.value.id)
    .eq("status", "pending");
  if (queryErr) {
    error.value = queryErr.message;
    return;
  }
  pendingInvites.value = (data ?? []) as unknown as PendingInvite[];
}

async function setPassword() {
  loading.value = true;
  error.value = "";
  const { error: updateErr } = await supabase.auth.updateUser({
    password: password.value,
    data: { full_name: fullName.value.trim() },
  });
  if (!updateErr && user.value) {
    await supabase.from("profiles").update({ full_name: fullName.value.trim() }).eq("id", user.value.id);
  }
  loading.value = false;
  if (updateErr) {
    error.value = updateErr.message;
    return;
  }
  needsPassword.value = false;
}

async function accept(orgId: string) {
  loading.value = true;
  error.value = "";
  const { error: rpcErr } = await supabase.rpc("accept_org_invite", { p_org_id: orgId });
  if (rpcErr) {
    loading.value = false;
    error.value = rpcErr.message;
    return;
  }
  orgStore.$reset();
  await orgStore.load();
  // Land in the organization just joined, even if the user already belongs to another.
  orgStore.switchOrg(orgId);
  clearNuxtData();
  loading.value = false;
  await navigateTo("/dashboard");
}
</script>
