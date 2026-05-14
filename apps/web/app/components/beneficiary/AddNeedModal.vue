<template>
  <Dialog :open="true" @update:open="!$event && $emit('close')">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ $t('needs.modal.title') }}</DialogTitle>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="n-type" class="mb-1.5 block">{{ $t('needs.modal.type') }}</Label>
            <select id="n-type" v-model="form.type" class="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required>
              <option value="">{{ $t('common.select') }}</option>
              <option v-for="nt in needTypes" :key="nt" :value="nt" class="capitalize">{{ nt }}</option>
            </select>
          </div>
          <div>
            <Label for="n-frequency" class="mb-1.5 block">{{ $t('needs.modal.frequency') }}</Label>
            <select id="n-frequency" v-model="form.frequency" class="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required>
              <option value="">{{ $t('common.select') }}</option>
              <option value="one_time">{{ $t('needs.modal.frequencyOneTime') }}</option>
              <option value="weekly">{{ $t('needs.modal.frequencyWeekly') }}</option>
              <option value="monthly">{{ $t('needs.modal.frequencyMonthly') }}</option>
              <option value="yearly">{{ $t('needs.modal.frequencyYearly') }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="n-urgency" class="mb-1.5 block">{{ $t('needs.modal.urgency') }}</Label>
            <select id="n-urgency" v-model="form.urgency" class="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <option value="low">{{ $t('needs.modal.urgencyLow') }}</option>
              <option value="medium">{{ $t('needs.modal.urgencyMedium') }}</option>
              <option value="high">{{ $t('needs.modal.urgencyHigh') }}</option>
              <option value="critical">{{ $t('needs.modal.urgencyCritical') }}</option>
            </select>
          </div>
          <div>
            <Label for="n-cost" class="mb-1.5 block">{{ $t('needs.modal.estCost') }}</Label>
            <Input id="n-cost" v-model.number="form.estimated_cost" type="number" min="0" placeholder="0" />
          </div>
        </div>

        <div>
          <Label for="n-description" class="mb-1.5 block">{{ $t('needs.modal.description') }}</Label>
          <Textarea id="n-description" v-model="form.description" class="resize-none" rows="2" :placeholder="$t('needs.modal.descriptionPlaceholder')" />
        </div>

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

        <DialogFooter class="sm:justify-start">
          <Button type="button" variant="secondary" class="flex-1" @click="$emit('close')">{{ $t('common.cancel') }}</Button>
          <Button type="submit" :disabled="loading" class="flex-1">
            {{ loading ? $t('needs.modal.submitting') : $t('needs.modal.submit') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { CreateNeedForm, NeedType, NeedFrequency } from '@amanah/types'

const props = defineProps<{ beneficiaryId: string }>()
const emit = defineEmits<{ close: []; created: [] }>()

const { t } = useI18n()
const supabase = useSupabaseClient()
const orgStore = useOrgStore()
const { logAction } = useAuditLog()
const loading = ref(false)
const error = ref('')

const needTypes: NeedType[] = ['food', 'medicine', 'rent', 'surgery', 'education', 'utilities', 'other']

const form = reactive<Partial<CreateNeedForm>>({
  type: undefined,
  frequency: undefined,
  urgency: 'medium',
  estimated_cost: undefined,
  description: '',
})

async function handleSubmit() {
  if (!orgStore.currentOrgId) {
    error.value = t('common.noOrg')
    return
  }
  if (!form.type || !form.frequency) return
  loading.value = true
  error.value = ''

  const { data, error: err } = await supabase
    .from('beneficiary_needs')
    .insert({
      beneficiary_id: props.beneficiaryId,
      organization_id: orgStore.currentOrgId,
      type: form.type,
      frequency: form.frequency,
      urgency: form.urgency ?? 'medium',
      estimated_cost: form.estimated_cost,
      description: form.description,
    })
    .select('id')
    .single()

  loading.value = false
  if (err) error.value = err.message
  else {
    await logAction('need_created', 'beneficiary_need', data.id, {
      beneficiary_id: props.beneficiaryId,
      type: form.type,
      frequency: form.frequency,
    })
    emit('created')
  }
}
</script>
