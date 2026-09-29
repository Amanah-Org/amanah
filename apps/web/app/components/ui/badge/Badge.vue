<script setup lang="ts">
import { normalizeClass, type HTMLAttributes } from "vue"
import type { BadgeVariants } from "."

import { badgeVariants } from "."

const props = defineProps<{
  variant?: BadgeVariants["variant"]
  class?: HTMLAttributes["class"]
}>()

// A `badge-*` color class supplies the colors, so skip the default variant's
// bg/text utilities (tailwind-merge can't tell they conflict).
const resolvedVariant = computed(() =>
  !props.variant && /(^|\s)badge-/.test(normalizeClass(props.class)) ? "tone" : props.variant,
)
</script>

<template>
  <div :class="cn(badgeVariants({ variant: resolvedVariant }), props.class)">
    <slot />
  </div>
</template>
