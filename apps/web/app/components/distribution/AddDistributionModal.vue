<template>
  <Dialog :open="true" @update:open="!$event && $emit('close')">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ $t('distributions.modal.title') }}</DialogTitle>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <Label for="d-related-need" class="mb-1.5 block">{{ $t('distributions.modal.relatedNeed') }}</Label>
          <select
            id="d-related-need"
            v-model="form.need_id"
            class="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">{{ $t('distributions.modal.noNeed') }}</option>
            <option v-for="need in needs" :key="need.id" :value="need.id">
              {{ need.type }} · {{ need.frequency }} · {{ need.urgency }}
            </option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="d-type" class="mb-1.5 block">{{ $t('distributions.modal.type') }}</Label>
            <select
              id="d-type"
              v-model="form.type"
              class="w-full flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="">{{ $t('common.select') }}</option>
              <option v-for="dt in distTypes" :key="dt.value" :value="dt.value">{{ dt.label }}</option>
            </select>
          </div>
          <div>
            <Label for="d-date" class="mb-1.5 block">{{ $t('distributions.modal.date') }}</Label>
            <Input id="d-date" v-model="form.distribution_date" type="date" required />
          </div>
        </div>

        <div>
          <Label for="d-amount" class="mb-1.5 block">{{ $t('distributions.modal.amount') }}</Label>
          <Input id="d-amount" v-model.number="form.amount" type="number" min="0" step="0.01" :placeholder="$t('distributions.modal.amountPlaceholder')" />
        </div>

        <div>
          <Label for="d-notes" class="mb-1.5 block">{{ $t('distributions.modal.notes') }}</Label>
          <Textarea
            id="d-notes"
            v-model="form.notes"
            class="resize-none"
            rows="2"
            :placeholder="$t('distributions.modal.notesPlaceholder')"
          />
        </div>

        <div>
          <Label for="d-proof" class="mb-1.5 block">{{ $t('distributions.modal.proof') }}</Label>
          <Input id="d-proof" type="file" accept="image/*,application/pdf" @change="onFileChange" />
          <p v-if="proofFile" class="text-xs text-slate-500 mt-1">{{ proofFile.name }}</p>
        </div>

        <div class="flex items-center gap-2">
          <input id="d-complete-need" v-model="markNeedCompleted" type="checkbox" class="rounded" :disabled="!form.need_id" />
          <Label for="d-complete-need">{{ $t('distributions.modal.markCompleted') }}</Label>
        </div>
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

        <DialogFooter class="sm:justify-start">
          <Button type="button" variant="secondary" class="flex-1" @click="$emit('close')">{{ $t('common.cancel') }}</Button>
          <Button type="submit" :disabled="loading" class="flex-1">
            {{ loading ? $t('distributions.modal.submitting') : $t('distributions.modal.submit') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { CreateDistributionForm } from "@amanah/types";

const props = defineProps<{
  beneficiaryId: string;
  initialNeedId?: string | null;
  initialType?: CreateDistributionForm["type"] | null;
}>();
const emit = defineEmits<{ close: []; created: [] }>();

const { t } = useI18n()
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const orgStore = useOrgStore();
const { logAction } = useAuditLog();
const loading = ref(false);
const error = ref("");
const proofFile = ref<File | null>(null);
const markNeedCompleted = ref(false);

const distTypes = computed(() => [
  { value: "cash", label: t('distributions.types.cash') },
  { value: "food_package", label: t('distributions.types.food_package') },
  { value: "medicine", label: t('distributions.types.medicine') },
  { value: "rent_payment", label: t('distributions.types.rent_payment') },
  { value: "utilities", label: t('distributions.types.utilities') },
  { value: "surgery_support", label: t('distributions.types.surgery_support') },
  { value: "education_support", label: t('distributions.types.education_support') },
  { value: "other", label: t('distributions.types.other') },
])

const form = reactive<Partial<CreateDistributionForm>>({
  type: undefined,
  distribution_date: new Date().toISOString().slice(0, 10),
  amount: undefined,
  notes: "",
  need_id: undefined,
});

const { data: needs } = await useAsyncData(`distribution-needs-${props.beneficiaryId}`, async () => {
  const { data } = await supabase
    .from("beneficiary_needs")
    .select("id, type, frequency, urgency, status")
    .eq("beneficiary_id", props.beneficiaryId)
    .is("deleted_at", null)
    .in("status", ["active", "paused"])
    .order("urgency", { ascending: false });
  return (data ?? []) as Array<{ id: string; type: string; frequency: string; urgency: string; status: string }>;
});

watchEffect(() => {
  if (props.initialNeedId) {
    form.need_id = props.initialNeedId;
  }
  if (props.initialType) {
    form.type = props.initialType;
  }
});

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] ?? null;
  if (!file) {
    proofFile.value = null;
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    error.value = t('beneficiaries.attachments.fileTooLarge');
    target.value = "";
    return;
  }
  const validType = file.type.startsWith("image/") || file.type === "application/pdf";
  if (!validType) {
    error.value = t('beneficiaries.attachments.invalidType');
    target.value = "";
    return;
  }
  error.value = "";
  proofFile.value = file;
}

async function handleSubmit() {
  if (!orgStore.currentOrgId) {
    error.value = t('common.noOrg')
    return
  }
  if (!form.type || !form.distribution_date) return;
  loading.value = true;
  error.value = "";
  let proofAttachmentUrl: string | null = null;

  if (proofFile.value) {
    const ext = proofFile.value.name.split(".").pop() ?? "bin";
    const objectPath = `${orgStore.currentOrgId}/beneficiaries/${props.beneficiaryId}/proofs/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("attachments")
      .upload(objectPath, proofFile.value, { upsert: false });
    if (uploadErr) {
      loading.value = false;
      error.value = uploadErr.message;
      return;
    }
    const { data: publicUrl } = supabase.storage.from("attachments").getPublicUrl(objectPath);
    proofAttachmentUrl = publicUrl.publicUrl;
  }

  const { data, error: err } = await supabase
    .from("aid_distributions")
    .insert({
      beneficiary_id: props.beneficiaryId,
      organization_id: orgStore.currentOrgId,
      type: form.type,
      need_id: form.need_id ?? null,
      distribution_date: form.distribution_date,
      amount: form.amount,
      notes: form.notes,
      proof_attachment_url: proofAttachmentUrl,
      distributed_by: user.value?.id,
    })
    .select("id")
    .single();

  loading.value = false;
  if (err) {
    error.value = err.message;
    return;
  }

  if (form.need_id && markNeedCompleted.value) {
    const { error: needErr } = await supabase
      .from("beneficiary_needs")
      .update({ status: "completed" })
      .eq("id", form.need_id);
    if (needErr) {
      error.value = needErr.message;
      return;
    }
    await logAction("need_completed", "beneficiary_need", form.need_id);
  }

  await logAction("distribution_created", "aid_distribution", data.id, {
    beneficiary_id: props.beneficiaryId,
    need_id: form.need_id ?? null,
    amount: form.amount ?? null,
  });
  emit("created");
}
</script>
