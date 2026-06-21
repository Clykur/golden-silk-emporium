import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { EmailService } from "@/lib/services/email";
import { WhatsAppService } from "@/lib/services/whatsapp";

// This route uses Node.js crypto — must run on Node.js runtime, not Edge.
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
    }

    // Resolve secret inside handler so it reads the live env var at runtime.
    const RAZORPAY_WEBHOOK_SECRET =
      process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "";

    const rawBody = await request.text();

    // Verify webhook signature (skip in non-production if secret is absent)
    if (RAZORPAY_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    } else if (process.env.NODE_ENV === "production") {
      // In production, secret MUST be set
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    console.info(`[Razorpay Webhook] Received event: ${event}`);

    if (event === "payment.captured") {
      const payment = payload.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      // Initialize admin client to run background updates (RLS blocks standard auth context in webhooks)
      const supabaseAdmin = getSupabaseAdmin();

      // Find order in Supabase by Razorpay Order ID
      const { data: order, error } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("razorpay_order_id", razorpayOrderId)
        .single();

      if (error || !order) {
        console.warn(
          `[Razorpay Webhook] Order not found for Razorpay Order ID: ${razorpayOrderId}`,
        );
        return NextResponse.json({ status: "ignored_order_not_found" });
      }

      // If order is already processed, ignore
      if (order.payment_status === "paid") {
        return NextResponse.json({ status: "already_processed" });
      }

      // Update Supabase order
      const { data: updatedOrder, error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          status: "processing",
          razorpay_payment_id: razorpayPaymentId,
        })
        .eq("id", order.id)
        .select()
        .single();

      if (updateError || !updatedOrder) {
        console.error(
          `[Razorpay Webhook] Failed to update order status in Supabase: ${updateError?.message}`,
        );
        return NextResponse.json({ error: "Database update failed" }, { status: 500 });
      }

      // Send notifications
      try {
        await EmailService.sendOrderConfirmation(
          updatedOrder.customer_email,
          updatedOrder.customer_name,
          updatedOrder.id,
          updatedOrder.total,
        );

        if (updatedOrder.customer_phone) {
          await WhatsAppService.sendOrderUpdate(
            updatedOrder.customer_phone,
            updatedOrder.order_number || updatedOrder.id,
            "processing",
          );
        }
      } catch (notifyErr) {
        console.error("Failed to send webhook order confirmation notifications:", notifyErr);
      }

      console.log(`[Razorpay Webhook] Successfully processed payment for order ${updatedOrder.id}`);
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error(`[Razorpay Webhook Error] ${err.message}`);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
