<template>
  <div class="flex items-center gap-1 rounded-lg bg-white ring-1 ring-brand-200 p-1">
    <button
      v-for="loc in locales"
      :key="loc.code"
      class="flex-1 inline-flex items-center justify-center min-h-11 sm:min-h-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
      :class="locale === loc.code ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-brand-900/[0.06] hover:text-ink-900'"
      @click="setLocale(loc.code)"
    >
      {{ loc.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
</script>
