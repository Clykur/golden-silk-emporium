import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Uses Supabase SSR (Node.js cookie APIs) — pin to Node.js runtime.
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email, password, action } = await request.json();
    const supabase = await createClient();

    if (action === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json(data);
    } else if (action === "register") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json(data);
    } else if (action === "logout") {
      const { error } = await supabase.auth.signOut();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
