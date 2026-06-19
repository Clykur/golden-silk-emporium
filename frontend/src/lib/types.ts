// ============================================================
// MAAYA COUTURE — Complete TypeScript Types
// Generated from Supabase schema
// ============================================================

export type ProductStatus = "draft" | "published" | "archived";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
export type DiscountType = "percentage" | "fixed";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketCategory = "order_issue" | "payment" | "return_refund" | "product_query" | "delivery" | "account" | "other";
export type NotificationType =
  | "order_placed" | "order_processing" | "order_shipped" | "order_delivered"
  | "order_cancelled" | "order_returned" | "payment_success" | "payment_failed"
  | "return_initiated" | "return_approved" | "return_rejected"
  | "ticket_reply" | "account_update" | "promo" | "system";
export type ReturnStatus = "requested" | "approved" | "rejected" | "picked_up" | "refunded";

// ============================================================
// DATABASE TYPES (for Supabase client)
// ============================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at" | "name" | "phone" | "avatar_url" | "role"> & Partial<Pick<Profile, "name" | "phone" | "avatar_url" | "role">>;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      products: {
        Row: DbProduct;
        Insert: Omit<DbProduct, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DbProduct, "id" | "created_at">>;
      };
      product_images: {
        Row: ProductImage;
        Insert: Omit<ProductImage, "id" | "created_at">;
        Update: Partial<Omit<ProductImage, "id" | "created_at">>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at" | "description" | "image" | "sort_order" | "is_active"> & Partial<Pick<Category, "description" | "image" | "sort_order" | "is_active">>;
        Update: Partial<Omit<Category, "id" | "created_at">>;
      };
      collections: {
        Row: Collection;
        Insert: Omit<Collection, "id" | "created_at" | "tagline" | "description" | "image" | "is_featured" | "sort_order" | "is_active"> & Partial<Pick<Collection, "tagline" | "description" | "image" | "is_featured" | "sort_order" | "is_active">>;
        Update: Partial<Omit<Collection, "id" | "created_at">>;
      };
      orders: {
        Row: DbOrder;
        Insert: Omit<DbOrder, "id" | "created_at" | "updated_at" | "user_id" | "status" | "coupon_id" | "coupon_code" | "shipping_address" | "customer_phone" | "razorpay_order_id" | "razorpay_payment_id" | "razorpay_signature" | "payment_status" | "notes" | "tracking_number"> & Partial<Pick<DbOrder, "user_id" | "status" | "coupon_id" | "coupon_code" | "shipping_address" | "customer_phone" | "razorpay_order_id" | "razorpay_payment_id" | "razorpay_signature" | "payment_status" | "notes" | "tracking_number">>;
        Update: Partial<Omit<DbOrder, "id" | "created_at">>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, "id" | "created_at" | "reviewer_name" | "reviewer_email" | "title" | "comment" | "is_approved" | "user_id"> & Partial<Pick<Review, "reviewer_name" | "reviewer_email" | "title" | "comment" | "is_approved" | "user_id">>;
        Update: Partial<Omit<Review, "id" | "created_at">>;
      };
      wishlist: {
        Row: WishlistItem;
        Insert: Omit<WishlistItem, "id" | "created_at">;
        Update: Partial<WishlistItem>;
      };
      cart_items: {
        Row: CartItemDb;
        Insert: Omit<CartItemDb, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<CartItemDb, "id" | "created_at">>;
      };
      coupons: {
        Row: Coupon;
        Insert: Omit<Coupon, "id" | "created_at" | "usage_count">;
        Update: Partial<Omit<Coupon, "id" | "created_at">>;
      };
      homepage_banners: {
        Row: HomepageBanner;
        Insert: Omit<HomepageBanner, "id" | "created_at">;
        Update: Partial<Omit<HomepageBanner, "id" | "created_at">>;
      };
      site_settings: {
        Row: SiteSetting;
        Insert: SiteSetting;
        Update: Partial<SiteSetting>;
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: Omit<NewsletterSubscriber, "id" | "created_at">;
        Update: Partial<NewsletterSubscriber>;
      };
      customer_addresses: {
        Row: CustomerAddress;
        Insert: Omit<CustomerAddress, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<CustomerAddress, "id" | "created_at">>;
      };
      support_tickets: {
        Row: SupportTicket;
        Insert: Omit<SupportTicket, "id" | "created_at" | "updated_at" | "ticket_number">;
        Update: Partial<Omit<SupportTicket, "id" | "created_at">>;
      };
      support_messages: {
        Row: SupportMessage;
        Insert: Omit<SupportMessage, "id" | "created_at">;
        Update: Partial<Omit<SupportMessage, "id" | "created_at">>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, "id" | "created_at">;
        Update: Partial<Omit<Notification, "id" | "created_at">>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, "id" | "created_at">;
        Update: never;
      };
      return_requests: {
        Row: ReturnRequest;
        Insert: Omit<ReturnRequest, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ReturnRequest, "id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      order_status: OrderStatus;
      discount_type: DiscountType;
      product_status: ProductStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

// Wrapper type to make Database compatible with Supabase JS v2 client types
export type MakeDatabaseCompat<T extends {
  public: {
    Tables: Record<string, { Row: any; Insert: any; Update: any }>;
    Views: any;
    Functions: any;
    Enums: any;
  }
}> = {
  public: {
    Tables: {
      [K in keyof T["public"]["Tables"]]: {
        Row: T["public"]["Tables"][K]["Row"] & Record<string, unknown>;
        Insert: T["public"]["Tables"][K]["Insert"] & Record<string, unknown>;
        Update: T["public"]["Tables"][K]["Update"] & Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: T["public"]["Views"];
    Functions: T["public"]["Functions"];
    Enums: T["public"]["Enums"];
  };
};


// ============================================================
// ENTITY TYPES
// ============================================================

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: "customer" | "admin";
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  image: string | null;
  is_featured: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
}

// Raw DB product row
export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string;
  price: number;
  sale_price: number | null;
  compare_at: number | null;
  category_id: string | null;
  collection_id: string | null;
  fabric: string | null;
  color: string | null;
  occasion: string | null;
  tags: string[];
  details: string[];
  stock_quantity: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  video_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  status: ProductStatus;
  weave: string | null;
  badge: string | null;
  created_at: string;
  updated_at: string;
}

// Full product with relations (for frontend display)
export interface Product extends DbProduct {
  sizes: any;
  images: ProductImage[];
  category: Category | null;
  collection: Collection | null;
  // Derived/computed
  image: string; // primary image URL
  gallery: string[]; // all image URLs
  inStock: boolean;
  compareAt: number | null; // alias for compare_at
}

// Product form data for admin
export interface ProductFormData {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  sale_price: number | null;
  compare_at: number | null;
  category_id: string;
  collection_id: string;
  fabric: string;
  color: string;
  occasion: string;
  tags: string[];
  details: string[];
  stock_quantity: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  video_url: string;
  seo_title: string;
  seo_description: string;
  status: ProductStatus;
  weave: string;
  badge: string;
  images: {
    uploading: unknown; url: string; alt_text: string; is_featured: boolean; sort_order: number
  }[];
}

export interface HomepageBanner {
  id: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  image: string | null;
  mobile_image: string | null;
  cta_text: string | null;
  cta_link: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_order_value: number;
  max_discount_value: number | null;
  usage_limit: number | null;
  usage_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  reviewer_name: string | null;
  reviewer_email: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  // Joined
  product?: { name: string; slug: string };
  profile?: { name: string | null };
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface CartItemDb {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  size: string;
  created_at: string;
  updated_at: string;
  product?: Product;
}

// Frontend cart item (for Zustand store)
export interface CartItem {
  product: Product;
  qty: number;
  size: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  product_slug: string;
  size: string;
  quantity: number;
  price: number;
  total: number;
}

export interface DbOrder {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  tax: number;
  total: number;
  coupon_id: string | null;
  coupon_code: string | null;
  shipping_address: ShippingAddress | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  payment_status: string;
  items: OrderItem[];
  notes: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  key: string;
  value: unknown;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

// ============================================================
// NEW ENTITY TYPES
// ============================================================

export interface CustomerAddress {
  id: string;
  user_id: string;
  label: string; // Home, Work, Other
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string | null;
  order_id: string | null;
  ticket_number: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: "low" | "normal" | "high" | "urgent";
  customer_name: string;
  customer_email: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  messages?: SupportMessage[];
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_type: "customer" | "admin";
  sender_id: string | null;
  sender_name: string | null;
  message: string;
  attachments: string[];
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string | null;
  admin_email: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface ReturnRequest {
  id: string;
  order_id: string;
  user_id: string;
  items: OrderItem[];
  reason: string;
  comments: string | null;
  status: ReturnStatus;
  refund_amount: number | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  note: string | null;
  changed_by: string | null;
  created_at: string;
}

// ============================================================
// UTILITY TYPES
// ============================================================

export type FilterState = {
  category?: string;
  collection?: string;
  fabric?: string;
  occasion?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "newest";
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
};

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

// Normalize raw DB product to frontend Product shape
export function normalizeProduct(
  p: DbProduct & {
    images?: ProductImage[];
    category?: Category | null;
    collection?: Collection | null;
  }
): Product {
  const images = p.images || [];
  const featured = images.find((i) => i.is_featured) || images[0];
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    description: p.description,
    price: p.price,
    sale_price: p.sale_price,
    compare_at: p.compare_at,
    category_id: p.category_id,
    collection_id: p.collection_id,
    fabric: p.fabric,
    color: p.color,
    occasion: p.occasion,
    tags: p.tags || [],
    details: p.details || [],
    stock_quantity: p.stock_quantity,
    is_featured: p.is_featured,
    is_bestseller: p.is_bestseller,
    is_new_arrival: p.is_new_arrival,
    video_url: p.video_url,
    seo_title: p.seo_title,
    seo_description: p.seo_description,
    status: p.status,
    weave: p.weave,
    badge: p.badge,
    created_at: p.created_at,
    updated_at: p.updated_at,

    images,
    category: p.category || null,
    collection: p.collection || null,
    image: featured?.url || "/placeholder-saree.jpg",
    gallery: images.sort((a, b) => a.sort_order - b.sort_order).map((i) => i.url),
    inStock: p.stock_quantity > 0,
    compareAt: p.compare_at,
    sizes: undefined,
  };
}
