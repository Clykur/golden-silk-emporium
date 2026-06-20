/**
 * Centralized environment variable validation.
 *
 * - Public vars (NEXT_PUBLIC_*) are inlined at build time and are always
 *   present after a correct build. These throw immediately if missing.
 * - Server-only secrets are read at runtime and validated lazily, so a
 *   missing secret surfaces as a clear error message in the relevant
 *   API route rather than crashing the entire build.
 */

// ---------------------------------------------------------------------------
// Public client-side variables (available in browser + server)
// ---------------------------------------------------------------------------

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      "Missing env var: NEXT_PUBLIC_SUPABASE_URL. " +
        "Add it to .env.local (dev) or Vercel / GitHub Secrets (production).",
    );
  }
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      "Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Add it to .env.local (dev) or Vercel / GitHub Secrets (production).",
    );
  }
  return key;
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://drapeva.com";
}

// ---------------------------------------------------------------------------
// Server-only secrets — validated lazily inside request handlers
// ---------------------------------------------------------------------------

/**
 * Returns the Supabase service role key.
 * Throws with a clear message if missing (e.g. webhook context with no secret).
 */
export function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "Missing env var: SUPABASE_SERVICE_ROLE_KEY. " +
        "This is required for admin / webhook Supabase operations.",
    );
  }
  return key;
}

/**
 * Returns Razorpay key ID and secret.
 * In development, falls back to empty strings so the service enters mock mode.
 * In production, throws if either key is missing.
 */
export function getRazorpayKeys(): { keyId: string; keySecret: string } {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  if (process.env.NODE_ENV === "production" && (!keyId || !keySecret)) {
    throw new Error(
      "Missing Razorpay credentials in production. " +
        "Set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
    );
  }

  return { keyId, keySecret };
}

/**
 * Returns the Razorpay webhook signing secret.
 * Prefers RAZORPAY_WEBHOOK_SECRET, falls back to RAZORPAY_KEY_SECRET.
 */
export function getRazorpayWebhookSecret(): string {
  return process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "";
}

/**
 * Returns the Resend API key.
 * Returns an empty string (triggering mock mode) if not set.
 */
export function getResendApiKey(): string {
  return process.env.RESEND_API_KEY || "";
}

/**
 * Returns WhatsApp Cloud API credentials.
 */
export function getWhatsAppCredentials(): { token: string; phoneId: string } {
  return {
    token: process.env.WHATSAPP_API_TOKEN || "",
    phoneId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  };
}

/**
 * Returns the shared webhook secret used by the Supabase order webhook.
 */
export function getOrderWebhookSecret(): string {
  return process.env.ORDER_WEBHOOK_SECRET || "";
}
