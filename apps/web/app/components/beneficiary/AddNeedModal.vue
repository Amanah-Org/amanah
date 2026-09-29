<template>
  <Dialog :open="true" @update:open="!$event && $emit('close')">
    <DialogContent class="sm:max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? $t('needs.modal.editTitle') : $t('needs.modal.title') }}</DialogTitle>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="n-type" class="mb-1.5 block">{{ $t('needs.modal.type') }}</Label>
            <select id="n-type" v-model="form.type" :class="selectClass" required>
              <option value="">{{ $t('common.select') }}</option>
              <option v-for="nt in needTypes" :key="nt" :value="nt">{{ label('needType', nt) }}</option>
            </select>
          </div>
          <div>
            <Label for="n-frequency" class="mb-1.5 block">{{ $t('needs.modal.frequency') }}</Label>
            <select id="n-frequency" v-model="form.frequency" :class="selectClass" required>
              <option value="">{{ $t('common.select') }}</option>
              <option v-for="f in frequencies" :key="f" :value="f">{{ label('frequency', f) }}</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="n-urgency" class="mb-1.5 block">{{ $t('needs.modal.urgency') }}</Label>
            <select id="n-urgency" v-model="form.urgency" :class="selectClass">
              <option v-for="u in urgencies" :key="u" :value="u">{{ label('urgency', u) }}</option>
            </select>
          </div>
          <div>
            <Label for="n-cost" class="mb-1.5 block">{{ $t('needs.modal.estCost') }}</Label>
            <Input id="n-cost" v-model.number="form.estimated_cost" type="number" min="0" step="0.01" placeholder="0" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="n-start" class="mb-1.5 block">{{ $t('needs.modal.startDate') }}</Label>
            <Input id="n-start" v-model="form.start_date" type="date" />
          </div>
          <div>
            <Label for="n-end" class="mb-1.5 block">{{ $t('needs.modal.endDate') }}</Label>
            <Input id="n-end" v-model="form.end_date" type="date" :min="form.start_date || undefined" />
          </div>
        </div>

        <div>
          <Label for="n-description" class="mb-1.5 block">{{ $t('needs.modal.description') }}</Label>
          <Textarea id="n-description" v-model="form.description" class="resize-none" rows="2" :placeholder="$t('needs.modal.descriptionPlaceholder')" />
        </div>

        <p v-if="error" class="text-sm text-danger-600">{{ error }}</p>

        <DialogFooter class="sm:justify-start gap-2">
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
import type { BeneficiaryNeed, NeedFrequency, NeedType, NeedUrgency } from '@amanah/types'

const props = defineProps<{ beneficiaryId: string; need?: BeneficiaryNeed | null }>()
const emit = defineEmits<{ close: []; created: [] }>()

const selectClass =
  'input'

const { t } = useI18n()
const { label } = useFormat()
const orgStore = useOrgStore()
const { logAction } = useAuditLog()
const write = useOfflineWrite()
const loading = ref(false)
const error = ref('')
const isEdit = computed(() => !!props.need)

const needTypes: NeedType[] = ['food', 'medicine', 'rent', 'surgery', 'education', 'utilities', 'other']
const frequencies: NeedFrequency[] = ['one_time', 'weekly', 'monthly', 'yearly']
const urgencies: NeedUrgency[] = ['low', 'medium', 'high', 'critical']

const form = reactive({
  type: (props.need?.type ?? '') as NeedType | '',
  frequency: (props.need?.frequency ?? '') as NeedFrequency | '',
  urgency: (props.need?.urgency ?? 'medium') as NeedUrgency,
  estimated_cost: (props.need?.estimated_cost ?? '') as number | '',
  start_date: props.need?.start_date ?? '',
  end_date: props.need?.end_date ?? '',
  description: props.need?.description ?? '',
})

async function handleSubmit() {
  if (!orgStore.currentOrgId) {
    error.value = t('common.noOrg')
    return
  }
  if (!form.type || !form.frequency) return
  loading.value = true
  error.value = ''

  const values = {
    type: form.type,
    frequency: form.frequency,
    urgency: form.urgency,
    estimated_cost: form.estimated_cost === '' ? null : form.estimated_cost,
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    description: form.description.trim() || null,
  }

  const typeLabel = label('needType', form.type)
  if (props.need) {
    const result = await write.update('beneficiary_needs', props.need.id, values, `${t('needs.modal.editTitle')}: ${typeLabel}`)
    loading.value = false
    if (!result.ok) {
      error.value = result.error
      return
    }
    await logAction('need_updated', 'beneficiary_need', props.need.id, { beneficiary_id: props.beneficiaryId, ...values })
    write.confirm(result, t('toast.needUpdated'))
    emit('created')
    return
  }

  const id = crypto.randomUUID()
  const result = await write.insert(
    'beneficiary_needs',
    { id, ...values, beneficiary_id: props.beneficiaryId, organization_id: orgStore.currentOrgId },
    `${t('needs.modal.title')}: ${typeLabel}`,
  )
  loading.value = false
  if (!result.ok) {
    error.value = result.error
    return
  }
  await logAction('need_created', 'beneficiary_need', id, {
    beneficiary_id: props.beneficiaryId,
    type: form.type,
    frequency: form.frequency,
  })
  write.confirm(result, t('toast.needCreated'))
  emit('created')
}
</script>
