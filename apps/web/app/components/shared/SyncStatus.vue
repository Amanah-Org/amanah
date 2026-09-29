<template>
  <div v-if="!outbox.online || outbox.pendingCount || outbox.failed.length" class="border-b text-sm">
    <div v-if="!outbox.online" class="bg-ink-800 text-white px-4 py-2 text-center">
      {{ $t('offline.offline') }}
      <span v-if="outbox.pendingCount" class="font-medium">· {{ $t('offline.pending', { n: outbox.pendingCount }, outbox.pendingCount) }}</span>
    </div>
    <div v-else-if="outbox.pendingCount" class="bg-warning-50 text-warning-900 px-4 py-2 text-center">
      {{ outbox.syncing ? $t('offline.syncing') : $t('offline.waiting') }}
      · {{ $t('offline.pending', { n: outbox.pendingCount }, outbox.pendingCount) }}
      <button v-if="!outbox.syncing" class="underline ms-1" @click="outbox.flush()">{{ $t('offline.retry') }}</button>
    </div>

    <div v-if="outbox.failed.length" class="bg-danger-50 text-danger-800 px-4 py-2">
      <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        <span>{{ $t('offline.failed', { n: outbox.failed.length }, outbox.failed.length) }}</span>
        <button class="underline" @click="expanded = !expanded">{{ expanded ? $t('offline.hide') : $t('offline.review') }}</button>
      </div>
      <ul v-if="expanded" class="max-w-xl mx-auto mt-2 space-y-2">
        <li v-for="item in outbox.failed" :key="item.id" class="bg-white rounded-lg p-3 ring-1 ring-danger-200">
          <p class="font-medium text-ink-800">{{ item.label }}</p>
          <p class="text-xs text-danger-700 mt-0.5 break-words">{{ item.error }}</p>
          <div class="flex gap-3 mt-2 text-xs">
            <button class="underline" @click="outbox.flush(true)">{{ $t('offline.retry') }}</button>
            <button class="underline text-ink-500" @click="discard(item.id)">{{ $t('offline.discard') }}</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const outbox = useOutboxStore()
const { t } = useI18n()
const expanded = ref(false)

function discard(id: string) {
  if (confirm(t('offline.discardConfirm'))) outbox.discard(id)
}
</script>
