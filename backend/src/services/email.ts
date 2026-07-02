const apiKey = process.env.ZEPTOMAIL_API_KEY || "";
const fromEmail = process.env.ZEPTOMAIL_FROM_EMAIL || "bounce@pepisandbox.com";
const fromName = process.env.ZEPTOMAIL_FROM_NAME || "Drapeva";
const isMocked = !apiKey || apiKey.includes("mock");

export class EmailService {
  static async sendEmail(to: string, subject: string, html: string) {
    if (isMocked) {
      console.log(`[ZeptoMail Mock] Email sent to: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body snippet: ${html.substring(0, 200)}...`);
      return { id: "zeptomail_mock_id_" + Math.random().toString(36).substring(4) };
    }

    // 1. Verify endpoint based on the account region (.in vs .com)
    const isIndia =
      fromEmail.toLowerCase().endsWith(".in") || fromEmail.toLowerCase().includes(".co.in");
    const endpoint = isIndia
      ? "https://api.zeptomail.in/v1.1/email"
      : "https://api.zeptomail.com/v1.1/email";

    // 2. Verify Authorization header format
    const authHeader = apiKey.startsWith("Zoho-enczapikey ") ? apiKey : `Zoho-enczapikey ${apiKey}`;

    // 3. Verify request body exactly matches the official specification
    const payload = {
      from: {
        address: fromEmail,
        name: fromName,
      },
      to: [
        {
          email_address: {
            address: to,
            name: to.split("@")[0],
          },
        },
      ],
      subject,
      htmlbody: html,
    };

    try {
      // 6. Log request URL, headers (excluding secrets), and body
      const headersForLog = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "[REDACTED]",
      };

      console.log(`[ZeptoMail Request] URL: ${endpoint}`);
      console.log(`[ZeptoMail Request] Headers: ${JSON.stringify(headersForLog)}`);
      console.log(`[ZeptoMail Request] Body: ${JSON.stringify(payload)}`);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(payload),
      });

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const text = await response.text();

      // 5. Replace all JSON parsing with robust handling supporting both JSON and plain text
      let responseData: any;
      try {
        responseData = JSON.parse(text);
      } catch (e) {
        responseData = { text };
      }

      // 6. Log response status, headers, and body
      console.log(`[ZeptoMail Response] Status: ${response.status} ${response.statusText}`);
      console.log(`[ZeptoMail Response] Headers: ${JSON.stringify(responseHeaders)}`);
      console.log(`[ZeptoMail Response] Body: ${JSON.stringify(responseData)}`);

      if (!response.ok) {
        console.error(`[ZeptoMail Service] API error: Status ${response.status}`, responseData);
        return null;
      }

      return responseData;
    } catch (err) {
      console.error("ZeptoMail Email error:", err);
      // Don't crash the server if email fails
      return null;
    }
  }

  static async sendWelcomeEmail(to: string, name: string) {
    const html = `
      <div style="font-family: 'Playfair Display', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #faf9f6; color: #1a1612; border: 1px solid #e2dcd0;">
        <h1 style="text-align: center; letter-spacing: 0.15em; font-weight: 400; text-transform: uppercase;">DRAPEVA</h1>
        <p style="text-align: center; font-size: 0.75rem; letter-spacing: 0.25em; text-transform: uppercase; color: #8c7853; margin-top: -10px;">Curated Heritage</p>
        <hr style="border: 0; border-top: 1px solid #e2dcd0; margin: 30px 0;" />
        <p>Dear ${name},</p>
        <p>Welcome to the DRAPEVA STORE. Your account has been successfully registered.</p>
        <p>Discover our heirloom Banarasi weaves, bridal Kanjivarams, and styling consultations designed to celebrate your most precious moments.</p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="http://localhost:3000/shop" style="background-color: #1a1612; color: #faf9f6; padding: 15px 30px; text-decoration: none; font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase;">Explore the Collection</a>
        </div>
        <p style="font-size: 0.85rem; color: #8c7853; line-height: 1.6;">Warmest regards,<br/>The Drapeva Concierge Team</p>
      </div>
    `;
    return this.sendEmail(to, "Welcome to DRAPEVA STORE", html);
  }

  static async sendOrderConfirmation(to: string, name: string, orderId: string, total: number) {
    const html = `
      <div style="font-family: 'Playfair Display', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #faf9f6; color: #1a1612; border: 1px solid #e2dcd0;">
        <h1 style="text-align: center; letter-spacing: 0.15em; font-weight: 400; text-transform: uppercase;">DRAPEVA</h1>
        <p style="text-align: center; font-size: 0.75rem; letter-spacing: 0.25em; text-transform: uppercase; color: #8c7853; margin-top: -10px;">Curated Heritage</p>
        <hr style="border: 0; border-top: 1px solid #e2dcd0; margin: 30px 0;" />
        <p>Dear ${name},</p>
        <p>We are delighted to confirm receipt of your order <strong>#${orderId}</strong>.</p>
        <p>We have notified our trusted partner weavers and artisans, and they have begun preparing your curated premium saree. The estimated shipping and delivery duration is 3 to 6 weeks.</p>
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
        <p style="text-align: center; font-size: 0.75rem; letter-spacing: 0.25em; text-transform: uppercase; color: #8c7853; margin-top: -10px;">Curated Heritage</p>
        <hr style="border: 0; border-top: 1px solid #e2dcd0; margin: 30px 0;" />
        <p>Dear ${name},</p>
        <p>Your bridal/couture consultation has been scheduled.</p>
        <p><strong>Date:</strong> ${dateStr}</p>
        <p><strong>Time Slot:</strong> ${timeSlot}</p>
        <p><strong>Type:</strong> ${type === "VIDEO" ? "Video Consultation" : "In-Person Consultation"}</p>
        <p>Our concierge will reach out to you shortly via WhatsApp to share details or link invites.</p>
        <p style="font-size: 0.85rem; color: #8c7853; line-height: 1.6;">With compliments,<br/>The Drapeva Concierge Team</p>
      </div>
    `;
    return this.sendEmail(to, "Consultation Scheduled — Drapeva", html);
  }
}
