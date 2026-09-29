<template>
  <div>
    <div class="page-header gap-3">
      <div>
        <h1 class="text-2xl font-bold text-ink-900">{{ $t("beneficiaries.title") }}</h1>
        <p class="section-subtitle">{{ $t("beneficiaries.subtitle") }}</p>
      </div>
      <Button v-if="orgStore.canWrite" id="add-beneficiary-btn" class="shrink-0" @click="showAddModal = true">
        {{ $t("beneficiaries.addButton") }}
      </Button>
    </div>

    <!-- Search & filters -->
    <Card class="p-4 sm:p-5 mb-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1 relative">
          <svg
            class="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z"
            />
          </svg>
          <Input
            id="beneficiary-search"
            v-model="search"
            type="search"
            :placeholder="$t('beneficiaries.searchPlaceholder')"
            class="ps-9 placeholder:text-sm"
          />
        </div>
        <select
          id="status-filter"
          v-model="statusFilter"
          :aria-label="$t('beneficiaries.table.status')"
          class="input sm:w-40"
        >
          <option value="">{{ $t("beneficiaries.statusFilter.all") }}</option>
          <option value="active">{{ $t("beneficiaries.statusFilter.active") }}</option>
          <option value="inactive">{{ $t("beneficiaries.statusFilter.inactive") }}</option>
          <option value="archived">{{ $t("beneficiaries.statusFilter.archived") }}</option>
        </select>
      </div>
    </Card>

    <!-- Registered offline, not on the server yet -->
    <ClientOnly>
    <Card v-if="pendingRows.length" class="p-4 mb-4 bg-warning-50/60 border-warning-200">
      <p class="text-xs font-semibold uppercase tracking-wide text-warning-800 mb-2">{{ $t("offline.waitingToSync") }}</p>
      <ul class="space-y-1 text-sm">
        <li v-for="p in pendingRows" :key="String(p.id)" class="flex justify-between gap-2">
          <span class="font-medium text-ink-800 truncate">{{ p.full_name }}</span>
          <span class="text-ink-500 shrink-0">{{ p.city }}</span>
        </li>
      </ul>
    </Card>
    </ClientOnly>

    <!-- Table (desktop) -->
    <Card class="hidden md:block overflow-hidden p-0">
      <Table class="w-full text-sm">
        <TableHeader class="bg-surface-50 border-b border-surface-200">
          <TableRow>
            <TableHead class="text-start px-4 py-3 font-medium text-ink-500 min-w-48">{{ $t("beneficiaries.table.name") }}</TableHead>
            <TableHead class="text-start px-4 py-3 font-medium text-ink-500">{{ $t("beneficiaries.table.city") }}</TableHead>
            <TableHead class="text-start px-4 py-3 font-medium text-ink-500">{{ $t("beneficiaries.table.familySize") }}</TableHead>
            <TableHead class="text-start px-4 py-3 font-medium text-ink-500">{{ $t("beneficiaries.table.lastSupport") }}</TableHead>
            <TableHead class="text-start px-4 py-3 font-medium text-ink-500">{{ $t("beneficiaries.table.activeNeeds") }}</TableHead>
            <TableHead class="text-start px-4 py-3 font-medium text-ink-500">{{ $t("beneficiaries.table.status") }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="divide-y divide-surface-200">
          <TableRow v-if="pending && !rows.length">
            <TableCell colspan="6" class="px-4 py-8 text-center text-ink-400">{{ $t("beneficiaries.loading") }}</TableCell>
          </TableRow>
          <TableRow v-else-if="!rows.length">
            <TableCell colspan="6" class="px-4 py-8 text-center text-ink-400">{{ $t("beneficiaries.empty") }}</TableCell>
          </TableRow>
          <TableRow
            v-for="b in rows"
            :key="b.id"
            class="hover:bg-brand-50 cursor-pointer transition-colors"
            @click="navigateTo(`/beneficiaries/${b.id}`)"
          >
            <TableCell class="px-4 py-3.5 font-medium text-ink-800">
              <NuxtLink :to="`/beneficiaries/${b.id}`" class="hover:text-brand-700" @click.stop>{{ b.full_name }}</NuxtLink>
              <p v-if="b.category" class="text-xs font-normal text-ink-400">{{ b.category }}</p>
            </TableCell>
            <TableCell class="px-4 py-3.5 text-ink-600 whitespace-nowrap">{{ b.city }}</TableCell>
            <TableCell class="px-4 py-3.5 text-ink-600 whitespace-nowrap">{{ b.family_size ?? "—" }}</TableCell>
            <TableCell class="px-4 py-3.5 text-ink-600 whitespace-nowrap">{{ lastSupport(b) }}</TableCell>
            <TableCell class="px-4 py-3.5 text-ink-600 whitespace-nowrap">{{ activeNeeds(b) }}</TableCell>
            <TableCell class="px-4 py-3.5">
              <Badge :class="badge('status', b.status)">{{ label("status", b.status) }}</Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>

    <!-- Cards (mobile) -->
    <div class="md:hidden space-y-3">
      <Card v-if="pending && !rows.length" class="p-6 text-center text-ink-400 text-sm">{{ $t("beneficiaries.loading") }}</Card>
      <Card v-else-if="!rows.length" class="p-6 text-center text-ink-400 text-sm">{{ $t("beneficiaries.empty") }}</Card>
      <NuxtLink v-for="b in rows" :key="b.id" :to="`/beneficiaries/${b.id}`" class="block">
        <Card class="p-4 hover:bg-brand-50 transition-colors">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-semibold text-ink-900 truncate">{{ b.full_name }}</p>
              <p class="text-sm text-ink-500 mt-0.5">
                {{ b.city }}<template v-if="b.family_size"> · {{ $t("beneficiaries.familyOf", { n: b.family_size }) }}</template>
              </p>
              <p class="text-xs text-ink-400 mt-1">
                {{ $t("beneficiaries.table.lastSupport") }}: {{ lastSupport(b) }} · {{ $t("beneficiaries.table.activeNeeds") }}: {{ activeNeeds(b) }}
              </p>
            </div>
            <Badge class="shrink-0" :class="badge('status', b.status)">{{ label("status", b.status) }}</Badge>
          </div>
        </Card>
      </NuxtLink>
    </div>

    <div v-if="rows.length" class="flex flex-col items-center gap-2 mt-6 text-sm text-ink-500">
      <p>{{ $t("beneficiaries.showing", { shown: rows.length, total: total }) }}</p>
      <Button v-if="rows.length < total" variant="secondary" size="sm" :disabled="pending" @click="limit += PAGE_SIZE">
        {{ $t("beneficiaries.loadMore") }}
      </Button>
    </div>

    <AddBeneficiaryModal v-if="showAddModal" @close="showAddModal = false" @created="onCreated" />
  </div>
</template>

<script setup lang="ts">
import type { Beneficiary } from "@amanah/types";

type BeneficiaryRow = Beneficiary & {
  active_needs: { count: number }[];
  last_distribution: { distribution_date: string }[];
};

const { t } = useI18n();
useHead({ title: () => `${t("beneficiaries.title")} — Amanah` });

const PAGE_SIZE = 50;
const supabase = useSupabaseClient();
const orgStore = useOrgStore();
const { formatDate, label, badge } = useFormat();
const search = ref("");
const statusFilter = ref("");
const route = useRoute();
const showAddModal = ref(route.query.add === "1" && orgStore.canWrite);
const limit = ref(PAGE_SIZE);

const debouncedSearch = refDebounced(search, 300);
watch([debouncedSearch, statusFilter], () => (limit.value = PAGE_SIZE));

/** Quote a value for a PostgREST `or=(...)` filter so commas/parentheses in user input can't break it. */
function pgrstQuote(value: string) {
  return `"${value.replace(/[\\"]/g, "\\$&")}"`;
}

const { data, pending, refresh } = await useAsyncData(
  "beneficiaries",
  async (nuxtApp) => {
    const orgId = orgStore.currentOrgId;
    if (!orgId) return { rows: [] as BeneficiaryRow[], total: 0 };
    let q = supabase
      .from("beneficiaries")
      .select(
        "*, active_needs:beneficiary_needs(count), last_distribution:aid_distributions(distribution_date)",
        { count: "exact" },
      )
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .eq("active_needs.status", "active")
      .order("distribution_date", { referencedTable: "last_distribution", ascending: false })
      .limit(1, { referencedTable: "last_distribution" })
      .order("created_at", { ascending: false })
      .limit(limit.value);

    const term = debouncedSearch.value.trim();
    if (term) {
      const like = pgrstQuote(`%${term}%`);
      q = q.or(`full_name.ilike.${like},phone.ilike.${like},national_id.ilike.${like}`);
    }
    if (statusFilter.value) {
      q = q.eq("status", statusFilter.value);
    }

    const res = await q;
    return keepOnNetworkError(nuxtApp, "beneficiaries", res, {
      rows: (res.data ?? []) as unknown as BeneficiaryRow[],
      total: res.count ?? 0,
    });
  },
  { watch: [() => orgStore.currentOrgId, debouncedSearch, statusFilter, limit], ...keepWhenOffline },
);

const rows = computed(() => data.value?.rows ?? []);
const outbox = useOutboxStore();
const pendingRows = computed(() => outbox.pendingInserts("beneficiaries", (r) => r.organization_id === orgStore.currentOrgId));
const total = computed(() => data.value?.total ?? 0);

const lastSupport = (b: BeneficiaryRow) => formatDate(b.last_distribution?.[0]?.distribution_date);
const activeNeeds = (b: BeneficiaryRow) => b.active_needs?.[0]?.count ?? 0;

async function onCreated(id: string, queued: boolean) {
  showAddModal.value = false;
  // A record saved offline has no server copy yet, so its profile can't load.
  if (queued) await refresh();
  else await navigateTo(`/beneficiaries/${id}`);
}
</script>
