import { createClient } from "@supabase/supabase-js";
import type { Database, MakeDatabaseCompat } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing Supabase environment variables. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

export const supabase = createClient<MakeDatabaseCompat<Database>>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Admin client using service role (only for server-side Edge Functions)
// DO NOT expose service role key in browser
export const getSupabaseAdmin = () => {
  const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";
  if (!serviceKey) throw new Error("Service role key not available in browser");
  return createClient<MakeDatabaseCompat<Database>>(supabaseUrl, serviceKey);
};

