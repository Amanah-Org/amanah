<template>
  <div v-if="orgStore.currentOrg" class="px-3 text-xs">
    <template v-if="orgStore.memberships.length > 1">
      <label for="org-switcher" class="sr-only">{{ $t('nav.switchOrg') }}</label>
      <select
        id="org-switcher"
        :value="orgStore.currentOrgId"
        class="input font-medium"
        @change="onSwitch(($event.target as HTMLSelectElement).value)"
      >
        <option v-for="m in orgStore.memberships" :key="m.org.id" :value="m.org.id" :selected="m.org.id === orgStore.currentOrgId">{{ m.org.name }}</option>
      </select>
    </template>
    <p v-else class="font-medium text-ink-700 truncate">{{ orgStore.currentOrg.name }}</p>
    <p class="text-ink-400 mt-0.5">{{ $t(`enums.role.${orgStore.currentRole}`) }}</p>
  </div>
</template>

<script setup lang="ts">
const orgStore = useOrgStore()

async function onSwitch(orgId: string) {
  if (!orgStore.switchOrg(orgId)) return
  // Pages keyed by record id (e.g. a beneficiary profile) belong to the previous org.
  clearNuxtData()
  await navigateTo('/dashboard')
  await refreshNuxtData()
}
</script>
