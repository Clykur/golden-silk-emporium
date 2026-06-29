import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { EmailService } from "@/lib/services/email";
import { getSupabaseAdmin } from "@/lib/supabase";

// Uses Supabase SSR cookie APIs — pin to Node.js runtime.
export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Authenticate user if they are logged in (optional but good practice)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // We bypass RLS to insert using admin client to ensure consistency
    const adminSupabase = getSupabaseAdmin();

    const { data: order, error } = await adminSupabase
      .from("orders")
      .insert({
        ...body,
        user_id: user?.id || body.user_id || null,
      })
      .select()
      .single();

    if (error || !order) {
      console.error("[POST /api/orders] Order creation failed:", error);
      return NextResponse.json(
        { error: error?.message || "Failed to create order" },
        { status: 500 },
      );
    }

    // Trigger emails asynchronously. Order creation MUST NOT fail even if emails fail.
    try {
      EmailService.sendOrderConfirmation(
        order.customer_email,
        order.customer_name,
        order.id,
        order.total,
      ).catch((err) => {
        console.error("[POST /api/orders] Async email notification failed:", err);
      });
    } catch (emailErr) {
      console.error("[POST /api/orders] Email service call failed synchronously:", emailErr);
    }

    // Create Audit Log
    try {
      await adminSupabase.from("audit_logs").insert({
        action: `Created order with status ${order.status}`,
        resource_type: "order",
        resource_id: order.id,
        admin_email: user?.email || null,
        admin_id: user?.id || null,
        old_data: null,
        new_data: null,
        ip_address: null,
      });
    } catch (auditErr) {
      console.error("[POST /api/orders] Failed to create audit log:", auditErr);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/orders] Internal Server Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
