<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { locale, locales } = useI18n()

const currentLocale = computed(() => locales.value.find((l) => l.code === locale.value))

useHead(() => ({
  htmlAttrs: {
    lang: currentLocale.value?.language ?? 'en',
    dir: currentLocale.value?.dir ?? 'ltr',
  },
}))
</script>
