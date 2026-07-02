import { z } from "zod";

const trimmedOrUndefined = (raw: unknown): string | undefined => {
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim();
  return s === "" ? undefined : s;
};

const PLACEHOLDER_MARKERS = ["placeholder", "your-", "changeme", "projectid"] as const;

export function looksLikePlaceholderEnvValue(value: string): boolean {
  const v = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => v.includes(marker));
}

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const IS_SERVER = typeof window === "undefined";

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  NEXT_PUBLIC_SUPABASE_URL: z.preprocess(
    trimmedOrUndefined,
    z.string({ required_error: "NEXT_PUBLIC_SUPABASE_URL is required" }).url(),
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.preprocess(
    trimmedOrUndefined,
    z.string({ required_error: "NEXT_PUBLIC_SUPABASE_ANON_KEY is required" }).min(1),
  ),
  SUPABASE_SERVICE_ROLE_KEY: IS_PRODUCTION
    ? z.preprocess(
        trimmedOrUndefined,
        z.string({ required_error: "SUPABASE_SERVICE_ROLE_KEY is required in production" }).min(1),
      )
    : z.preprocess(trimmedOrUndefined, z.string().optional()),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.preprocess(
    trimmedOrUndefined,
    z.string({ required_error: "NEXT_PUBLIC_RAZORPAY_KEY_ID is required" }).min(1),
  ),
  RAZORPAY_KEY_SECRET: IS_PRODUCTION
    ? z.preprocess(
        trimmedOrUndefined,
        z.string({ required_error: "RAZORPAY_KEY_SECRET is required in production" }).min(1),
      )
    : z.preprocess(trimmedOrUndefined, z.string().optional()),
  RAZORPAY_WEBHOOK_SECRET: z.preprocess(trimmedOrUndefined, z.string().optional()),
  ZEPTOMAIL_API_KEY: z.preprocess(trimmedOrUndefined, z.string().optional()),
  ZEPTOMAIL_FROM_EMAIL: z.preprocess(trimmedOrUndefined, z.string().optional()),
  ZEPTOMAIL_FROM_NAME: z.preprocess(trimmedOrUndefined, z.string().optional()),
  ORDER_WEBHOOK_SECRET: z.preprocess(trimmedOrUndefined, z.string().optional()),
  WHATSAPP_API_TOKEN: z.preprocess(trimmedOrUndefined, z.string().optional()),
  WHATSAPP_PHONE_NUMBER_ID: z.preprocess(trimmedOrUndefined, z.string().optional()),
  NEXT_PUBLIC_APP_URL: z.preprocess(
    trimmedOrUndefined,
    z.string().url().default("http://localhost:3000"),
  ),
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    trimmedOrUndefined,
    z.string().url().default("https://drapeva.com"),
  ),
  BACKEND_API_URL: z.preprocess(
    trimmedOrUndefined,
    z.string().url().default("http://localhost:5001"),
  ),
});

