import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://drapeva.com";
  const now = new Date();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/collections`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/new-arrivals`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/bestsellers`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/sale`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/trending`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/support`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    {
      url: `${baseUrl}/celebrity-looks`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    { url: `${baseUrl}/lookbook`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    {
      url: `${baseUrl}/virtual-catalog`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/book-appointment`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    { url: `${baseUrl}/wishlist`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${baseUrl}/cart`, lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: `${baseUrl}/compare`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/search`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    {
      url: `${baseUrl}/returns-exchanges-refunds`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/shipping-cancellation`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    // Fetch Products
    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("status", "published");

    const productRoutes: MetadataRoute.Sitemap = (products || []).map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(product.updated_at || now),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Fetch Categories
    const { data: categories } = await supabase.from("categories").select("slug, updated_at");

    const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
      url: `${baseUrl}/collections?category=${cat.slug}`,
      lastModified: new Date(cat.updated_at || now),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return staticRoutes;
  }
}
