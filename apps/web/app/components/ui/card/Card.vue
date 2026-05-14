<script setup lang="ts">
import type { HTMLAttributes } from "vue"


const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    :class="
      cn(
        'rounded-2xl border border-surface-200 bg-white text-slate-900 shadow-card',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
