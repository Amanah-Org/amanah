<template>
  <div />
</template>

<script setup lang="ts">
// Root redirects to dashboard (auth middleware handles unauthenticated users)
await navigateTo('/dashboard')
</script>
