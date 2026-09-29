<template>
  <div v-if="value">
    <dt class="text-xs font-medium text-ink-500 uppercase tracking-wide">{{ label }}</dt>
    <!-- The cell keeps the page direction (so it aligns with its label); <bdi> isolates the value so
         mixed-script data (a Latin address in an Arabic page) and numbers (phone, ID) keep their own order. -->
    <dd class="mt-0.5 text-sm text-ink-800"><bdi :dir="ltr ? 'ltr' : 'auto'">{{ value }}</bdi></dd>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value?: string | null
  /** Force left-to-right (phone numbers, national IDs, emails). Otherwise direction follows the value's first strong character. */
  ltr?: boolean
}>()
</script>
