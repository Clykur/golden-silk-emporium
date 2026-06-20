// ============================================================
// DRAPEVA — Supabase API Layer
// Complete API for all frontend operations
// ============================================================

import { supabase } from "./supabase";
import type {
  FilterState,
  ProductFormData,
  OrderItem,
  ShippingAddress,
  OrderStatus,
  CustomerAddress,
  SupportTicket,
  SupportMessage,
  Notification,
  AuditLog,
  ReturnRequest,
} from "./types";
import { normalizeProduct as normalize } from "./types";

// ============================================================
// PRODUCTS
// ============================================================

export const productsApi = {
  async list(filters: FilterState = {}) {
    let query = supabase
      .from("products")
      .select(
        `
        *,
        images:product_images(*),
        category:categories(*),
        collection:collections(*)
      `,
      )
      .eq("status", "published");

    if (filters.category) query = query.eq("categories.slug", filters.category);
    if (filters.collection) {
      query = query.filter("collection.slug", "eq", filters.collection);
    }
    if (filters.fabric) query = query.eq("fabric", filters.fabric);
    if (filters.occasion) query = query.eq("occasion", filters.occasion);
    if (filters.color) query = query.ilike("color", `%${filters.color}%`);
    if (filters.minPrice) query = query.gte("price", filters.minPrice);
    if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
    if (filters.inStock) query = query.gt("stock_quantity", 0);
    if (filters.isFeatured) query = query.eq("is_featured", true);
    if (filters.isBestseller) query = query.eq("is_bestseller", true);
    if (filters.isNewArrival) query = query.eq("is_new_arrival", true);
    if (filters.isSale) query = query.not("sale_price", "is", null);
    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,fabric.ilike.%${filters.search}%`,
      );
    }

    if (filters.sort === "price-asc") query = query.order("price", { ascending: true });
    else if (filters.sort === "price-desc") query = query.order("price", { ascending: false });
    else if (filters.sort === "newest") query = query.order("created_at", { ascending: false });
    else
      query = query
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(normalize);
  },

  async getBySlug(slugOrId: string) {
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = UUID_RE.test(slugOrId);

    let query = supabase.from("products").select(`
        *,
        images:product_images(*),
        category:categories(*),
        collection:collections(*)
      `);

    if (isUuid) {
      query = query.eq("id", slugOrId);
    } else {
      query = query.eq("slug", slugOrId);
    }

    const { data, error } = await query.single();
    if (error) throw error;
    return normalize(data);
  },

  async getFeatured(limit = 8) {
    return productsApi.list({ isFeatured: true, sort: "featured" }).then((p) => p.slice(0, limit));
  },

  async getBestsellers(limit = 8) {
    return productsApi
      .list({ isBestseller: true, sort: "featured" })
      .then((p) => p.slice(0, limit));
  },

  async getNewArrivals(limit = 8) {
    return productsApi.list({ isNewArrival: true, sort: "newest" }).then((p) => p.slice(0, limit));
  },

  async getRelated(productId: string, categoryId: string | null, limit = 4) {
    let query = supabase
      .from("products")
      .select(`*, images:product_images(*), category:categories(*), collection:collections(*)`)
      .eq("status", "published")
      .neq("id", productId)
      .limit(limit);
    if (categoryId) query = query.eq("category_id", categoryId);
    const { data, error } = await query;
    if (error) return [];
    return (data || []).map(normalize);
  },

  // ADMIN
  async adminList() {
    const { data, error } = await supabase
      .from("products")
      .select(`*, images:product_images(*), category:categories(*), collection:collections(*)`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(normalize);
  },

  async create(form: ProductFormData) {
    const { images, ...productData } = form;
    const { data: product, error } = await supabase
      .from("products")
      .insert(productData as any)
      .select()
      .single();
    if (error) throw error;

    if (images.length > 0) {
      const { error: imgError } = await supabase.from("product_images").insert(
        images.map((img, i) => ({
          url: img.url,
          alt_text: img.alt_text,
          is_featured: img.is_featured,
          product_id: product.id,
          sort_order: i,
        })),
      );
      if (imgError) throw imgError;
    }
    return product;
  },

  async update(id: string, form: Partial<ProductFormData>) {
    const { images, ...productData } = form;
    const { error } = await supabase
      .from("products")
      .update(productData as any)
      .eq("id", id);
    if (error) throw error;

    if (images !== undefined) {
      await supabase.from("product_images").delete().eq("product_id", id);
      if (images.length > 0) {
        await supabase.from("product_images").insert(
          images.map((img, i) => ({
            url: img.url,
            alt_text: img.alt_text,
            is_featured: img.is_featured,
            product_id: id,
            sort_order: i,
          })),
        );
      }
    }
  },

  async delete(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },

  async duplicate(id: string) {
    const { data, error } = await supabase
      .from("products")
      .select(`*, images:product_images(*)`)
      .eq("id", id)
      .single();
    if (error) throw error;
    const { images, id: _id, created_at, updated_at, ...rest } = data as any;
    const newSlug = `${rest.slug}-copy-${Date.now()}`;
    const newSku = rest.sku ? `${rest.sku}-COPY` : null;
    return productsApi.create({
      ...rest,
      slug: newSlug,
      sku: newSku,
      status: "draft",
      images: images || [],
    });
  },

  async updateStock(id: string, quantity: number) {
    const { error } = await supabase
      .from("products")
      .update({ stock_quantity: quantity })
      .eq("id", id);
    if (error) throw error;
  },
};

// ============================================================
// CATEGORIES
// ============================================================

export const categoriesApi = {
  async list() {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data || [];
  },

  async adminList() {
    const { data, error } = await supabase.from("categories").select("*").order("sort_order");
    if (error) throw error;
    return data || [];
  },

  async create(data: { name: string; slug: string; description?: string; image?: string }) {
    const { data: cat, error } = await supabase.from("categories").insert(data).select().single();
    if (error) throw error;
    return cat;
  },

  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      description: string;
      image: string;
      sort_order: number;
      is_active: boolean;
    }>,
  ) {
    const { error } = await supabase.from("categories").update(data).eq("id", id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
  },
};

// ============================================================
// COLLECTIONS
// ============================================================

export const collectionsApi = {
  async list() {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data || [];
  },

  async adminList() {
    const { data, error } = await supabase.from("collections").select("*").order("sort_order");
    if (error) throw error;
    return data || [];
  },

  async create(data: {
    name: string;
    slug: string;
    tagline?: string;
    description?: string;
    image?: string;
    is_featured?: boolean;
    sort_order?: number;
  }) {
    const { data: col, error } = await supabase.from("collections").insert(data).select().single();
    if (error) throw error;
    return col;
  },

  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      tagline: string;
      description: string;
      image: string;
      is_featured: boolean;
      sort_order: number;
      is_active: boolean;
    }>,
  ) {
    const { error } = await supabase.from("collections").update(data).eq("id", id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) throw error;
  },
};

// ============================================================
// ORDERS
// ============================================================

export const ordersApi = {
  async create(order: {
    items: OrderItem[];
    subtotal: number;
    discount: number;
    shipping_cost: number;
    tax: number;
    total: number;
    coupon_id?: string;
    coupon_code?: string;
    shipping_address: ShippingAddress;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    user_id?: string;
    razorpay_order_id?: string;
    payment_status?: string;
  }) {
    const { data, error } = await supabase.from("orders").insert(order).select().single();
    if (error) throw error;
    return data;
  },

  async updatePayment(
    id: string,
    payment: { razorpay_payment_id: string; razorpay_signature: string; payment_status: string },
  ) {
    const { error } = await supabase
      .from("orders")
      .update({ ...payment, status: "processing" })
      .eq("id", id);
    if (error) throw error;
  },

  async createRazorpayOrder(orderId: string, amount: number) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token || "";

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const response = await fetch(`${apiUrl}/api/payments/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderId, amount }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to create Razorpay order");
    }

    return await response.json();
  },

  async verifyRazorpayPayment(payload: {
    orderId: string;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    signature: string;
  }) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token || "";

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const response = await fetch(`${apiUrl}/api/payments/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Payment verification failed");
    }

    return await response.json();
  },

  async getUserOrders(userId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Backward compatibility alias
  async history() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    return ordersApi.getUserOrders(user.id);
  },

  async getById(id: string) {
    const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  },

  async getStatusHistory(orderId: string) {
    const { data, error } = await supabase
      .from("order_status_history")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    if (error) return [];
    return data || [];
  },

  async cancelOrder(id: string) {
    const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
    if (error) throw error;
  },

  // ADMIN
  async adminList() {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async updateStatus(id: string, status: OrderStatus, tracking_number?: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status, ...(tracking_number ? { tracking_number } : {}) })
      .eq("id", id);
    if (error) throw error;
  },

  async updatePaymentStatus(id: string, payment_status: string) {
    const { error } = await supabase.from("orders").update({ payment_status }).eq("id", id);
    if (error) throw error;
  },
};

// ============================================================
// CUSTOMER ADDRESSES
// ============================================================

export const addressesApi = {
  async list(userId: string) {
    const { data, error } = await supabase
      .from("customer_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as CustomerAddress[];
  },

  async create(address: Omit<CustomerAddress, "id" | "created_at" | "updated_at">) {
    const { data, error } = await supabase
      .from("customer_addresses")
      .insert(address)
      .select()
      .single();
    if (error) throw error;
    return data as CustomerAddress;
  },

  async update(id: string, address: Partial<CustomerAddress>) {
    const { error } = await supabase.from("customer_addresses").update(address).eq("id", id);
    if (error) throw error;
  },

  async setDefault(id: string, userId: string) {
    // Unset all, then set this one
    await supabase.from("customer_addresses").update({ is_default: false }).eq("user_id", userId);
    const { error } = await supabase
      .from("customer_addresses")
      .update({ is_default: true })
      .eq("id", id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from("customer_addresses").delete().eq("id", id);
    if (error) throw error;
  },
};

// ============================================================
// SUPPORT TICKETS
// ============================================================

export const supportApi = {
  async listUserTickets(userId: string) {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*, messages:support_messages(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as SupportTicket[];
  },

  async createTicket(ticket: {
    user_id?: string | null;
    order_id?: string;
    subject: string;
    category: string;
    customer_name: string;
    customer_email: string;
    message: string; // first message
  }) {
    const { data: newTicket, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: ticket.user_id || null,
        order_id: ticket.order_id || null,
        subject: ticket.subject,
        category: ticket.category as any,
        customer_name: ticket.customer_name,
        customer_email: ticket.customer_email,
        status: "open",
        priority: "normal",
        resolved_at: null,
      })
      .select()
      .single();
    if (error) throw error;

    // Add first message
    await supabase.from("support_messages").insert({
      ticket_id: newTicket.id,
      sender_type: "customer",
      sender_id: ticket.user_id || null,
      sender_name: ticket.customer_name,
      message: ticket.message,
      attachments: [],
    });

    return newTicket as SupportTicket;
  },

  async addMessage(ticketId: string, message: Omit<SupportMessage, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("support_messages")
      .insert({ ...message, ticket_id: ticketId })
      .select()
      .single();
    if (error) throw error;
    return data as SupportMessage;
  },

  async getTicketWithMessages(ticketId: string) {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*, messages:support_messages(*)")
      .eq("id", ticketId)
      .single();
    if (error) throw error;
    return data as SupportTicket;
  },

  // ADMIN
  async adminListTickets() {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*, messages:support_messages(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as SupportTicket[];
  },

  async updateTicketStatus(id: string, status: string, admin_notes?: string) {
    const { error } = await supabase
      .from("support_tickets")
      .update({
        status: status as any,
        ...(admin_notes ? { admin_notes } : {}),
        ...(status === "resolved" ? { resolved_at: new Date().toISOString() } : {}),
      })
      .eq("id", id);
    if (error) throw error;
  },
};

// ============================================================
// NOTIFICATIONS
// ============================================================

export const notificationsApi = {
  async list(userId: string) {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data || []) as Notification[];
  },

  async unreadCount(userId: string) {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    if (error) return 0;
    return count || 0;
  },

  async markRead(id: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  async markAllRead(userId: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_read", false);
    if (error) throw error;
  },

  async create(notification: Omit<Notification, "id" | "created_at" | "read_at">) {
    const { error } = await supabase.from("notifications").insert({
      ...notification,
      read_at: null,
    });
    if (error) throw error;
  },
};

// ============================================================
// RETURN REQUESTS
// ============================================================

export const returnsApi = {
  async getUserReturns(userId: string) {
    const { data, error } = await supabase
      .from("return_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []) as ReturnRequest[];
  },

  async create(req: {
    order_id: string;
    user_id: string;
    items: OrderItem[];
    reason: string;
    comments?: string;
  }) {
    const { data, error } = await supabase
      .from("return_requests")
      .insert({
        order_id: req.order_id,
        user_id: req.user_id,
        items: req.items,
        reason: req.reason,
        comments: req.comments || null,
        status: "requested",
        refund_amount: null,
        admin_notes: null,
      })
      .select()
      .single();
    if (error) throw error;
    return data as ReturnRequest;
  },

  // ADMIN
  async adminList() {
    const { data, error } = await supabase
      .from("return_requests")
      .select("*, order:orders(customer_name, customer_email, total)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async updateStatus(id: string, status: string, refund_amount?: number, admin_notes?: string) {
    const { error } = await supabase
      .from("return_requests")
      .update({
        status: status as any,
        ...(refund_amount ? { refund_amount } : {}),
        ...(admin_notes ? { admin_notes } : {}),
      })
      .eq("id", id);
    if (error) throw error;
  },
};

// ============================================================
// AUDIT LOGS
// ============================================================

export const auditLogApi = {
  async log(entry: Omit<AuditLog, "id" | "created_at">) {
    const { error } = await supabase.from("audit_logs").insert(entry);
    if (error) console.error("Audit log failed:", error);
  },

  async list(limit = 100) {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []) as AuditLog[];
  },
};

// ============================================================
// REVIEWS
// ============================================================

export const reviewsApi = {
  async getForProduct(productId: string) {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, profile:profiles(name)")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getRecentApproved(limit = 6) {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, profile:profiles(name)")
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return data || [];
  },

  async submit(review: {
    product_id: string;
    rating: number;
    title?: string;
    comment?: string;
    reviewer_name?: string;
    reviewer_email?: string;
    user_id?: string;
  }) {
    const { data, error } = await supabase.from("reviews").insert(review).select().single();
    if (error) throw error;
    return data;
  },

  // ADMIN
  async adminList() {
    const { data, error } = await supabase
      .from("reviews")
      .select("*, product:products(name, slug)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async approve(id: string) {
    const { error } = await supabase.from("reviews").update({ is_approved: true }).eq("id", id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) throw error;
  },
};

// ============================================================
// COUPONS
// ============================================================

export const couponsApi = {
  async validate(code: string, cartTotal: number) {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();
    if (error || !data) throw new Error("Invalid coupon code");
    if (data.expires_at && new Date(data.expires_at) < new Date())
      throw new Error("Coupon has expired");
    if (cartTotal < data.min_order_value)
      throw new Error(`Minimum order of ₹${data.min_order_value} required`);
    if (data.usage_limit && data.usage_count >= data.usage_limit)
      throw new Error("Coupon usage limit reached");

    let discount = 0;
    if (data.discount_type === "percentage") {
      discount = (cartTotal * data.discount_value) / 100;
      if (data.max_discount_value) discount = Math.min(discount, data.max_discount_value);
    } else {
      discount = data.discount_value;
    }
    return { coupon: data, discount };
  },

  async adminList() {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(coupon: Omit<import("./types").Coupon, "id" | "created_at" | "usage_count">) {
    const { data, error } = await supabase
      .from("coupons")
      .insert({ ...coupon, code: coupon.code.toUpperCase() })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id: string, coupon: Partial<import("./types").Coupon>) {
    const { error } = await supabase.from("coupons").update(coupon).eq("id", id);
    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) throw error;
  },
};

// ============================================================
// WISHLIST
// ============================================================

export const wishlistApi = {
  async get(userId: string) {
    const { data, error } = await supabase
      .from("wishlist")
      .select("*, product:products(*, images:product_images(*))")
      .eq("user_id", userId);
    if (error) throw error;
    return data || [];
  },

  async add(userId: string, productId: string) {
    const { error } = await supabase
      .from("wishlist")
      .upsert({ user_id: userId, product_id: productId }, { onConflict: "user_id,product_id" });
    if (error) throw error;
  },

  async remove(userId: string, productId: string) {
    const { error } = await supabase
      .from("wishlist")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);
    if (error) throw error;
  },
};

// ============================================================
// CART (for logged-in users — guests use Zustand)
// ============================================================

export const cartApi = {
  async get(userId: string) {
    const { data, error } = await supabase
      .from("cart_items")
      .select("*, product:products(*, images:product_images(*))")
      .eq("user_id", userId);
    if (error) throw error;
    return data || [];
  },

  async upsert(userId: string, productId: string, quantity: number, size: string) {
    const { error } = await supabase.from("cart_items").upsert(
      {
        user_id: userId,
        product_id: productId,
        quantity,
        size,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,product_id,size" },
    );
    if (error) throw error;
  },

  async remove(userId: string, productId: string, size: string) {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId)
      .eq("size", size);
    if (error) throw error;
  },

  async clear(userId: string) {
    const { error } = await supabase.from("cart_items").delete().eq("user_id", userId);
    if (error) throw error;
  },
};

// ============================================================
// HOMEPAGE CONTENT
// ============================================================

export const homepageApi = {
  async getBanners() {
    const { data, error } = await supabase
      .from("homepage_banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error) throw error;
    return data || [];
  },

  async adminListBanners() {
    const { data, error } = await supabase.from("homepage_banners").select("*").order("sort_order");
    if (error) throw error;
    return data || [];
  },

  async createBanner(banner: Omit<import("./types").HomepageBanner, "id" | "created_at">) {
    const { data, error } = await supabase
      .from("homepage_banners")
      .insert(banner)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateBanner(id: string, banner: Partial<import("./types").HomepageBanner>) {
    const { error } = await supabase.from("homepage_banners").update(banner).eq("id", id);
    if (error) throw error;
  },

  async deleteBanner(id: string) {
    const { error } = await supabase.from("homepage_banners").delete().eq("id", id);
    if (error) throw error;
  },
};

// ============================================================
// ADMIN STATS
// ============================================================

export const adminStatsApi = {
  async getOverview() {
    const [ordersRes, productsRes, customersRes] = await Promise.all([
      supabase
        .from("orders")
        .select("total, status, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("products").select("id, status, stock_quantity"),
      supabase.from("profiles").select("id, role, created_at"),
    ]);

    const orders = ordersRes.data || [];
    const products = productsRes.data || [];
    const customers = customersRes.data || [];

    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const publishedProducts = products.filter((p) => p.status === "published").length;
    const lowStockProducts = products.filter(
      (p) => p.stock_quantity <= 5 && p.stock_quantity > 0,
    ).length;
    const outOfStock = products.filter((p) => p.stock_quantity === 0).length;
    const totalCustomers = customers.filter((c) => c.role === "customer").length;

    const now = new Date();
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const monthOrders = orders.filter((o) => {
        const od = new Date(o.created_at);
        return (
          od.getFullYear() === d.getFullYear() &&
          od.getMonth() === d.getMonth() &&
          o.status !== "cancelled"
        );
      });
      return {
        month: d.toLocaleString("default", { month: "short" }),
        sales: monthOrders.reduce((s, o) => s + (o.total || 0), 0),
        orders: monthOrders.length,
      };
    });

    return {
      totalRevenue,
      totalOrders,
      publishedProducts,
      lowStockProducts,
      outOfStock,
      totalCustomers,
      monthlyData,
    };
  },
};

// ============================================================
// SITE SETTINGS
// ============================================================
export const settingsApi = {
  async getSettings() {
    const { data, error } = await supabase.from("site_settings").select("*");
    if (error) throw error;
    return data || [];
  },

  async updateSettings(settings: Record<string, any>) {
    const promises = Object.entries(settings).map(async ([key, value]) => {
      const { error } = await supabase.from("site_settings").upsert({
        key,
        value,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    });
    await Promise.all(promises);
  },
};

// ============================================================
// AUTH API
// ============================================================

export const authApi = {
  async login(identifier: string, password: string) {
    const isEmail = identifier.includes("@");
    const credentials: any = { password };
    if (isEmail) {
      credentials.email = identifier;
    } else {
      const formatted = identifier.startsWith("+")
        ? identifier
        : `+91${identifier.replace(/\D/g, "")}`;
      credentials.phone = formatted;
    }
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data;
  },

  async register(params: { email?: string; phone?: string; password?: string; name: string }) {
    const { email, phone, password, name } = params;
    const signUpParams: any = {
      password,
      options: { data: { name, role: "customer", phone: phone || "" } },
    };
    if (email) {
      signUpParams.email = email;
    } else if (phone) {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
      signUpParams.phone = formattedPhone;
    } else {
      throw new Error("Either email or phone is required for registration");
    }
    const { data, error } = await supabase.auth.signUp(signUpParams);
    if (error) throw error;
    return data;
  },

  async sendOtp(phone: string) {
    // Format phone to E.164 if needed
    const formatted = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
    const { data, error } = await supabase.auth.signInWithOtp({ phone: formatted });
    if (error) throw error;
    return data;
  },

  async verifyOtp(phone: string, token: string) {
    const formatted = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
    const { data, error } = await supabase.auth.verifyOtp({ phone: formatted, token, type: "sms" });
    if (error) throw error;
    return data;
  },

  async forgotPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },

  async resetPassword({ token, password }: { token: string; password?: string }) {
    if (password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    }
  },

  async verifyEmail(token: string) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "email",
    });
    if (error) throw error;
  },

  async updateProfile(data: { name?: string; phone?: string; avatar_url?: string }) {
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !user) throw new Error("Not authenticated");
    const { error } = await supabase
      .from("profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    if (error) throw error;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};

// ============================================================
// NEWSLETTER
// ============================================================

export const newsletterApi = {
  async subscribe(email: string) {
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email, is_active: true });
    if (error) throw error;
  },
};

// ============================================================
// APPOINTMENTS (Concierge scheduling API)
// ============================================================
export const appointmentsApi = {
  async create(data: {
    name: string;
    email: string;
    phone: string;
    date: string;
    timeSlot: string;
    type: "IN_PERSON" | "VIDEO";
    notes?: string;
  }) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const response = await fetch(`${apiUrl}/api/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to schedule appointment");
    }
    return await response.json();
  },
};

// ============================================================
// Legacy compatibility export
// ============================================================
export const api = {
  auth: authApi,
  products: productsApi,
  orders: ordersApi,
  categories: categoriesApi,
  collections: collectionsApi,
  reviews: reviewsApi,
  coupons: couponsApi,
  wishlist: wishlistApi,
  cart: cartApi,
  homepage: homepageApi,
  adminStats: adminStatsApi,
  settings: settingsApi,
  newsletter: newsletterApi,
  addresses: addressesApi,
  support: supportApi,
  notifications: notificationsApi,
  returns: returnsApi,
  auditLog: auditLogApi,
  appointments: appointmentsApi,
};

export default api;
