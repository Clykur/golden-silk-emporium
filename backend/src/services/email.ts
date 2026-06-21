import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "re_mock_resend_api_key";
const isResendMocked = resendApiKey.includes("mock");
const resend = !isResendMocked ? new Resend(resendApiKey) : null;

export class EmailService {
  static async sendEmail(to: string, subject: string, html: string) {
    if (isResendMocked) {
      console.log(`[Resend Mock] Email sent to: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body snippet: ${html.substring(0, 200)}...`);
      return { id: "resend_mock_id_" + Math.random().toString(36).substring(4) };
    }

    try {
      const data = await resend!.emails.send({
        from: "Drapeva <atelier@drapeva.com>",
        to: [to],
        subject,
        html,
      });
      return data;
    } catch (err) {
      console.error("Resend Email error:", err);
      // Don't crash the server if email fails
      return null;
    }
  }

  static async sendWelcomeEmail(to: string, name: string) {
    const html = `
      <div style="font-family: 'Playfair Display', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #faf9f6; color: #1a1612; border: 1px solid #e2dcd0;">
        <h1 style="text-align: center; letter-spacing: 0.15em; font-weight: 400; text-transform: uppercase;">DRAPEVA</h1>
        <p style="text-align: center; font-size: 0.75rem; letter-spacing: 0.25em; text-transform: uppercase; color: #8c7853; margin-top: -10px;">Atelier</p>
        <hr style="border: 0; border-top: 1px solid #e2dcd0; margin: 30px 0;" />
        <p>Dear ${name},</p>
        <p>Welcome to the Drapeva atelier. Your account has been successfully registered.</p>
        <p>Discover our heirloom Banarasi weaves, bridal Kanjivarams, and styling consultations designed to celebrate your most precious moments.</p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="http://localhost:3000/shop" style="background-color: #1a1612; color: #faf9f6; padding: 15px 30px; text-decoration: none; font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase;">Explore the Collection</a>
        </div>
        <p style="font-size: 0.85rem; color: #8c7853; line-height: 1.6;">Warmest regards,<br/>The Drapeva Concierge Team</p>
      </div>
    `;
    return this.sendEmail(to, "Welcome to Drapeva Atelier", html);
  }

  static async sendOrderConfirmation(to: string, name: string, orderId: string, total: number) {
    const html = `
      <div style="font-family: 'Playfair Display', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #faf9f6; color: #1a1612; border: 1px solid #e2dcd0;">
        <h1 style="text-align: center; letter-spacing: 0.15em; font-weight: 400; text-transform: uppercase;">DRAPEVA</h1>
        <p style="text-align: center; font-size: 0.75rem; letter-spacing: 0.25em; text-transform: uppercase; color: #8c7853; margin-top: -10px;">Atelier</p>
        <hr style="border: 0; border-top: 1px solid #e2dcd0; margin: 30px 0;" />
        <p>Dear ${name},</p>
        <p>We are delighted to confirm receipt of your order <strong>#${orderId}</strong>.</p>
        <p>Our master artisans in our Mumbai studio have commenced work on your made-to-order couture. The estimated delivery duration is 3 to 6 weeks.</p>
        <p>Order Total: <strong>₹${total.toLocaleString("en-IN")}</strong></p>
        <p>You can track the progress of your piece at any time in your customer dashboard.</p>
        <p style="font-size: 0.85rem; color: #8c7853; line-height: 1.6;">With compliments,<br/>The Drapeva Concierge Team</p>
      </div>
    `;
    return this.sendEmail(to, `Order Confirmation #${orderId} — Drapeva`, html);
  }

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
