<script setup lang="ts">
import type { SelectTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { ChevronDown } from "lucide-vue-next"
import { SelectIcon, SelectTrigger, useForwardProps } from "reka-ui"


const props = defineProps<SelectTriggerProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectTrigger
    v-bind="forwardedProps"
    :class="cn(
      'flex h-11 sm:h-10 w-full items-center justify-between rounded-xl border border-input bg-white px-3.5 py-2 text-base sm:text-sm text-ink-900 transition-colors data-[placeholder]:text-ink-400 data-[state=open]:border-brand-600 disabled:cursor-not-allowed disabled:bg-surface-100 disabled:text-ink-500 aria-[invalid=true]:border-danger-600 aria-[invalid=true]:bg-danger-50/40 [&>span]:truncate text-start',
      props.class,
    )"
  >
    <slot />
    <SelectIcon as-child>
      <ChevronDown class="w-4 h-4 text-ink-500 shrink-0" />
    </SelectIcon>
  </SelectTrigger>
</template>
