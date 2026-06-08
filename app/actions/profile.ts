"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SELECTED_PROFILE_COOKIE } from "@/lib/profile-session";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Pick a profile (from the picker) and remember it, then go to the dashboard. */
export async function selectProfile(id: string) {
  cookies().set(SELECTED_PROFILE_COOKIE, id, {
    path: "/",
    maxAge: ONE_YEAR,
    httpOnly: true,
    sameSite: "lax",
  });
  redirect("/dashboard");
}

/** Forget the current profile and return to the picker. */
export async function switchProfile() {
  cookies().delete(SELECTED_PROFILE_COOKIE);
  redirect("/select");
}
