import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("email, phone")
      .not("phone", "is", null);

    if (error) {
      console.error("Error looking up email by phone:", error);
      return NextResponse.json({ error: "Failed to query database" }, { status: 500 });
    }

    const cleanInput = phone.replace(/\D/g, "");
    if (cleanInput.length < 10) {
      return NextResponse.json(
        { error: "Invalid phone number format. Must contain at least 10 digits." },
        { status: 400 },
      );
    }
    const inputLast10 = cleanInput.slice(-10);

    const matchedProfile = profiles?.find((p) => {
      if (!p.phone) return false;
      const cleanDbPhone = p.phone.replace(/\D/g, "");
      if (cleanDbPhone.length < 10) {
        return cleanDbPhone === cleanInput;
      }
      return cleanDbPhone.slice(-10) === inputLast10;
    });

    if (!matchedProfile || !matchedProfile.email) {
      return NextResponse.json(
        { error: "No account found associated with this phone number" },
        { status: 404 },
      );
    }

    return NextResponse.json({ email: matchedProfile.email });
  } catch (err: any) {
    console.error("Unhandled error in lookup-email API:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
