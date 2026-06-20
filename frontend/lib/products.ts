// products.ts — Utility re-exports only. All product data is now database-driven via Supabase.
// See: src/lib/api.ts for data fetching, src/lib/types.ts for types.

export type { Product, ProductFormData, ProductImage, FilterState } from "./types";
export { formatINR, normalizeProduct } from "./types";

// Legacy COLLECTIONS constant for migration compatibility — now loaded from DB
// These are fallbacks for static pages only
export const COLLECTIONS = [
  {
    slug: "heritage-weaves",
    name: "Heritage Weaves",
    tagline: "Handloom masterworks from Banaras & Kanchipuram",
    image: "/images/collection-heritage.jpg",
  },
  {
    slug: "vivah-couture",
    name: "Vivah Couture",
    tagline: "Bridal masterpieces adorned in gold and real pearls",
    image: "/images/collection-vivah.jpg",
  },
  {
    slug: "soiree",
    name: "Soirée",
    tagline: "Flowing chiffons and designer organzas for celebrations",
    image: "/images/collection-soiree.jpg",
  },
  {
    slug: "modern-minimalist",
    name: "Modern Minimalist",
    tagline: "Contemporary hand-block linens and everyday cottons",
    image: "/images/collection-modern.jpg",
  },
];

// All product data is now fetched from Supabase.
// PRODUCTS array removed — use productsApi.list() from src/lib/api.ts
