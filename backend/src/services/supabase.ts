// Supabase service — graceful fallback if SDK is not installed
// Install with: npm install @supabase/supabase-js

let supabaseClient: any = null;

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch {
    console.warn("@supabase/supabase-js not installed — Supabase features disabled.");
  }
  return supabaseClient;
}

// Export a proxy that lazily initializes
export const supabase = new Proxy({} as any, {
  get: (_target, prop) => {
    return (...args: any[]) => {
      console.warn(`supabase.${String(prop)} called before SDK init`);
    };
  },
});

// Also export for direct async usage
export { getSupabaseClient };

export class SupabaseStorageService {
  static async uploadImage(fileBuffer: Buffer, folder: string = "maaya"): Promise<string> {
    const client = await getSupabaseClient();
    if (!client) {
      console.warn("Supabase client unavailable, returning fallback image.");
      return `https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?w=600&q=80`;
    }

    const filename = `${folder}/${Date.now()}-${Math.random().toString(36).substring(4)}.jpg`;

    try {
      const { data, error } = await client.storage
        .from("maaya-assets")
        .upload(filename, fileBuffer, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        console.error("Supabase storage upload error:", error.message);
        return `https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?w=600&q=80`;
      }

      const { data: urlData } = client.storage.from("maaya-assets").getPublicUrl(filename);

      return urlData.publicUrl;
    } catch (err: any) {
      console.error("Supabase upload failed:", err.message);
      return `https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?w=600&q=80`;
    }
  }
}
