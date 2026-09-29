<template>
  <Dialog :open="true" @update:open="!$event && $emit('close')">
    <DialogContent class="sm:max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? $t('distributions.modal.editTitle') : $t('distributions.modal.title') }}</DialogTitle>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <Label for="d-related-need" class="mb-1.5 block">{{ $t('distributions.modal.relatedNeed') }}</Label>
          <select
            id="d-related-need"
            v-model="form.need_id"
            class="input"
          >
            <option value="">{{ $t('distributions.modal.noNeed') }}</option>
            <option v-for="need in selectableNeeds" :key="need.id" :value="need.id">
              {{ label('needType', need.type) }} · {{ label('frequency', need.frequency) }} · {{ label('urgency', need.urgency) }}
            </option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="d-type" class="mb-1.5 block">{{ $t('distributions.modal.type') }}</Label>
            <select
              id="d-type"
              v-model="form.type"
              class="input"
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

        <p v-if="recentSameType" class="text-sm rounded-lg bg-warning-50 text-warning-800 ring-1 ring-warning-200 px-3 py-2">
          {{ $t('distributions.modal.duplicateWarning', {
            type: $t(`distributions.types.${recentSameType.type}`),
            date: formatDate(recentSameType.distribution_date),
            n: recentSameType.days,
          }, recentSameType.days) }}
        </p>

        <div>
          <Label for="d-amount" class="mb-1.5 block">{{ $t('distributions.modal.amount') }}</Label>
          <Input id="d-amount" v-model.number="form.amount" type="number" inputmode="decimal" min="0" step="0.01" :placeholder="$t('distributions.modal.amountPlaceholder')" />
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
          <!-- Uploading needs a connection; offline, the distribution is still recorded without it. -->
          <p v-if="!outbox.online" class="text-xs text-ink-500">{{ $t('distributions.modal.proofOffline') }}</p>
          <template v-else>
            <Input id="d-proof" type="file" accept="image/*,application/pdf" @change="onFileChange" />
            <p v-if="proofFile" class="text-xs text-ink-500 mt-1">{{ proofFile.name }}</p>
            <p v-else-if="distribution?.proof_attachment_url" class="text-xs text-ink-500 mt-1">{{ $t('distributions.modal.proofReplace') }}</p>
          </template>
        </div>

        <div v-if="!isEdit" class="flex items-center gap-3">
          <input id="d-complete-need" v-model="markNeedCompleted" type="checkbox" class="rounded" :disabled="!form.need_id">
          <Label for="d-complete-need" class="flex-1 py-3 sm:py-0 cursor-pointer">{{ $t('distributions.modal.markCompleted') }}</Label>
        </div>
        <p v-if="error" class="text-sm text-danger-600">{{ error }}</p>

        <DialogFooter class="sm:justify-start gap-2">
          <Button type="button" variant="secondary" class="flex-1" @click="$emit('close')">{{ $t('common.cancel') }}</Button>
          <Button type="submit" :disabled="loading" class="flex-1">
            {{ loading ? $t('distributions.modal.submitting') : isEdit ? $t('common.save') : $t('distributions.modal.submit') }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { AidDistribution, BeneficiaryNeed, CreateDistributionForm } from "@amanah/types";

const props = defineProps<{
  beneficiaryId: string;
  /** The beneficiary's needs and distributions, already loaded by the profile (works offline). */
  needs: BeneficiaryNeed[];
  distributions: Pick<AidDistribution, "id" | "type" | "distribution_date">[];
  initialNeedId?: string | null;
  initialType?: CreateDistributionForm["type"] | null;
  /** Edit this distribution instead of recording a new one. */
  distribution?: AidDistribution | null;
}>();
const emit = defineEmits<{ close: []; created: [] }>();

const { t } = useI18n();
const { formatDate, label, daysUntil } = useFormat();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const orgStore = useOrgStore();
const outbox = useOutboxStore();
const write = useOfflineWrite();
const { logAction } = useAuditLog();
const loading = ref(false);
const error = ref("");
const proofFile = ref<File | null>(null);
const markNeedCompleted = ref(false);
const isEdit = computed(() => !!props.distribution);

const distTypes = computed(() =>
  (["cash", "food_package", "medicine", "rent_payment", "utilities", "surgery_support", "education_support", "other"] as const).map(
    (value) => ({ value, label: t(`distributions.types.${value}`) }),
  ),
);

const d = props.distribution;
const form = reactive({
  type: (d?.type ?? "") as CreateDistributionForm["type"] | "",
  distribution_date: d?.distribution_date ?? localToday(),
  amount: (d?.amount ?? undefined) as number | undefined,
  notes: d?.notes ?? "",
  need_id: d?.need_id ?? "",
});

// Open needs, plus the one an edited distribution is already linked to.
const selectableNeeds = computed(() =>
  props.needs.filter((n) => n.status !== "completed" || n.id === props.distribution?.need_id),
);

// Warn before recording the same kind of aid twice within a month.
const DUPLICATE_WINDOW_DAYS = 30;
const recentSameType = computed(() => {
  if (!form.type) return null;
  const since = localToday(-DUPLICATE_WINDOW_DAYS);
  const match = props.distributions.find(
    (x) => x.type === form.type && x.distribution_date >= since && x.id !== props.distribution?.id,
  );
  return match ? { ...match, days: Math.max(0, -daysUntil(match.distribution_date)) } : null;
});

// One-time needs are fulfilled by a single distribution, so default to completing them.
watch(
  () => form.need_id,
  (needId) => {
    markNeedCompleted.value = props.needs.find((n) => n.id === needId)?.frequency === "one_time";
  },
);

onMounted(() => {
  if (props.initialNeedId) form.need_id = props.initialNeedId;
  if (props.initialType) form.type = props.initialType;
});

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] ?? null;
  if (!file) {
    proofFile.value = null;
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    error.value = t("beneficiaries.attachments.fileTooLarge");
    target.value = "";
    return;
  }
  if (!(file.type.startsWith("image/") || file.type === "application/pdf")) {
    error.value = t("beneficiaries.attachments.invalidType");
    target.value = "";
    return;
  }
  error.value = "";
  proofFile.value = file;
}

