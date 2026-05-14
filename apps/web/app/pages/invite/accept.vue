<template>
  <div class="min-h-screen bg-surface-50 flex items-center justify-center p-4">
    <Card class="w-full max-w-lg p-6">
      <h1 class="text-xl font-semibold text-slate-900 mb-2">Organization Invitation</h1>
      <p class="text-sm text-slate-500 mb-6">Accept your pending invite to join an organization.</p>

      <p v-if="error" class="text-sm text-red-600 mb-4">{{ error }}</p>
      <p v-if="success" class="text-sm text-green-700 mb-4">{{ success }}</p>

      <div v-if="!user" class="space-y-3">
        <p class="text-sm text-slate-600">Sign in first to accept your invitation.</p>
        <Button @click="navigateTo('/login')">Go to Sign In</Button>
      </div>

      <div v-else-if="pendingInvites.length === 0" class="text-sm text-slate-600">
        No pending invitations found for your account.
      </div>

      <ul v-else class="space-y-3">
        <li v-for="invite in pendingInvites" :key="invite.id" class="border border-surface-200 rounded-xl p-4">
          <p class="font-medium text-slate-900">{{ invite.organization?.name ?? "Organization" }}</p>
          <p class="text-xs text-slate-500 mt-1 capitalize">Role: {{ invite.role }}</p>
          <Button
            class="mt-3"
            size="sm"
            :disabled="loading"
            @click="accept(invite.organization_id)"
          >
            {{ loading ? "Accepting..." : "Accept invitation" }}
          </Button>
        </li>
      </ul>
    </Card>
  </div>
</template>

<script setup lang="ts">
useHead({ title: "Accept Invite — Amanah" });

definePageMeta({ layout: false });

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const orgStore = useOrgStore();
const loading = ref(false);
const error = ref("");
const success = ref("");

type PendingInvite = {
  id: string;
  organization_id: string;
  role: string;
  organization: { id: string; name: string } | null;
};

const { data: pendingInvites, refresh } = await useAsyncData("pending-invites", async () => {
  if (!user.value) return [];
  const { data, error: queryErr } = await supabase
    .from("organization_members")
    .select("id, organization_id, role, organization:organizations(id, name)")
    .eq("user_id", user.value.id)
    .eq("status", "pending");

  if (queryErr) {
    error.value = queryErr.message;
    return [];
  }
  return (data ?? []) as PendingInvite[];
});

async function accept(orgId: string) {
  loading.value = true;
  error.value = "";
  success.value = "";
  const { error: rpcErr } = await supabase.rpc("accept_org_invite", { p_org_id: orgId });
  loading.value = false;
  if (rpcErr) {
    error.value = rpcErr.message;
    return;
  }
  success.value = "Invitation accepted. Redirecting to dashboard...";
  await refresh();
  await orgStore.load();
  await navigateTo("/dashboard");
}
</script>
