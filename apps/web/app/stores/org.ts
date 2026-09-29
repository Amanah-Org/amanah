import { defineStore } from "pinia";
import type { Organization, OrgRole } from "@amanah/types";

interface Membership {
  org: Organization;
  role: OrgRole;
}

interface OrgState {
  currentOrg: Organization | null;
  currentRole: OrgRole | null;
  memberships: Membership[];
  pendingInvites: number;
  loaded: boolean;
}

/** Cookie remembering which organization a user with several memberships last worked in. */
const ORG_COOKIE = "amanah_org";

export const useOrgStore = defineStore("org", {
  state: (): OrgState => ({
    currentOrg: null,
    currentRole: null,
    memberships: [],
    pendingInvites: 0,
    loaded: false,
  }),

  getters: {
    currentOrgId: (state) => state.currentOrg?.id ?? null,
    isAdmin: (state) => state.currentRole === "admin",
    /** Admins and collectors can record data; viewers are read-only. */
    canWrite: (state) => state.currentRole === "admin" || state.currentRole === "collector",
  },

  actions: {
    async load() {
      const supabase = useSupabaseClient();
      const user = useSupabaseUser();
      const preferred = useCookie<string | null>(ORG_COOKIE, { maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
      if (!user.value) return;

      const { data } = await supabase
        .from("organization_members")
        .select("role, status, organization:organizations(*)")
        .eq("user_id", user.value.id)
        .order("created_at");

      this.memberships = (data ?? [])
        .filter((m) => m.status === "active" && m.organization)
        .map((m) => ({ org: m.organization as unknown as Organization, role: m.role as OrgRole }));
      this.pendingInvites = data?.filter((m) => m.status === "pending").length ?? 0;

      const current = this.memberships.find((m) => m.org.id === preferred.value) ?? this.memberships[0];
      this.currentOrg = current?.org ?? null;
      this.currentRole = current?.role ?? null;
      this.loaded = true;
    },

    /** Make `orgId` the active organization (must be one of the user's active memberships). */
    switchOrg(orgId: string) {
      const membership = this.memberships.find((m) => m.org.id === orgId);
      if (!membership) return false;
      this.currentOrg = membership.org;
      this.currentRole = membership.role;
      useCookie(ORG_COOKIE, { maxAge: 60 * 60 * 24 * 365, sameSite: "lax" }).value = orgId;
      return true;
    },

    setOrg(org: Organization, role: OrgRole) {
      this.memberships = [...this.memberships.filter((m) => m.org.id !== org.id), { org, role }];
      this.switchOrg(org.id);
    },
  },
});