async function uploadProof(): Promise<string | null | false> {
  if (!proofFile.value) return null;
  const ext = proofFile.value.name.split(".").pop() ?? "bin";
  const objectPath = `${orgStore.currentOrgId}/beneficiaries/${props.beneficiaryId}/proofs/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error: uploadErr } = await supabase.storage.from("attachments").upload(objectPath, proofFile.value, { upsert: false });
  if (uploadErr) {
    error.value = t("distributions.modal.proofUploadFailed");
    return false;
  }
  // Store the storage path; signed URLs are generated on demand when viewing.
  return objectPath;
}

async function handleSubmit() {
  if (!orgStore.currentOrgId) {
    error.value = t("common.noOrg");
    return;
  }
  if (!form.type || !form.distribution_date) return;
  loading.value = true;
  error.value = "";

  const proofPath = await uploadProof();
  if (proofPath === false) {
    loading.value = false;
    return;
  }

  const values = {
    type: form.type,
    need_id: form.need_id || null,
    distribution_date: form.distribution_date,
    amount: typeof form.amount === "number" && !Number.isNaN(form.amount) ? form.amount : null,
    notes: form.notes.trim() || null,
  };
  const description = `${t(`distributions.types.${form.type}`)} · ${formatDate(form.distribution_date)}`;

  if (props.distribution) {
    const before = props.distribution;
    const update = proofPath ? { ...values, proof_attachment_url: proofPath } : values;
    const result = await write.update("aid_distributions", before.id, update, `${t("distributions.modal.editTitle")}: ${description}`);
    loading.value = false;
    if (!result.ok) {
      error.value = result.error;
      return;
    }
    // Record what changed so the audit log shows the correction, not just that one happened.
    const changes = Object.fromEntries(
      Object.entries(update)
        .filter(([key, value]) => before[key as keyof AidDistribution] !== value)
        .map(([key, value]) => [key, { from: before[key as keyof AidDistribution], to: value }]),
    );
    await logAction("distribution_updated", "aid_distribution", before.id, { beneficiary_id: props.beneficiaryId, changes });
    write.confirm(result, t("toast.distributionUpdated"));
    emit("created");
    return;
  }

  const id = crypto.randomUUID();
  const result = await write.insert(
    "aid_distributions",
    {
      id,
      ...values,
      beneficiary_id: props.beneficiaryId,
      organization_id: orgStore.currentOrgId,
      proof_attachment_url: proofPath,
      distributed_by: user.value?.id,
    },
    `${t("distributions.modal.title")}: ${description}`,
  );
  loading.value = false;
  if (!result.ok) {
    error.value = result.error;
    return;
  }

  await logAction("distribution_created", "aid_distribution", id, {
    beneficiary_id: props.beneficiaryId,
    need_id: values.need_id,
    amount: values.amount,
  });

  // The distribution is saved at this point; a failed status change must not
  // keep the modal open and invite a duplicate submission.
  if (form.need_id && markNeedCompleted.value) {
    const done = await write.update("beneficiary_needs", form.need_id, { status: "completed" }, t("beneficiaries.needs.complete"));
    if (done.ok) await logAction("need_completed", "beneficiary_need", form.need_id);
  }

  write.confirm(result, t("toast.distributionCreated"));
  emit("created");
}
</script>
