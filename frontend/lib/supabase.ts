import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database, MakeDatabaseCompat } from "./types";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

// Use @supabase/ssr createBrowserClient so sessions are stored in cookies.
// This allows the Next.js middleware (which reads cookies) to correctly
// detect authenticated users — fixing the "redirect to login" issue.
export const supabase = createBrowserClient<MakeDatabaseCompat<Database>>(
  supabaseUrl,
  supabaseAnonKey,
) as unknown as SupabaseClient<MakeDatabaseCompat<Database>>;

// Admin client using service role (only for server-side Edge Functions)
// DO NOT expose service role key in browser
export const getSupabaseAdmin = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!serviceKey) throw new Error("Service role key not available");
  return createClient<MakeDatabaseCompat<Database>>(supabaseUrl, serviceKey);
};
