<template>
  <Dialog :open="true" @update:open="!$event && $emit('close')">
    <DialogContent class="sm:max-w-xl flex flex-col max-h-[90vh] p-0 gap-0 overflow-hidden">
      <DialogHeader class="px-6 pt-6 pb-0 shrink-0">
        <DialogTitle>{{ $t('beneficiaries.modal.title') }}</DialogTitle>
      </DialogHeader>

      <form class="flex flex-col min-h-0 flex-1" @submit.prevent="handleSubmit">
        <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label for="b-full_name" class="mb-1.5 block">{{ $t('beneficiaries.modal.fullName') }} *</Label>
            <Input id="b-full_name" v-model="form.full_name" required :placeholder="$t('beneficiaries.modal.fullName')" />
          </div>
          <div>
            <Label for="b-city" class="mb-1.5 block">{{ $t('beneficiaries.modal.city') }} *</Label>
            <Input id="b-city" v-model="form.city" required :placeholder="$t('beneficiaries.modal.city')" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label for="b-phone" class="mb-1.5 block">{{ $t('beneficiaries.modal.phone') }}</Label>
            <Input id="b-phone" v-model="form.phone" type="tel" placeholder="+1 234 567 890" />
          </div>
          <div>
            <Label for="b-national_id" class="mb-1.5 block">{{ $t('beneficiaries.modal.nationalId') }}</Label>
            <Input id="b-national_id" v-model="form.national_id" placeholder="ID number" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label for="b-gender" class="mb-1.5 block">{{ $t('beneficiaries.modal.gender') }}</Label>
            <select
              id="b-gender"
              v-model="form.gender"
              class="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{{ $t('common.select') }}</option>
              <option value="male">{{ $t('beneficiaries.modal.genderMale') }}</option>
              <option value="female">{{ $t('beneficiaries.modal.genderFemale') }}</option>
              <option value="other">{{ $t('beneficiaries.modal.genderOther') }}</option>
            </select>
          </div>
          <div>
            <Label for="b-family_size" class="mb-1.5 block">{{ $t('beneficiaries.modal.familySize') }}</Label>
            <Input id="b-family_size" v-model.number="form.family_size" type="number" min="1" placeholder="e.g. 4" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label for="b-income" class="mb-1.5 block">{{ $t('beneficiaries.modal.monthlyIncome') }}</Label>
            <Input id="b-income" v-model.number="form.monthly_income" type="number" min="0" placeholder="0" />
          </div>
          <div>
            <Label for="b-category" class="mb-1.5 block">{{ $t('beneficiaries.modal.category') }}</Label>
            <Input id="b-category" v-model="form.category" :placeholder="$t('beneficiaries.modal.categoryPlaceholder')" />
          </div>
        </div>

        <div>
          <Label for="b-address" class="mb-1.5 block">{{ $t('beneficiaries.modal.address') }}</Label>
          <Input id="b-address" v-model="form.address" :placeholder="$t('beneficiaries.modal.addressPlaceholder')" />
        </div>

        <div>
          <Label for="b-health" class="mb-1.5 block">{{ $t('beneficiaries.modal.healthConditions') }}</Label>
          <Textarea
            id="b-health"
            v-model="form.health_conditions"
            class="resize-none"
            rows="2"
            :placeholder="$t('beneficiaries.modal.healthPlaceholder')"
          />
        </div>

        <div>
          <Label for="b-notes" class="mb-1.5 block">{{ $t('beneficiaries.modal.notes') }}</Label>
          <Textarea
            id="b-notes"
            v-model="form.notes"
            class="resize-none"
            rows="2"
            :placeholder="$t('beneficiaries.modal.notesPlaceholder')"
          />
        </div>

          <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
        </div>

        <DialogFooter class="px-6 py-4 border-t border-slate-100 sm:justify-start shrink-0">
          <Button type="button" variant="secondary" class="flex-1" @click="$emit('close')">{{ $t('common.cancel') }}</Button>
          <Button type="submit" :disabled="loading" class="flex-1">
            {{ loading ? $t('beneficiaries.modal.submitting') : $t('beneficiaries.modal.submit') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { CreateBeneficiaryForm } from "@amanah/types";

const emit = defineEmits<{ close: []; created: [] }>();

const { t } = useI18n()
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const orgStore = useOrgStore();
const { logAction } = useAuditLog();
const loading = ref(false);
const error = ref("");

const form = reactive<CreateBeneficiaryForm>({
  full_name: "",
  city: "",
  phone: "",
  national_id: "",
  gender: undefined,
  family_size: undefined,
  monthly_income: undefined,
  address: "",
  health_conditions: "",
  category: "",
  notes: "",
});

async function handleSubmit() {
  if (!orgStore.currentOrgId || !user.value) {
    error.value = t('common.noOrg')
    return
  }
  loading.value = true;
  error.value = "";

  const { data, error: err } = await supabase
    .from("beneficiaries")
    .insert({
      ...form,
      organization_id: orgStore.currentOrgId,
      created_by: user.value.id,
    })
    .select("id")
    .single();

  loading.value = false;
  if (err) {
    error.value = err.message;
  } else {
    await logAction("beneficiary_created", "beneficiary", data.id, {
      full_name: form.full_name,
      city: form.city,
    });
    emit("created");
  }
}
</script>
