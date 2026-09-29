import type { AuthError } from "@supabase/supabase-js";

const KNOWN_CODES = [
  "invalid_credentials",
  "email_not_confirmed",
  "user_already_exists",
  "email_exists",
  "weak_password",
  "same_password",
  "over_email_send_rate_limit",
  "over_request_rate_limit",
] as const;

/** Translate Supabase Auth errors (English-only upstream) into the user's language. */
export function useAuthError() {
  const { t } = useI18n();

  return (err: Pick<AuthError, "message" | "name"> & { code?: string }) => {
    if (err.code && (KNOWN_CODES as readonly string[]).includes(err.code)) return t(`auth.errors.${err.code}`);
    if (err.name === "AuthSessionMissingError") return t("auth.errors.session_missing");
    return err.message;
  };
}
