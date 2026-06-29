import { EmailService as PremiumEmailService } from "../email";
import { getSupabaseAdmin } from "@/lib/supabase";

export class EmailService {
  // Backwards compatibility with standard email sending
  static async sendEmail(to: string, subject: string, html: string) {
    return PremiumEmailService.sendEmail(to, subject, html);
  }

  // Welcome Email remains as simple HTML or can be expanded
  static async sendWelcomeEmail(to: string, name: string) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const html = `
      <div style="font-family: 'Playfair Display', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #faf9f6; color: #1a1612; border: 1px solid #e2dcd0;">
        <h1 style="text-align: center; letter-spacing: 0.15em; font-weight: 400; text-transform: uppercase;">DRAPEVA</h1>
        <p style="text-align: center; font-size: 0.75rem; letter-spacing: 0.25em; text-transform: uppercase; color: #8c7853; margin-top: -10px;">Atelier</p>
        <hr style="border: 0; border-top: 1px solid #e2dcd0; margin: 30px 0;" />
        <p>Dear ${name},</p>
        <p>Welcome to the DRAPEVA STORE. Your account has been successfully registered.</p>
        <p>Discover our heirloom Banarasi weaves, bridal Kanjivarams, and styling consultations designed to celebrate your most precious moments.</p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${appUrl}/shop" style="background-color: #1a1612; color: #faf9f6; padding: 15px 30px; text-decoration: none; font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase;">Explore the Maison</a>
        </div>
        <p style="font-size: 0.85rem; color: #8c7853; line-height: 1.6;">Warmest regards,<br/>The Drapeva Concierge Team</p>
      </div>
    `;
    return this.sendEmail(to, "Welcome to DRAPEVA STORE", html);
  }

  // Core helper to fetch order details and send premium confirmation
  static async sendOrderConfirmation(to: string, name: string, orderId: string, total: number) {
    try {
      const supabase = getSupabaseAdmin();
      const { data: order, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error || !order) {
        console.error(
          `[Email Service fallback] Could not find order ${orderId} for rich email, sending simplified confirmation.`,
          error,
        );
        // Fallback simple email
        const fallbackHtml = `
          <div style="font-family: 'Playfair Display', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #faf9f6; color: #1a1612; border: 1px solid #e2dcd0;">
            <h1 style="text-align: center; letter-spacing: 0.15em; font-weight: 400; text-transform: uppercase;">DRAPEVA</h1>
            <p style="text-align: center; font-size: 0.75rem; letter-spacing: 0.25em; text-transform: uppercase; color: #8c7853; margin-top: -10px;">Atelier</p>
            <hr style="border: 0; border-top: 1px solid #e2dcd0; margin: 30px 0;" />
            <p>Dear ${name},</p>
            <p>We are delighted to confirm receipt of your order <strong>#${orderId}</strong>.</p>
            <p>Order Total: <strong>₹${total.toLocaleString("en-IN")}</strong></p>
            <p>Estimated Delivery: <strong>10–15 Business Days</strong></p>
            <p style="font-size: 0.85rem; color: #8c7853; line-height: 1.6;">With compliments,<br/>The Drapeva Concierge Team</p>
          </div>
        `;
        return this.sendEmail(to, "Your Drapeva Order has been Confirmed ✨", fallbackHtml);
      }

      // Convert order items to required format
      const items = Array.isArray(order.items) ? order.items : [];

      const orderData = {
        items,
        subtotal: Number(order.subtotal || order.total || total),
        tax: Number(order.tax || 0),
        shippingCost: Number(order.shipping_cost || 0),
        discount: Number(order.discount || 0),
        total: Number(order.total || total),
        shippingAddress: order.shipping_address || {},
        paymentMethod: order.payment_status === "cod" ? "Cash on Delivery" : "Online Payment",
        paymentStatus: order.payment_status || "pending",
        createdAt: new Date(order.created_at || Date.now()).toLocaleString("en-IN"),
      };

      // Trigger customer email
      try {
        await PremiumEmailService.sendOrderConfirmation(to, name, orderId, orderData);
      } catch (custErr) {
        console.error("[Email Service] Customer confirmation email failed:", custErr);
      }

      // Trigger admin email (run sequentially to prevent duplicate logging race conditions)
      try {
        await PremiumEmailService.sendAdminNotification(orderId, {
          customerName: name,
          customerEmail: to,
          customerPhone: order.customer_phone || undefined,
          items,
          total: orderData.total,
          shippingAddress: orderData.shippingAddress,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentStatus,
          createdAt: orderData.createdAt,
        });
      } catch (adminErr) {
        console.error("[Email Service] Admin order notification failed:", adminErr);
      }

      return { success: true };
    } catch (err) {
      console.error("[Email Service] Failed in sendOrderConfirmation wrapper:", err);
      return null;
    }
  }

  // Appointment confirmation
  static async sendAppointmentConfirmation(
    to: string,
    name: string,
    dateStr: string,
    timeSlot: string,
    type: string,
  ) {
    const html = `
      <div style="font-family: 'Playfair Display', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #faf9f6; color: #1a1612; border: 1px solid #e2dcd0;">
        <h1 style="text-align: center; letter-spacing: 0.15em; font-weight: 400; text-transform: uppercase;">DRAPEVA</h1>
        <p style="text-align: center; font-size: 0.75rem; letter-spacing: 0.25em; text-transform: uppercase; color: #8c7853; margin-top: -10px;">Atelier</p>
        <hr style="border: 0; border-top: 1px solid #e2dcd0; margin: 30px 0;" />
        <p>Dear ${name},</p>
        <p>Your bridal/couture consultation has been scheduled.</p>
        <p><strong>Date:</strong> ${dateStr}</p>
        <p><strong>Time Slot:</strong> ${timeSlot}</p>
        <p><strong>Type:</strong> ${type === "VIDEO" ? "Video Consultation" : "In-Person Atelier Visit"}</p>
        <p>Our concierge will reach out to you shortly via WhatsApp to share details or link invites.</p>
        <p style="font-size: 0.85rem; color: #8c7853; line-height: 1.6;">With compliments,<br/>The Drapeva Concierge Team</p>
      </div>
    `;
    return this.sendEmail(to, "Atelier Consultation Scheduled — Drapeva", html);
  }
}
