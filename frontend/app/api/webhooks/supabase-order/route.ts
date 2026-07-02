import { NextResponse } from "next/server";
import { EmailService } from "@/lib/services/email";
import { WhatsAppService } from "@/lib/services/whatsapp";

// Uses ZeptoMail (Node.js HTTP) — pin to Node.js runtime.
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // Resolve secret at runtime so it always reads the live env var.
    const ORDER_WEBHOOK_SECRET = process.env.ORDER_WEBHOOK_SECRET || "";

    const token = request.headers.get("x-webhook-secret");
    if (!token || (ORDER_WEBHOOK_SECRET && token !== ORDER_WEBHOOK_SECRET)) {
      return NextResponse.json({ error: "Unauthorized webhook caller" }, { status: 401 });
    }
    if (!ORDER_WEBHOOK_SECRET && process.env.NODE_ENV === "production") {
      // Production requires the secret to be configured
      return NextResponse.json(
        { error: "Webhook secret not configured on server" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { type, record, old_record } = body;
    if (!type || !record) {
      return NextResponse.json({ error: "Invalid webhook payload structure" }, { status: 400 });
    }

    console.log(`[Supabase Webhook] Received event type: ${type} for order ${record.id}`);

    // A. Cash on Delivery Confirmation
    if (type === "INSERT" && record.payment_status === "cod") {
      await EmailService.sendOrderConfirmation(
        record.customer_email,
        record.customer_name,
        record.id,
        record.total,
      );

      if (record.customer_phone) {
        await WhatsAppService.sendOrderUpdate(
          record.customer_phone,
          record.order_number || record.id,
          "pending",
        );
      }
      console.log(
        `[Supabase Webhook] Dispatched COD confirmation notifications for order ${record.id}`,
      );
    }

    // B. Order Status Changes (e.g. processing -> shipped -> delivered)
    if (type === "UPDATE" && old_record && old_record.status !== record.status) {
      await EmailService.sendEmail(
        record.customer_email,
        `Your Drapeva Order Update - ${record.order_number || "#" + record.id.slice(0, 8).toUpperCase()}`,
        `
        <div style="font-family: 'Playfair Display', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #faf9f6; color: #1a1612; border: 1px solid #e2dcd0;">
          <h1 style="text-align: center; letter-spacing: 0.15em; font-weight: 400; text-transform: uppercase;">DRAPEVA</h1>
          <p style="text-align: center; font-size: 0.75rem; letter-spacing: 0.25em; text-transform: uppercase; color: #8c7853; margin-top: -10px;">Curated Heritage</p>
          <hr style="border: 0; border-top: 1px solid #e2dcd0; margin: 30px 0;" />
          <p>Dear ${record.customer_name},</p>
          <p>The status of your curated saree order <strong>${record.order_number || "#" + record.id.slice(0, 8).toUpperCase()}</strong> has been updated to: <strong>${record.status.toUpperCase()}</strong>.</p>
          ${record.tracking_number ? `<p>Tracking Number: <strong>${record.tracking_number}</strong></p>` : ""}
          <p>Warmest regards,<br/>The Drapeva Concierge Team</p>
        </div>
        `,
      );

      if (record.customer_phone) {
        await WhatsAppService.sendOrderUpdate(
          record.customer_phone,
          record.order_number || record.id,
          record.status,
        );
      }
      console.log(
        `[Supabase Webhook] Dispatched status update notifications for order ${record.id} -> ${record.status}`,
      );
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error(`[Supabase Webhook Error] ${err.message}`);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
