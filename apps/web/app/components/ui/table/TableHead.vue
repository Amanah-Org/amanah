<script setup lang="ts">
import type { HTMLAttributes } from "vue"


const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <th :class="cn('h-11 px-4 text-start align-middle text-xs font-semibold text-ink-500 [&:has([role=checkbox])]:pe-0', props.class)">
    <slot />
  </th>
</template>
