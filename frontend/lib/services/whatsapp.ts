const whatsappToken = process.env.WHATSAPP_API_TOKEN || "mock_whatsapp_api_token";
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || "mock_whatsapp_phone_number_id";
const isWhatsappMocked = whatsappToken.includes("mock") || !process.env.WHATSAPP_API_TOKEN;

export class WhatsAppService {
  static async sendNotification(to: string, message: string) {
    const cleanPhone = to.replace(/[^0-9]/g, "");

    if (isWhatsappMocked) {
      console.log(`[WhatsApp Mock] Sent message to +${cleanPhone}:`);
      console.log(`"${message}"`);
      return { success: true, mock: true };
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${whatsappToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: cleanPhone,
          type: "text",
          text: { body: message },
        }),
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (err) {
      console.error("WhatsApp Send Message error:", err);
      return { success: false, error: err };
    }
  }

  static async sendOrderUpdate(to: string, orderNumber: string, status: string) {
    const msg = `Drapeva: Your order ${orderNumber} status has been updated to "${status}". Track progress details in your account dashboard. For immediate enquiries, please reply directly.`;
    return this.sendNotification(to, msg);
  }

  static async sendAppointmentReminder(
    to: string,
    name: string,
    dateStr: string,
    timeSlot: string,
  ) {
    const msg = `Dear ${name}, this is a gentle reminder that your consultation appointment at Drapeva is scheduled for ${dateStr} at ${timeSlot}. Looking forward to hosting you.`;
    return this.sendNotification(to, msg);
  }
}