// Run validation only on the server
let parsedEnv: Partial<z.infer<typeof envSchema>> = {};
if (IS_SERVER) {
  try {
    parsedEnv = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
      RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
      ZEPTOMAIL_API_KEY: process.env.ZEPTOMAIL_API_KEY,
      ZEPTOMAIL_FROM_EMAIL: process.env.ZEPTOMAIL_FROM_EMAIL,
      ZEPTOMAIL_FROM_NAME: process.env.ZEPTOMAIL_FROM_NAME,
      ORDER_WEBHOOK_SECRET: process.env.ORDER_WEBHOOK_SECRET,
      WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN,
      WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      BACKEND_API_URL: process.env.BACKEND_API_URL,
    });

    if (IS_PRODUCTION) {
      const checkKeys = [
        { name: "NEXT_PUBLIC_SUPABASE_URL", value: parsedEnv.NEXT_PUBLIC_SUPABASE_URL },
        { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", value: parsedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY },
        { name: "SUPABASE_SERVICE_ROLE_KEY", value: parsedEnv.SUPABASE_SERVICE_ROLE_KEY },
      ];
      for (const { name, value } of checkKeys) {
        if (value && looksLikePlaceholderEnvValue(value)) {
          throw new Error(`Environment variable ${name} contains a placeholder value.`);
        }
      }
    }
  } catch (err: any) {
    if (IS_PRODUCTION) {
      console.error(
        "[env] CRITICAL: Incomplete environment configuration: ",
        err.errors || err.message,
      );
      throw new Error("Missing or invalid production environment variables.");
    }
    // Fallback in development when some vars are missing/invalid
    parsedEnv = {
      NODE_ENV: process.env.NODE_ENV || "development",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
      RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
      ZEPTOMAIL_API_KEY: process.env.ZEPTOMAIL_API_KEY,
      ZEPTOMAIL_FROM_EMAIL: process.env.ZEPTOMAIL_FROM_EMAIL,
      ZEPTOMAIL_FROM_NAME: process.env.ZEPTOMAIL_FROM_NAME,
      ORDER_WEBHOOK_SECRET: process.env.ORDER_WEBHOOK_SECRET,
      WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN,
      WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      BACKEND_API_URL: process.env.BACKEND_API_URL,
    };
  }
}

// Client-safe helper functions (using direct NEXT_PUBLIC_ references for bundler inlining)
export function getSupabaseUrl(): string {
  if (IS_SERVER) return parsedEnv.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
}

export function getSupabaseAnonKey(): string {
  if (IS_SERVER) return parsedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
}

export function getAppUrl(): string {
  if (IS_SERVER) return parsedEnv.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export function getSiteUrl(): string {
  if (IS_SERVER) return parsedEnv.NEXT_PUBLIC_SITE_URL || "https://drapeva.com";
  return process.env.NEXT_PUBLIC_SITE_URL || "https://drapeva.com";
}

// Server-only helper functions
export function getSupabaseServiceRoleKey(): string {
  if (!IS_SERVER) return "";
  const key = parsedEnv.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "Missing env var: SUPABASE_SERVICE_ROLE_KEY. " +
        "This is required for admin / webhook Supabase operations.",
    );
  }
  return key;
}

export function getRazorpayKeys(): { keyId: string; keySecret: string } {
  if (IS_SERVER) {
    return {
      keyId: parsedEnv.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      keySecret: parsedEnv.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || "",
    };
  }
  return {
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    keySecret: "", // Never expose keySecret on client
  };
}

export function getRazorpayWebhookSecret(): string {
  if (!IS_SERVER) return "";
  return (
    parsedEnv.RAZORPAY_WEBHOOK_SECRET ||
    process.env.RAZORPAY_WEBHOOK_SECRET ||
    process.env.RAZORPAY_KEY_SECRET ||
    ""
  );
}

export function getZeptoMailConfig() {
  if (!IS_SERVER) return { apiKey: "", fromEmail: "", fromName: "" };
  return {
    apiKey: parsedEnv.ZEPTOMAIL_API_KEY || process.env.ZEPTOMAIL_API_KEY || "",
    fromEmail: parsedEnv.ZEPTOMAIL_FROM_EMAIL || process.env.ZEPTOMAIL_FROM_EMAIL || "",
    fromName: parsedEnv.ZEPTOMAIL_FROM_NAME || process.env.ZEPTOMAIL_FROM_NAME || "",
  };
}

export function getWhatsAppCredentials(): { token: string; phoneId: string } {
  if (!IS_SERVER) return { token: "", phoneId: "" };
  return {
    token: parsedEnv.WHATSAPP_API_TOKEN || process.env.WHATSAPP_API_TOKEN || "",
    phoneId: parsedEnv.WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID || "",
  };
}

export function getOrderWebhookSecret(): string {
  if (!IS_SERVER) return "";
  return parsedEnv.ORDER_WEBHOOK_SECRET || process.env.ORDER_WEBHOOK_SECRET || "";
}

export function getBackendApiUrl(): string {
  if (!IS_SERVER) return "";
  return parsedEnv.BACKEND_API_URL || process.env.BACKEND_API_URL || "http://localhost:5001";
}
