/**
 * Client-side Supabase singleton.
 *
 * This file is ONLY imported by client components and lib files
 * used in the browser (api.ts, auth-store.ts, storage.ts, etc.).
 *
 * For server-side usage (API routes, Server Components), use
 * @/lib/supabase/server — which creates a per-request client.
 *
 * For admin/service-role operations (webhooks), use getSupabaseAdmin()
 * from this file — it creates a fresh client per call so it is never
 * instantiated at module scope during build time.
 */

import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database, MakeDatabaseCompat } from "./types";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  // During SSR/build this is expected when env vars are absent.
  // The warning prevents a silent failure; real operations will fail
  // with a descriptive error from the Supabase client itself.
  if (typeof window !== "undefined") {
    console.warn(
      "[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Check your .env.local file.",
    );
  }
}

// Browser client — uses @supabase/ssr so sessions are stored in cookies,
// letting the Next.js middleware read auth state server-side.
export const supabase = createBrowserClient<MakeDatabaseCompat<Database>>(
  supabaseUrl,
  supabaseAnonKey,
) as unknown as SupabaseClient<MakeDatabaseCompat<Database>>;

/**
 * Returns an admin Supabase client using the service role key.
 * MUST only be called server-side (API routes / Server Actions).
 * Creates a fresh client per call — never cached at module scope.
 */
export const getSupabaseAdmin = (): SupabaseClient<MakeDatabaseCompat<Database>> => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      "Missing env var: SUPABASE_SERVICE_ROLE_KEY. " +
        "This is required for admin / webhook Supabase operations.",
    );
  }
  return createSupabaseClient<MakeDatabaseCompat<Database>>(
    supabaseUrl,
    serviceKey,
  ) as unknown as SupabaseClient<MakeDatabaseCompat<Database>>;
};
