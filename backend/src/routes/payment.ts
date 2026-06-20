import { Router, Response } from "express";
import { PaymentService } from "../services/payment.js";
import { EmailService } from "../services/email.js";
import { WhatsAppService } from "../services/whatsapp.js";
import { getSupabaseClient } from "../services/supabase.js";

const router = Router();

// Middleware to authenticate Supabase JWT token
async function authenticateSupabase(req: any, res: Response, next: any) {
  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const client = await getSupabaseClient();
    if (!client) {
      return res.status(500).json({ error: "Supabase client not initialized" });
    }
    try {
      const {
        data: { user },
        error,
      } = await client.auth.getUser(token);
      if (error || !user) {
        return res.status(403).json({ error: "Invalid or expired Supabase token" });
      }
      req.user = {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role === "admin" ? "ADMIN" : "CUSTOMER",
      };
      next();
    } catch (err: any) {
      return res.status(403).json({ error: err.message || "Failed to authenticate token" });
    }
  } else {
    res.status(401).json({ error: "Authorization token required" });
  }
}

// 1. Create Razorpay Order
router.post("/create", authenticateSupabase, async (req: any, res: Response) => {
  try {
    const { orderId, amount } = req.body;
    if (!orderId || !amount) {
      return res.status(400).json({ error: "orderId and amount are required" });
    }

    const client = await getSupabaseClient();
    if (!client) {
      return res.status(500).json({ error: "Supabase client not initialized" });
    }

    // Fetch order to verify
    const { data: order, error } = await client
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Authorization check
    if (order.user_id !== req.user.id && req.user.role !== "ADMIN" && order.user_id !== null) {
      return res.status(403).json({ error: "Unauthorized order access" });
    }

    // Verify amount
    if (Math.round(Number(order.total)) !== Math.round(Number(amount))) {
      return res.status(400).json({ error: "Payment amount mismatch" });
    }

    // Create Razorpay order
    const rzpOrder = await PaymentService.createRazorpayOrder(orderId, order.total);

    // Update order with Razorpay Order ID
    const { error: updateError } = await client
      .from("orders")
      .update({ razorpay_order_id: rzpOrder.id })
      .eq("id", orderId);

    if (updateError) {
      return res.status(500).json({ error: "Failed to update order with Razorpay ID" });
    }

    return res.json({
      id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

// 2. Verify Razorpay Payment
router.post("/verify", authenticateSupabase, async (req: any, res: Response) => {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, signature } = req.body;
    if (!orderId || !razorpayPaymentId || !razorpayOrderId || !signature) {
      return res.status(400).json({ error: "Missing required verification details" });
    }

    // Verify signature
    const success = PaymentService.verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      signature,
    );

    if (!success) {
      return res.status(400).json({ error: "Payment verification failed: signature mismatch" });
    }

    const client = await getSupabaseClient();
    if (!client) {
      return res.status(500).json({ error: "Supabase client not initialized" });
    }

    // Update order status in Supabase
    const { data: order, error: updateError } = await client
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
      return res.status(500).json({ error: "Failed to update paid order status in Supabase" });
    }

    // Send notifications
    try {
      await EmailService.sendOrderConfirmation(
        order.customer_email || order.email,
        order.customer_name || order.name,
        order.id,
        order.total,
      );

      const phone = order.customer_phone || order.phone;
      if (phone) {
        await WhatsAppService.sendOrderUpdate(phone, order.id, "processing");
      }
    } catch (notifyErr) {
      console.error("Failed to send payment verification notifications:", notifyErr);
    }

    return res.json({ success: true, message: "Payment verified and order updated" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

export default router;
