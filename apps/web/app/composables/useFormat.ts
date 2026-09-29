const BADGE: Record<string, Record<string, string>> = {
  status: { active: "badge-green", inactive: "badge-slate", archived: "badge-yellow" },
  urgency: { low: "badge-slate", medium: "badge-yellow", high: "badge-red", critical: "badge-red" },
  needStatus: { active: "badge-green", completed: "badge-blue", paused: "badge-yellow" },
};

/** Today's date as YYYY-MM-DD in the user's local timezone (toISOString() would give the UTC date). */
export function localToday(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Locale-aware formatting and enum labels shared across pages. */
export function useFormat() {
  const { t, locale } = useI18n();
  const intlLocale = computed(() => (locale.value === "ar" ? "ar" : "en-US"));

  function formatDate(d: string | null | undefined, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) {
    if (!d) return "—";
    // Date-only strings are parsed as UTC midnight; format in UTC so they don't shift a day.
    const utc = /^\d{4}-\d{2}-\d{2}$/.test(d);
    return new Date(d).toLocaleDateString(intlLocale.value, { ...opts, ...(utc ? { timeZone: "UTC" } : {}) });
  }

  function formatDateTime(d: string) {
    return new Date(d).toLocaleString(intlLocale.value, { dateStyle: "medium", timeStyle: "short" });
  }

  function formatMoney(n: number | null | undefined) {
    return `$${Number(n ?? 0).toLocaleString(intlLocale.value, { maximumFractionDigits: 2 })}`;
  }

  /** Whole days from today (local) until a YYYY-MM-DD date; negative when past. */
  function daysUntil(d: string) {
    const today = new Date(localToday()).getTime();
    return Math.round((new Date(d).getTime() - today) / 86_400_000);
  }

  /**
   * Due status of a need from the `need_schedule` view. A need never served and
   * without a start date is simply "not given yet": its fallback due date is the
   * UTC creation date, which would read as "overdue" in timezones ahead of UTC.
   */
  function dueStatus(s: { next_due_date: string | null; last_distribution_date: string | null; start_date?: string | null }) {
    if (!s.next_due_date) return null;
    if (!s.last_distribution_date && !s.start_date) return { text: t("dashboard.upcomingNeeds.notGivenYet"), urgent: true };
    const days = daysUntil(s.next_due_date);
    if (days < 0) return { text: t("dashboard.upcomingNeeds.overdue", { n: -days }, -days), urgent: true };
    if (days === 0) return { text: t("dashboard.upcomingNeeds.dueToday"), urgent: true };
    return { text: t("dashboard.upcomingNeeds.dueIn", { n: days }, days), urgent: false };
  }

  const label = (group: "status" | "needType" | "frequency" | "urgency" | "needStatus" | "role" | "paymentMethod", value?: string | null) =>
    value ? t(`enums.${group}.${value}`) : "—";

  const badge = (group: keyof typeof BADGE, value: string) => BADGE[group]?.[value] ?? "badge-slate";

  return { formatDate, formatDateTime, formatMoney, daysUntil, dueStatus, label, badge };
}
