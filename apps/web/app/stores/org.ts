import { defineStore } from "pinia";
import type { Organization, OrgRole } from "@amanah/types";

interface OrgState {
  currentOrg: Organization | null;
  currentRole: OrgRole | null;
  loaded: boolean;
}

export const useOrgStore = defineStore("org", {
  state: (): OrgState => ({
    currentOrg: null,
    currentRole: null,
    loaded: false,
  }),

  getters: {
    currentOrgId: (state) => state.currentOrg?.id ?? null,
    isAdmin: (state) => state.currentRole === "admin",
    isCollector: (state) => state.currentRole === "admin" || state.currentRole === "collector",
  },

  actions: {
    async load() {
      const supabase = useSupabaseClient();
      const user = useSupabaseUser();
      if (!user.value) return;

      const { data } = await supabase
        .from("organization_members")
        .select("role, organization:organizations(*)")
        .eq("user_id", user.value.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (data) {
        this.currentOrg = data.organization as unknown as Organization;
        this.currentRole = data.role as OrgRole;
      }
      this.loaded = true;
    },

    setOrg(org: Organization, role: OrgRole) {
      this.currentOrg = org;
      this.currentRole = role;
    },
  },
});
