import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email, phone, password, name } = await request.json();

    if (!email && !phone) {
      return NextResponse.json({ error: "Either email or phone is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Restrict duplicates
    if (email) {
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (checkError) {
        console.error("Duplicate check error for email:", checkError);
      }
      if (existingUser) {
        return NextResponse.json({ error: "Email already registered" }, { status: 400 });
      }
    }

    if (phone) {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("phone", formattedPhone)
        .maybeSingle();

      if (checkError) {
        console.error("Duplicate check error for phone:", checkError);
      }
      if (existingUser) {
        return NextResponse.json({ error: "Phone number already registered" }, { status: 400 });
      }
    }

    // 2. Create the user in auth.users
    const createUserParams: any = {
      password,
      user_metadata: { name, role: "customer", phone: phone || "" },
    };

    if (email) {
      createUserParams.email = email;
      createUserParams.email_confirm = true;
    } else if (phone) {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
      createUserParams.phone = formattedPhone;
      createUserParams.phone_confirm = true;
    }

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
