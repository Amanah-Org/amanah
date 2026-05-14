<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">{{ $t('beneficiaries.title') }}</h1>
        <p class="section-subtitle">{{ $t('beneficiaries.subtitle') }}</p>
      </div>
      <Button id="add-beneficiary-btn" @click="showAddModal = true">{{ $t('beneficiaries.addButton') }}</Button>
    </div>

    <!-- Search & filters -->
    <Card class="p-5 mb-6">
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1 relative">
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
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
            type="text"
            :placeholder="$t('beneficiaries.searchPlaceholder')"
            class="pl-9"
          />
        </div>
        <select
          id="status-filter"
          v-model="statusFilter"
          class="w-full sm:w-40 flex h-10 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">{{ $t('beneficiaries.statusFilter.all') }}</option>
          <option value="active">{{ $t('beneficiaries.statusFilter.active') }}</option>
          <option value="inactive">{{ $t('beneficiaries.statusFilter.inactive') }}</option>
          <option value="archived">{{ $t('beneficiaries.statusFilter.archived') }}</option>
        </select>
      </div>
    </Card>

    <!-- Table (desktop) -->
    <Card class="hidden md:block overflow-hidden p-0">
      <Table class="w-full text-sm">
        <TableHeader class="bg-surface-50 border-b border-surface-200">
          <TableRow>
            <TableHead class="text-left px-5 py-3 font-medium text-slate-500">{{ $t('beneficiaries.table.name') }}</TableHead>
            <TableHead class="text-left px-5 py-3 font-medium text-slate-500">{{ $t('beneficiaries.table.city') }}</TableHead>
            <TableHead class="text-left px-5 py-3 font-medium text-slate-500">{{ $t('beneficiaries.table.familySize') }}</TableHead>
            <TableHead class="text-left px-5 py-3 font-medium text-slate-500">{{ $t('beneficiaries.table.activeNeeds') }}</TableHead>
            <TableHead class="text-left px-5 py-3 font-medium text-slate-500">{{ $t('beneficiaries.table.status') }}</TableHead>
            <TableHead class="px-5 py-3" />
          </TableRow>
        </TableHeader>
        <TableBody class="divide-y divide-surface-200">
          <TableRow v-if="pending">
            <TableCell colspan="6" class="px-5 py-8 text-center text-slate-400">{{ $t('beneficiaries.loading') }}</TableCell>
          </TableRow>
          <TableRow v-else-if="!beneficiaries?.length">
            <TableCell colspan="6" class="px-5 py-8 text-center text-slate-400">{{ $t('beneficiaries.empty') }}</TableCell>
          </TableRow>
          <TableRow
            v-for="b in beneficiaries"
            :key="b.id"
            class="hover:bg-surface-50 cursor-pointer transition-colors"
            @click="navigateTo(`/beneficiaries/${b.id}`)"
          >
            <TableCell class="px-5 py-3.5 font-medium text-slate-800">{{ b.full_name }}</TableCell>
            <TableCell class="px-5 py-3.5 text-slate-600">{{ b.city }}</TableCell>
            <TableCell class="px-5 py-3.5 text-slate-600">{{ b.family_size ?? "—" }}</TableCell>
            <TableCell class="px-5 py-3.5 text-slate-600">{{ (b as any).needs_count?.[0]?.count ?? 0 }}</TableCell>
            <TableCell class="px-5 py-3.5">
              <Badge :class="statusClass(b.status)">{{ b.status }}</Badge>
            </TableCell>
            <TableCell class="px-5 py-3.5 text-right">
              <span class="text-brand-600 hover:text-brand-800 font-medium text-xs">{{ $t('beneficiaries.view') }}</span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>

    <!-- Cards (mobile) -->
    <div class="md:hidden space-y-3">
      <Card
        v-for="b in beneficiaries"
        :key="b.id"
        class="p-4 cursor-pointer hover:bg-surface-50 transition-colors"
        @click="navigateTo(`/beneficiaries/${b.id}`)"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="font-semibold text-slate-900">{{ b.full_name }}</p>
            <p class="text-sm text-slate-500 mt-0.5">{{ b.city }} · {{ $t('beneficiaries.familyOf') }} {{ b.family_size ?? "?" }}</p>
          </div>
          <Badge :class="statusClass(b.status)">{{ b.status }}</Badge>
        </div>
      </Card>
    </div>

    <!-- Add Beneficiary Modal -->
    <AddBeneficiaryModal v-if="showAddModal" @close="showAddModal = false" @created="onCreated" />
  </div>
</template>

<script setup lang="ts">
import type { Beneficiary } from "@amanah/types";
import AddBeneficiaryModal from "~/components/beneficiary/AddBeneficiaryModal.vue";

useHead({ title: "Beneficiaries — Amanah" });

const supabase = useSupabaseClient();
const orgStore = useOrgStore();
const search = ref("");
const statusFilter = ref("");
const showAddModal = ref(false);

const debouncedSearch = refDebounced(search, 300);

const {
  data: beneficiaries,
  pending,
  refresh,
} = await useAsyncData(
  "beneficiaries",
  async () => {
    const orgId = orgStore.currentOrgId;
    if (!orgId) return [];
    let q = supabase
      .from("beneficiaries")
      .select("*, needs_count:beneficiary_needs(count)")
      .eq("organization_id", orgId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (debouncedSearch.value) {
      q = q.or(
        `full_name.ilike.%${debouncedSearch.value}%,phone.ilike.%${debouncedSearch.value}%,national_id.ilike.%${debouncedSearch.value}%`,
      );
    }
    if (statusFilter.value) {
      q = q.eq("status", statusFilter.value);
    }

    const { data } = await q;
    return (data ?? []) as Beneficiary[];
  },
  { watch: [() => orgStore.currentOrgId, debouncedSearch, statusFilter] },
);

function statusClass(s: string) {
  return { active: "badge-green", inactive: "badge-slate", archived: "badge-yellow" }[s] ?? "badge-slate";
}

async function onCreated() {
  showAddModal.value = false;
  await refresh();
}
</script>
