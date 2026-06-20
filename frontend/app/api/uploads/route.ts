import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Uses Supabase SSR cookie APIs \u2014 pin to Node.js runtime.
export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ message: "Direct storage uploads recommended. Use supabase client." });
}
