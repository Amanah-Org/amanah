<template>
  <div class="flex items-center gap-1 rounded-lg bg-surface-100 p-1">
    <button
      v-for="loc in locales"
      :key="loc.code"
      class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
      :class="locale === loc.code ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
      @click="setLocale(loc.code)"
    >
      {{ loc.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
</script>
