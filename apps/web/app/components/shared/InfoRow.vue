<template>
  <div v-if="value">
    <dt class="text-xs font-medium text-slate-400 uppercase tracking-wide">{{ label }}</dt>
    <dd class="mt-0.5 text-sm text-slate-800">{{ value }}</dd>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value?: string | null
}>()
</script>
