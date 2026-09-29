<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { useVModel } from "@vueuse/core"


const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes["class"]
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
}>()

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <input v-model="modelValue" :class="cn('flex h-11 sm:h-10 w-full rounded-xl border border-input bg-white px-3.5 py-2 text-base sm:text-sm text-ink-900 placeholder:text-ink-400 transition-colors disabled:cursor-not-allowed disabled:bg-surface-100 disabled:text-ink-500 aria-[invalid=true]:border-danger-600 aria-[invalid=true]:bg-danger-50/40', props.class)">
</template>
