<template>
  <div
    class="fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 pointer-events-none"
    role="status"
    aria-live="polite"
  >
    <TransitionGroup
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0"
    >
      <button
        v-for="toast in toasts"
        :key="toast.id"
        type="button"
        class="pointer-events-auto flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-dialog max-w-sm w-full sm:w-auto text-start"
        :class="toneClass[toast.tone]"
        @click="dismiss(toast.id)"
      >
        <svg v-if="toast.tone === 'success'" class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        <span>{{ toast.message }}</span>
      </button>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { ToastTone } from '~/composables/useToast'

const { toasts, dismiss } = useToast()

const toneClass: Record<ToastTone, string> = {
  success: 'bg-ink-900 text-white',
  info: 'bg-warning-50 text-warning-900 ring-1 ring-warning-200',
  error: 'bg-danger-600 text-white',
}
</script>
