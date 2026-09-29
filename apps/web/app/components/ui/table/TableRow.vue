<script setup lang="ts">
import type { HTMLAttributes } from "vue"


const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <tr :class="cn('border-b border-surface-200 transition-colors hover:bg-brand-50 data-[state=selected]:bg-brand-100', props.class)">
    <slot />
  </tr>
</template>
