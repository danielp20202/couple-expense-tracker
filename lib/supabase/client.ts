"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client, used inside client components.
 *
 * NOTE: there is no auth in this version of the app, so this uses the public
 * anon key directly. When you add login later, switch to @supabase/ssr so the
 * user's session is read from cookies instead.
 */
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
