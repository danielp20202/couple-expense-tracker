import { cookies } from "next/headers";

/**
 * "Selected profile" — a Netflix-style profile switcher, NOT authentication.
 * Either person can pick a profile; it just controls whose perspective the
 * dashboard shows. Stored in a cookie so it's remembered across visits and
 * readable from server components.
 *
 * When real auth is added later, this selection becomes "the logged-in user"
 * and the personalized views carry over unchanged.
 */
export const SELECTED_PROFILE_COOKIE = "profile_id";

export function getSelectedProfileId(): string | null {
  return cookies().get(SELECTED_PROFILE_COOKIE)?.value ?? null;
}
