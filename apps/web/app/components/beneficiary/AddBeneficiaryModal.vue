<template>
  <Dialog :open="true" @update:open="!$event && $emit('close')">
    <DialogContent class="sm:max-w-xl flex flex-col max-h-[90vh] p-0 gap-0 overflow-hidden">
      <DialogHeader class="px-6 pt-6 pb-0 shrink-0">
        <DialogTitle>{{ isEdit ? $t("beneficiaries.modal.editTitle") : $t("beneficiaries.modal.title") }}</DialogTitle>
      </DialogHeader>

      <form class="flex flex-col min-h-0 flex-1" @submit.prevent="handleSubmit">
        <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <!-- Essentials: what a field worker needs to register someone quickly. -->
          <div>
            <Label for="b-full_name" class="mb-1.5 block">{{ $t("beneficiaries.modal.fullName") }} *</Label>
            <Input id="b-full_name" v-model="form.full_name" required autocomplete="off" :placeholder="$t('beneficiaries.modal.fullName')" />
          </div>

          <div class="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label for="b-phone" class="mb-1.5 block">{{ $t("beneficiaries.modal.phone") }} *</Label>
              <Input id="b-phone" v-model="form.phone" type="tel" inputmode="tel" required dir="ltr" placeholder="+20 100 000 0000" />
            </div>
            <div>
              <Label for="b-city" class="mb-1.5 block">{{ $t("beneficiaries.modal.city") }} *</Label>
              <Input id="b-city" v-model="form.city" required :placeholder="$t('beneficiaries.modal.city')" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label for="b-national_id" class="mb-1.5 block">{{ $t("beneficiaries.modal.nationalId") }}</Label>
              <Input id="b-national_id" v-model="form.national_id" dir="ltr" :placeholder="$t('beneficiaries.modal.nationalId')" />
            </div>
            <div>
              <Label for="b-family_size" class="mb-1.5 block">{{ $t("beneficiaries.modal.familySize") }}</Label>
              <Input id="b-family_size" v-model.number="form.family_size" type="number" inputmode="numeric" min="1" :placeholder="$t('beneficiaries.modal.familySizePlaceholder')" />
            </div>
          </div>

          <div>
            <Label for="b-category" class="mb-1.5 block">{{ $t("beneficiaries.modal.category") }}</Label>
            <div class="flex flex-wrap gap-1.5 mb-2">
              <button
                v-for="c in categorySuggestions"
                :key="c"
                type="button"
                class="rounded-full px-3 py-1 text-xs font-medium ring-1 transition-colors"
                :class="form.category === c ? 'bg-brand-600 text-white ring-brand-600' : 'bg-white text-ink-600 ring-input hover:bg-brand-50'"
                :aria-pressed="form.category === c"
                @click="form.category = form.category === c ? '' : c"
              >
                {{ c }}
              </button>
            </div>
            <Input id="b-category" v-model="form.category" :placeholder="$t('beneficiaries.modal.categoryOther')" />
          </div>

          <div v-if="isEdit">
            <Label for="b-status" class="mb-1.5 block">{{ $t("beneficiaries.table.status") }}</Label>
            <select id="b-status" v-model="form.status" :class="selectClass">
              <option value="active">{{ $t("enums.status.active") }}</option>
              <option value="inactive">{{ $t("enums.status.inactive") }}</option>
              <option value="archived">{{ $t("enums.status.archived") }}</option>
            </select>
          </div>

          <!-- Everything else is one tap away. -->
          <button
            type="button"
            class="flex w-full items-center justify-between rounded-lg bg-surface-50 px-3 py-2.5 text-sm font-medium text-ink-700 ring-1 ring-surface-200 hover:bg-surface-100"
            :aria-expanded="showMore"
            aria-controls="b-more"
            @click="showMore = !showMore"
          >
            <span>{{ showMore ? $t("beneficiaries.modal.fewerDetails") : $t("beneficiaries.modal.moreDetails") }}</span>
            <svg class="w-4 h-4 transition-transform" :class="{ 'rotate-180': showMore }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          <div v-show="showMore" id="b-more" class="space-y-4">
            <div class="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label for="b-gender" class="mb-1.5 block">{{ $t("beneficiaries.modal.gender") }}</Label>
                <select id="b-gender" v-model="form.gender" :class="selectClass">
                  <option value="">{{ $t("common.select") }}</option>
                  <option value="male">{{ $t("beneficiaries.modal.genderMale") }}</option>
                  <option value="female">{{ $t("beneficiaries.modal.genderFemale") }}</option>
                  <option value="other">{{ $t("beneficiaries.modal.genderOther") }}</option>
                </select>
              </div>
              <div>
                <Label for="b-birth_date" class="mb-1.5 block">{{ $t("beneficiaries.modal.birthDate") }}</Label>
                <Input id="b-birth_date" v-model="form.birth_date" type="date" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label for="b-income" class="mb-1.5 block">{{ $t("beneficiaries.modal.monthlyIncome") }}</Label>
                <Input id="b-income" v-model.number="form.monthly_income" type="number" inputmode="decimal" min="0" placeholder="0" />
              </div>
              <div>
                <Label for="b-employment" class="mb-1.5 block">{{ $t("beneficiaries.modal.employment") }}</Label>
                <Input id="b-employment" v-model="form.employment_status" :placeholder="$t('beneficiaries.modal.employmentPlaceholder')" />
              </div>
            </div>

            <div>
              <Label for="b-address" class="mb-1.5 block">{{ $t("beneficiaries.modal.address") }}</Label>
              <Input id="b-address" v-model="form.address" :placeholder="$t('beneficiaries.modal.addressPlaceholder')" />
            </div>

            <div>
              <Label for="b-health" class="mb-1.5 block">{{ $t("beneficiaries.modal.healthConditions") }}</Label>
              <Textarea id="b-health" v-model="form.health_conditions" class="resize-none" rows="2" :placeholder="$t('beneficiaries.modal.healthPlaceholder')" />
            </div>

            <div>
              <Label for="b-notes" class="mb-1.5 block">{{ $t("beneficiaries.modal.notes") }}</Label>
              <Textarea id="b-notes" v-model="form.notes" class="resize-none" rows="2" :placeholder="$t('beneficiaries.modal.notesPlaceholder')" />
            </div>
          </div>

          <div v-if="duplicates.length" ref="duplicatePanel" class="rounded-lg bg-warning-50 ring-1 ring-warning-200 p-3 text-sm text-warning-900">
            <p class="font-medium">{{ $t("beneficiaries.duplicates.title") }}</p>
            <ul class="mt-2 space-y-1">
              <li v-for="d in duplicates" :key="d.id" class="flex items-center justify-between gap-2">
                <span class="min-w-0 truncate">
                  {{ d.full_name }} · {{ d.city }}
                  <span class="text-warning-700">({{ $t(`beneficiaries.duplicates.match.${d.match}`) }})</span>
                </span>
                <NuxtLink :to="`/beneficiaries/${d.id}`" class="shrink-0 font-medium underline" @click="$emit('close')">
                  {{ $t("beneficiaries.duplicates.open") }}
                </NuxtLink>
              </li>
            </ul>
            <p class="mt-2 text-xs text-warning-800">{{ $t("beneficiaries.duplicates.hint") }}</p>
          </div>

          <p v-if="error" class="text-sm text-danger-600">{{ error }}</p>
        </div>

        <DialogFooter class="px-6 py-4 border-t border-ink-100 sm:justify-start shrink-0 gap-2">
          <Button type="button" variant="secondary" class="flex-1" @click="$emit('close')">{{ $t("common.cancel") }}</Button>
          <Button type="submit" :disabled="loading" class="flex-1">
            {{
              loading
                ? $t("beneficiaries.modal.submitting")
                : duplicates.length
                  ? $t("beneficiaries.duplicates.saveAnyway")
                  : $t("beneficiaries.modal.submit")
            }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import type { Beneficiary, CreateBeneficiaryForm } from "@amanah/types";

const props = defineProps<{ beneficiary?: Beneficiary | null }>();
/** `queued`: saved on this device only (offline), so its profile can't be opened yet. */
const emit = defineEmits<{ close: []; created: [id: string, queued: boolean] }>();

const isEdit = computed(() => !!props.beneficiary);

const selectClass =
  "input";

const { t } = useI18n();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const orgStore = useOrgStore();
const { logAction } = useAuditLog();
const write = useOfflineWrite();
const loading = ref(false);
const error = ref("");

const categorySuggestions = computed(() =>
  ["widows", "orphans", "medical", "elderly", "disabled", "refugees"].map((c) => t(`beneficiaries.categories.${c}`)),
);

const b = props.beneficiary;
// Editing opens the extra fields when any of them is already filled in.
const showMore = ref(
  !!b && [b.gender, b.birth_date, b.monthly_income, b.employment_status, b.address, b.health_conditions, b.notes].some((v) => v != null && v !== ""),
);
const form = reactive<CreateBeneficiaryForm>({
  full_name: b?.full_name ?? "",
  city: b?.city ?? "",
  phone: b?.phone ?? "",
  national_id: b?.national_id ?? "",
  gender: (b?.gender ?? "") as CreateBeneficiaryForm["gender"],
  birth_date: b?.birth_date ?? "",
  family_size: b?.family_size ?? undefined,
  monthly_income: b?.monthly_income ?? undefined,
  employment_status: b?.employment_status ?? "",
  address: b?.address ?? "",
  health_conditions: b?.health_conditions ?? "",
  category: b?.category ?? "",
  notes: b?.notes ?? "",
  status: b?.status ?? "active",
});

const blank = (v?: string | null) => v?.trim() || null;
const num = (v?: number | string | null) => (typeof v === "number" && !Number.isNaN(v) ? v : null);

/** Trim strings and turn blanks into null so optional columns (and CHECK constraints like gender) accept them. */
function payload() {
  return {
    full_name: form.full_name.trim(),
    city: form.city.trim(),
    phone: blank(form.phone),
    national_id: blank(form.national_id),
    gender: form.gender || null,
    birth_date: blank(form.birth_date),
    family_size: num(form.family_size),
    monthly_income: num(form.monthly_income),
    employment_status: blank(form.employment_status),
    address: blank(form.address),
    health_conditions: blank(form.health_conditions),
    category: blank(form.category),
    notes: blank(form.notes),
  };
}

type Duplicate = { id: string; full_name: string; city: string; match: "phone" | "national_id" };
const duplicates = ref<Duplicate[]>([]);
const duplicatePanel = ref<HTMLElement | null>(null);
/** Phone/national ID the user already confirmed as "save anyway". */
let confirmedKey = "";

async function findDuplicates() {
  // Offline, the check can't run; the record is still saved and synced later.
  if (!navigator.onLine) return [];
  const { data } = await supabase.rpc("find_possible_duplicates", {
    p_org_id: orgStore.currentOrgId!,
    p_phone: form.phone ?? "",
    p_national_id: form.national_id ?? "",
    p_exclude: props.beneficiary?.id,
  });
  return (data ?? []) as Duplicate[];
}

async function handleSubmit() {
  if (!orgStore.currentOrgId || !user.value) {
    error.value = t("common.noOrg");
    return;
  }
  // `required` accepts whitespace; the database rejects blank names, so catch it here with a clear message.
  if (!form.full_name.trim() || !form.city.trim() || !form.phone?.trim()) {
    error.value = t("beneficiaries.modal.requiredFields");
    return;
  }
  loading.value = true;
  error.value = "";

  // Warn before registering someone who is already in the system (same national ID or phone).
  const key = `${form.phone?.trim()}|${form.national_id?.trim()}`;
  if (key !== confirmedKey) {
    duplicates.value = await findDuplicates();
    if (duplicates.value.length) {
      confirmedKey = key;
      loading.value = false;
      await nextTick();
      duplicatePanel.value?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
  }

  if (isEdit.value && props.beneficiary) {
    const id = props.beneficiary.id;
    const result = await write.update("beneficiaries", id, { ...payload(), status: form.status }, t("beneficiaries.modal.editTitle") + ": " + form.full_name);
    loading.value = false;
    if (!result.ok) {
      error.value = result.error;
      return;
    }
    await logAction("beneficiary_updated", "beneficiary", id, { full_name: form.full_name, status: form.status });
    write.confirm(result, t("toast.beneficiaryUpdated"));
    emit("created", id, result.queued);
  } else {
    const id = crypto.randomUUID();
    const result = await write.insert(
      "beneficiaries",
      { id, ...payload(), organization_id: orgStore.currentOrgId, created_by: user.value.id },
      t("beneficiaries.modal.title") + ": " + form.full_name,
    );
    loading.value = false;
    if (!result.ok) {
      error.value = result.error;
      return;
    }
    await logAction("beneficiary_created", "beneficiary", id, { full_name: form.full_name, city: form.city });
    write.confirm(result, t("toast.beneficiaryCreated"));
    emit("created", id, result.queued);
  }
}
</script>
