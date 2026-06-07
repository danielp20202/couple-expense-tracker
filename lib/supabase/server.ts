import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client, used in server components and server actions.
 *
 * No auth in this version, so it uses the public anon key. Created per request
 * (cheap) to keep things stateless. When you add login later, switch to
 * @supabase/ssr to attach the user's cookie-based session here.
 */
export function getSupabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
