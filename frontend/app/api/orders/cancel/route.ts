import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // Fetch the order to verify ownership and check current status
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify ownership
    if (order.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to this order" }, { status: 403 });
    }

    // Verify current status allows cancellation
    if (!["pending", "processing"].includes(order.status)) {
      return NextResponse.json(
        { error: "Order cannot be cancelled at this stage" },
        { status: 400 },
      );
    }

    // Verify it is within the cancellation window (the day of ordering and the next day)
    const orderDate = new Date(order.created_at);
    const currentDate = new Date();
    const orderStart = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());
    const currentStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
    );
    const diffTime = currentStart.getTime() - orderStart.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      return NextResponse.json({ error: "Cancellation window has expired" }, { status: 400 });
    }

    // Use admin client to bypass RLS and perform update directly
    const adminSupabase = getSupabaseAdmin();
    const { error: updateError } = await adminSupabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Create audit log
    try {
      await adminSupabase.from("audit_logs").insert({
        action: `Customer cancelled order: ${orderId}`,
        resource_type: "order",
        resource_id: orderId,
        admin_email: user.email || null,
        admin_id: user.id,
        old_data: null,
        new_data: null,
        ip_address: null,
      });
    } catch (e) {
      console.error("Failed to insert audit log:", e);
    }

    return NextResponse.json({ success: true, message: "Order cancelled successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
