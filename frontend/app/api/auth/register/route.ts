import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email, phone, password, name } = await request.json();

    if (!email || !phone || !password || !name) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;

    // 1. Restrict duplicates
    const { data: existingEmail, error: emailCheckError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (emailCheckError) {
      console.error("Duplicate check error for email:", emailCheckError);
    }
    if (existingEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const { data: profiles, error: phoneCheckError } = await supabaseAdmin
      .from("profiles")
      .select("phone")
      .not("phone", "is", null);

    if (phoneCheckError) {
      console.error("Duplicate check error for phone:", phoneCheckError);
    }

    const cleanInput = phone.replace(/\D/g, "");
    if (cleanInput.length < 10) {
      return NextResponse.json(
        { error: "Invalid phone number format. Must contain at least 10 digits." },
        { status: 400 },
      );
    }
    const inputLast10 = cleanInput.slice(-10);

    const phoneExists = profiles?.some((p) => {
      if (!p.phone) return false;
      const cleanDbPhone = p.phone.replace(/\D/g, "");
      if (cleanDbPhone.length < 10) {
        return cleanDbPhone === cleanInput;
      }
      return cleanDbPhone.slice(-10) === inputLast10;
    });

    if (phoneExists) {
      return NextResponse.json({ error: "Phone number already registered" }, { status: 400 });
    }

    // 2. Create the user in auth.users
    const createUserParams = {
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: "customer", phone: formattedPhone },
    };

    const { data, error } = await supabaseAdmin.auth.admin.createUser(createUserParams);

    if (error) {
      console.error("Failed to create auth user:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create user in Auth provider" },
        { status: 400 },
      );
    }

    console.log(`Successfully registered user in auth: ${data.user.id}`);
    return NextResponse.json({ user: data.user });
  } catch (err: any) {
    console.error("Unhandled error in registration API:", err);
    const errorMessage =
      err?.message ||
      (typeof err === "string" ? err : JSON.stringify(err)) ||
      "Unknown registration error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
