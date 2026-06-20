import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PaymentService } from "@/lib/services/payment";

// Razorpay SDK uses Node.js crypto \u2014 must run on Node.js runtime.
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { orderId, amount } = await request.json();
    if (!orderId || !amount) {
      return NextResponse.json({ error: "orderId and amount are required" }, { status: 400 });
    }

    // Initialize Supabase Server client
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch order from Supabase to verify it belongs to user
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.user_id !== user.id && order.user_id !== null) {
      return NextResponse.json({ error: "Unauthorized order access" }, { status: 403 });
    }

    if (Math.round(Number(order.total)) !== Math.round(Number(amount))) {
      return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
    }

    // Create Razorpay order
    const rzpOrder = await PaymentService.createRazorpayOrder(orderId, order.total);

    // Update Supabase order with Razorpay Order ID
    const { error: updateError } = await supabase
      .from("orders")
      .update({ razorpay_order_id: rzpOrder.id })
      .eq("id", orderId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update order with Razorpay ID" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
