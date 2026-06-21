import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PaymentService } from "@/lib/services/payment";
import { EmailService } from "@/lib/services/email";
import { WhatsAppService } from "@/lib/services/whatsapp";

// Razorpay SDK uses Node.js crypto \u2014 must run on Node.js runtime.
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, signature } = await request.json();
    if (!orderId || !razorpayPaymentId || !razorpayOrderId || !signature) {
      return NextResponse.json({ error: "Missing required verification details" }, { status: 400 });
    }

    // Verify signature
    const success = PaymentService.verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      signature,
    );

    if (!success) {
      return NextResponse.json(
        { error: "Payment verification failed: signature mismatch" },
        { status: 400 },
      );
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

    // Update order status in Supabase
    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "processing",
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: signature,
      })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError || !order) {
      return NextResponse.json(
        { error: "Failed to update paid order status in Supabase" },
        { status: 500 },
      );
    }

    // Send notifications
    try {
      await EmailService.sendOrderConfirmation(
        order.customer_email,
        order.customer_name,
        order.id,
        order.total,
      );

      if (order.customer_phone) {
        await WhatsAppService.sendOrderUpdate(
          order.customer_phone,
          order.order_number || order.id,
          "processing",
        );
      }
    } catch (notifyErr) {
      console.error("Failed to send payment verification notifications:", notifyErr);
    }

    return NextResponse.json({ success: true, message: "Payment verified and order updated" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
