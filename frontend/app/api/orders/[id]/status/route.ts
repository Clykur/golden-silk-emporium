import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { EmailService } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, tracking_number, courier_name, tracking_url } = body;

    if (!id) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Authenticate user to verify admin role
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const adminSupabase = getSupabaseAdmin();
    const { data: profile } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json({ error: "Access denied. Admins only." }, { status: 403 });
    }

    // Prep update fields
    const now = new Date().toISOString();
    const updateData: any = {
      status,
      updated_at: now,
    };

    if (tracking_number !== undefined) updateData.tracking_number = tracking_number;
    if (courier_name !== undefined) updateData.courier_name = courier_name;
    if (tracking_url !== undefined) updateData.tracking_url = tracking_url;

    if (status.toUpperCase() === "SHIPPED") {
      updateData.shipped_at = now;
    } else if (status.toUpperCase() === "DELIVERED") {
      updateData.delivered_at = now;
    }

    // Update order in Supabase
    const { data: order, error: updateError } = await adminSupabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError || !order) {
      console.error("[PATCH /api/orders/:id/status] Update failed:", updateError);
      return NextResponse.json(
        { error: updateError?.message || "Failed to update order" },
        { status: 500 },
      );
    }

    // Log the change in audit_logs
    try {
      await adminSupabase.from("audit_logs").insert({
        action: `Updated order status to ${status}`,
        resource_type: "order",
        resource_id: id,
        admin_email: user.email || null,
        admin_id: user.id,
        old_data: null,
        new_data: null,
        ip_address: null,
      });
    } catch (auditErr) {
      console.error("[PATCH /api/orders/:id/status] Failed to create audit log:", auditErr);
    }

    // Trigger emails asynchronously
    const normalizedStatus = status.toUpperCase();
    if (normalizedStatus === "SHIPPED" && order.tracking_number) {
      EmailService.sendOrderShipped(order.customer_email, order.customer_name, order.id, {
        courierName: (order.courier_name as any) || "Delivery Partner",
        trackingNumber: order.tracking_number as any,
        trackingUrl: (order.tracking_url as any) || undefined,
        estimatedDelivery: "10-15 Business Days",
        items: Array.isArray(order.items) ? order.items : [],
      }).catch((err) => console.error("[PATCH status] Shipped email dispatch error:", err));
    } else if (normalizedStatus === "DELIVERED") {
      EmailService.sendOrderDelivered(order.customer_email, order.customer_name, order.id, {
        deliveredDate: new Date((order.delivered_at as any) || Date.now()).toLocaleDateString(
          "en-IN",
        ),
        items: Array.isArray(order.items) ? order.items : [],
      }).catch((err) => console.error("[PATCH status] Delivered email dispatch error:", err));
    }

    return NextResponse.json(order);
  } catch (err: any) {
    console.error("[PATCH /api/orders/:id/status] Internal error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
