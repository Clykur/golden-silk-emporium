import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Uses Supabase SSR cookie APIs \u2014 pin to Node.js runtime.
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get("featured") === "true";

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, images:product_images(*), reviews:reviews(rating, is_approved)");
  if (featured) {
    query = query.eq("is_featured", true);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}
