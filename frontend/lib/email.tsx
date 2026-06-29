import { Resend } from "resend";
import React from "react";
import { OrderConfirmationEmail } from "@/components/emails/OrderConfirmationEmail";
import { AdminOrderNotificationEmail } from "@/components/emails/AdminOrderNotificationEmail";
import { OrderShippedEmail } from "@/components/emails/OrderShippedEmail";
import { OrderDeliveredEmail } from "@/components/emails/OrderDeliveredEmail";
import { getSupabaseAdmin } from "@/lib/supabase";

// Expose Resend instance using the live environment variable.
const resendApiKey = process.env.RESEND_API_KEY || "re_mock_resend_api_key";
const isResendMocked = resendApiKey.includes("mock") || !process.env.RESEND_API_KEY;
const resend = !isResendMocked ? new Resend(resendApiKey) : null;

// Reusable retry helper
async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.warn(`[Email Service] Retrying operation... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Check and update email logs to prevent duplicate sending
async function markEmailAsSent(orderId: string, emailType: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("email_sent_logs")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      console.error(
        `[Email Service] Failed to retrieve email sent logs for order: ${orderId}`,
        fetchError,
      );
      return false;
    }

    const logs = Array.isArray(order.email_sent_logs) ? order.email_sent_logs : [];

    // If already sent, skip sending
    if (logs.includes(emailType)) {
      console.log(
        `[Email Service] Email type "${emailType}" already sent for order: ${orderId}. Skipping.`,
      );
      return true; // Already processed
    }

    // Update with new log
    const updatedLogs = [...logs, emailType];
    const { error: updateError } = await supabase
      .from("orders")
      .update({ email_sent_logs: updatedLogs })
      .eq("id", orderId);

    if (updateError) {
      console.error(
        `[Email Service] Failed to update email sent logs for order: ${orderId}`,
        updateError,
      );
      return false;
    }

    return false; // Email has NOT been sent before; proceed to send
  } catch (error) {
    console.error(`[Email Service] Error checking email sent logs:`, error);
    return false; // Fallback to send in case of DB issues (failure-tolerant)
  }
}

// ------------------------------------------------------------
// Helper to send emails directly via Resend (with logging, retries, and error handling)
// ------------------------------------------------------------
async function sendEmailDirect(to: string, subject: string, html: string) {
  if (!to) {
    console.error("[Email Service] Recipient email is empty.");
    return null;
  }

  let finalTo = to;
  let finalSubject = subject;

  // Resend Sandbox Restriction Bypass:
  // If the target recipient is not the account owner (drapeva2026@gmail.com) and we are using the onboarding domain,
  // we redirect it to drapeva2026@gmail.com and append a subject prefix to indicate the original recipient.
  if (to.toLowerCase() !== "drapeva2026@gmail.com" && !isResendMocked) {
    console.log(
      `[Email Service] Sandbox Restriction: Redirecting email from "${to}" to "drapeva2026@gmail.com" to avoid 403 validation error.`,
    );
    finalTo = "drapeva2026@gmail.com";
    finalSubject = `${subject} [Simulated Delivery to: ${to}]`;
  }

  console.log(
    `[Email Service] Preparing to dispatch email to: "${finalTo}" (Original: "${to}") | Subject: "${finalSubject}"`,
  );

  if (isResendMocked || !resend) {
    console.log(`[Resend Mock] Dispatching email to: ${finalTo}`);
    console.log(`Subject: ${finalSubject}`);
    console.log(`Body snippet: ${html.substring(0, 200)}...`);
    return { id: "resend_mock_id_" + Math.random().toString(36).substring(4) };
  }

  try {
    const data = await retryOperation(async () => {
      const response = await resend!.emails.send({
        from: "Drapeva <onboarding@resend.dev>",
        to: [finalTo],
        subject: finalSubject,
        html,
      });

      console.log(
        `[Email Service] Full Resend response for "${finalTo}":`,
        JSON.stringify(response),
      );

      if (!response || (response as any).error) {
        const errorObj = (response as any).error || "Failed to send email via Resend";
        console.error(
          `[Email Service] Resend API error for "${finalTo}":`,
          JSON.stringify(errorObj),
        );
        throw new Error(JSON.stringify(errorObj));
      }
      return response;
    });
    return data;
  } catch (err: any) {
    console.error(`[Email Service] Failed to send email to "${finalTo}" after retries:`, err);
    throw err;
  }
}

// ------------------------------------------------------------
// Standalone Reusable Email functions
// ------------------------------------------------------------

export async function sendOrderConfirmationToCustomer(
  to: string,
  name: string,
  orderId: string,
  orderData: {
    items: any[];
    subtotal: number;
    tax: number;
    shippingCost: number;
    discount: number;
    total: number;
    shippingAddress: any;
    paymentMethod: string;
  },
) {
  console.log(`[Email Service] sendOrderConfirmationToCustomer: Order ${orderId} | to: ${to}`);
  try {
    if (!to || !to.includes("@")) {
      console.error(`[Email Service] Invalid customer email: "${to}"`);
      return null;
    }

    // Verify email exists in database (either profiles or orders)
    const supabase = getSupabaseAdmin();
    const [profileCheck, orderCheck] = await Promise.all([
      supabase.from("profiles").select("id").eq("email", to).maybeSingle(),
      supabase.from("orders").select("id").eq("customer_email", to).maybeSingle(),
    ]);

    if (!profileCheck.data && !orderCheck.data) {
      console.warn(
        `[Email Service] Email "${to}" not found in profiles or orders database. Skipping send.`,
      );
      return null;
    }

    // 1. Prevent duplicate email sending
    const alreadySent = await markEmailAsSent(orderId, "customer_confirmation");
    if (alreadySent) {
      console.log(
        `[Email Service] Customer confirmation already sent to ${to} for order ${orderId}.`,
      );
      return { status: "already_sent" };
    }

    // 2. Render HTML Email
    const { renderToStaticMarkup } = await import("react-dom/server");
    const emailHtml = renderToStaticMarkup(
      <OrderConfirmationEmail
        customerName={name}
        orderId={orderId}
        items={orderData.items}
        subtotal={orderData.subtotal}
        tax={orderData.tax}
        shippingCost={orderData.shippingCost}
        discount={orderData.discount}
        total={orderData.total}
        shippingAddress={orderData.shippingAddress}
        paymentMethod={orderData.paymentMethod}
      />,
    );

    // 3. Dispatch
    return await sendEmailDirect(to, "Your Drapeva Order has been Confirmed ✨", emailHtml);
  } catch (err) {
    console.error(`[Email Service] sendOrderConfirmationToCustomer failed for ${to}:`, err);
    return null;
  }
}

export async function sendAdminOrderNotification(
  orderId: string,
  orderData: {
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    items: any[];
    total: number;
    shippingAddress: any;
    paymentMethod: string;
    paymentStatus: string;
    createdAt: string;
  },
) {
  const adminEmail = "drapeva2026@gmail.com";
  console.log(`[Email Service] sendAdminOrderNotification: Order ${orderId}`);
  try {
    // 1. Prevent duplicate email sending
    const alreadySent = await markEmailAsSent(orderId, "admin_notification");
    if (alreadySent) {
      console.log(`[Email Service] Admin notification already sent for order ${orderId}.`);
      return { status: "already_sent" };
    }

    // 2. Render HTML Email
    const { renderToStaticMarkup } = await import("react-dom/server");
    const emailHtml = renderToStaticMarkup(
      <AdminOrderNotificationEmail
        customerName={orderData.customerName}
        customerEmail={orderData.customerEmail}
        customerPhone={orderData.customerPhone}
        orderId={orderId}
        items={orderData.items}
        total={orderData.total}
        shippingAddress={orderData.shippingAddress}
        paymentMethod={orderData.paymentMethod}
        paymentStatus={orderData.paymentStatus}
        createdAt={orderData.createdAt}
      />,
    );

    // 3. Dispatch
    return await sendEmailDirect(adminEmail, "New Drapeva Order Received", emailHtml);
  } catch (err) {
    console.error(`[Email Service] sendAdminOrderNotification failed for order ${orderId}:`, err);
    return null;
  }
}

export async function sendOrderShippedEmail(
  to: string,
  name: string,
  orderId: string,
  shippingData: {
    courierName: string;
    trackingNumber: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
    items: any[];
  },
) {
  console.log(`[Email Service] sendOrderShippedEmail: Order ${orderId} | to: ${to}`);
  try {
    if (!to || !to.includes("@")) {
      console.error(`[Email Service] Invalid customer email for shipping: "${to}"`);
      return null;
    }

    // Verify email exists in database (either profiles or orders)
    const supabase = getSupabaseAdmin();
    const [profileCheck, orderCheck] = await Promise.all([
      supabase.from("profiles").select("id").eq("email", to).maybeSingle(),
      supabase.from("orders").select("id").eq("customer_email", to).maybeSingle(),
    ]);

    if (!profileCheck.data && !orderCheck.data) {
      console.warn(
        `[Email Service] Email "${to}" not found in profiles or orders database. Skipping shipped email.`,
      );
      return null;
    }

    // 1. Prevent duplicate email sending
    const alreadySent = await markEmailAsSent(orderId, "order_shipped");
    if (alreadySent) {
      console.log(`[Email Service] Shipping email already sent to ${to} for order ${orderId}.`);
      return { status: "already_sent" };
    }

    // 2. Render HTML Email
    const { renderToStaticMarkup } = await import("react-dom/server");
    const emailHtml = renderToStaticMarkup(
      <OrderShippedEmail
        customerName={name}
        orderId={orderId}
        courierName={shippingData.courierName}
        trackingNumber={shippingData.trackingNumber}
        trackingUrl={shippingData.trackingUrl}
        estimatedDelivery={shippingData.estimatedDelivery}
        items={shippingData.items}
      />,
    );

    // 3. Dispatch
    return await sendEmailDirect(to, "Your Drapeva Order is on the Way 🚚", emailHtml);
  } catch (err) {
    console.error(`[Email Service] sendOrderShippedEmail failed for ${to}:`, err);
    return null;
  }
}

export async function sendOrderDeliveredEmail(
  to: string,
  name: string,
  orderId: string,
  deliveryData: {
    deliveredDate: string;
    items: any[];
  },
) {
  console.log(`[Email Service] sendOrderDeliveredEmail: Order ${orderId} | to: ${to}`);
  try {
    if (!to || !to.includes("@")) {
      console.error(`[Email Service] Invalid customer email for delivery confirmation: "${to}"`);
      return null;
    }

    // Verify email exists in database (either profiles or orders)
    const supabase = getSupabaseAdmin();
    const [profileCheck, orderCheck] = await Promise.all([
      supabase.from("profiles").select("id").eq("email", to).maybeSingle(),
      supabase.from("orders").select("id").eq("customer_email", to).maybeSingle(),
    ]);

    if (!profileCheck.data && !orderCheck.data) {
      console.warn(
        `[Email Service] Email "${to}" not found in profiles or orders database. Skipping delivered email.`,
      );
      return null;
    }

    // 1. Prevent duplicate email sending
    const alreadySent = await markEmailAsSent(orderId, "order_delivered");
    if (alreadySent) {
      console.log(`[Email Service] Delivery email already sent to ${to} for order ${orderId}.`);
      return { status: "already_sent" };
    }

    // 2. Render HTML Email
    const { renderToStaticMarkup } = await import("react-dom/server");
    const emailHtml = renderToStaticMarkup(
      <OrderDeliveredEmail
        customerName={name}
        orderId={orderId}
        deliveredDate={deliveryData.deliveredDate}
        items={deliveryData.items}
      />,
    );

    // 3. Dispatch
    return await sendEmailDirect(to, "Your Drapeva Order has been Delivered ❤️", emailHtml);
  } catch (err) {
    console.error(`[Email Service] sendOrderDeliveredEmail failed for ${to}:`, err);
    return null;
  }
}

// ------------------------------------------------------------
// Legacy backward compatibility wrapper class
// ------------------------------------------------------------
export class EmailService {
  static async sendEmail(to: string, subject: string, html: string) {
    return await sendEmailDirect(to, subject, html);
  }

  static async sendOrderConfirmation(
    to: string,
    name: string,
    orderId: string,
    orderData: {
      items: any[];
      subtotal: number;
      tax: number;
      shippingCost: number;
      discount: number;
      total: number;
      shippingAddress: any;
      paymentMethod: string;
    },
  ) {
    return await sendOrderConfirmationToCustomer(to, name, orderId, orderData);
  }

  static async sendAdminNotification(
    orderId: string,
    orderData: {
      customerName: string;
      customerEmail: string;
      customerPhone?: string;
      items: any[];
      total: number;
      shippingAddress: any;
      paymentMethod: string;
      paymentStatus: string;
      createdAt: string;
    },
  ) {
    return await sendAdminOrderNotification(orderId, orderData);
  }

  static async sendOrderShipped(
    to: string,
    name: string,
    orderId: string,
    shippingData: {
      courierName: string;
      trackingNumber: string;
      trackingUrl?: string;
      estimatedDelivery?: string;
      items: any[];
    },
  ) {
    return await sendOrderShippedEmail(to, name, orderId, shippingData);
  }

  static async sendOrderDelivered(
    to: string,
    name: string,
    orderId: string,
    deliveryData: {
      deliveredDate: string;
      items: any[];
    },
  ) {
    return await sendOrderDeliveredEmail(to, name, orderId, deliveryData);
  }
}
