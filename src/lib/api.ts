/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from "./auth-store";

const API_BASE = "http://localhost:5000/api";

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken, updateAccessToken, logout } = useAuth.getState();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      logout();
      return null;
    }

    const data = await res.json();
    updateAccessToken(data.accessToken);
    return data.accessToken;
  } catch (err) {
    console.error("Token refresh failed:", err);
    logout();
    return null;
  }
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const { accessToken } = useAuth.getState();

  const headers: any = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: headers as HeadersInit,
  });

  // Handle Token Expiry (403 or 401)
  if ((response.status === 401 || response.status === 403) && accessToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: headers as HeadersInit,
      });
    }
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `API error: ${response.status}`);
  }

  return data;
}

export const api = {
  auth: {
    login: (body: any) => apiFetch("/auth/login", { method: "POST", body: JSON.stringify(body) }),
    register: (body: any) =>
      apiFetch("/auth/register", { method: "POST", body: JSON.stringify(body) }),
    forgotPassword: (email: string) =>
      apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
    resetPassword: (body: any) =>
      apiFetch("/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),
    verifyEmail: (token: string) =>
      apiFetch("/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) }),
    otpVerify: (body: any) =>
      apiFetch("/auth/otp-verify", { method: "POST", body: JSON.stringify(body) }),
    me: () => apiFetch("/auth/me"),
  },
  products: {
    list: (params: string = "") => apiFetch(`/products${params}`),
    get: (id: string) => apiFetch(`/products/${id}`),
    categories: () => apiFetch("/products/categories"),
    collections: () => apiFetch("/products/collections"),
    create: (body: any) => apiFetch("/products", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) =>
      apiFetch(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => apiFetch(`/products/${id}`, { method: "DELETE" }),
    submitReview: (id: string, body: any) =>
      apiFetch(`/products/${id}/reviews`, { method: "POST", body: JSON.stringify(body) }),
    getReviews: (id: string) => apiFetch(`/products/${id}/reviews`),
  },
  orders: {
    create: (body: any) => apiFetch("/orders", { method: "POST", body: JSON.stringify(body) }),
    verifyPayment: (body: any) =>
      apiFetch("/orders/verify-payment", { method: "POST", body: JSON.stringify(body) }),
    applyCoupon: (code: string, cartTotal: number) =>
      apiFetch("/orders/coupon/apply", {
        method: "POST",
        body: JSON.stringify({ code, cartTotal }),
      }),
    history: () => apiFetch("/orders"),
    get: (id: string) => apiFetch(`/orders/${id}`),
    updateStatus: (id: string, status: string) =>
      apiFetch(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  },
  appointments: {
    create: (body: any) =>
      apiFetch("/appointments", { method: "POST", body: JSON.stringify(body) }),
    list: () => apiFetch("/appointments"),
    updateStatus: (id: string, status: string) =>
      apiFetch(`/appointments/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
  },
  blog: {
    list: () => apiFetch("/blog"),
    get: (slug: string) => apiFetch(`/blog/${slug}`),
    create: (body: any) => apiFetch("/blog", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: any) =>
      apiFetch(`/blog/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => apiFetch(`/blog/${id}`, { method: "DELETE" }),
  },
  support: {
    createTicket: (body: any) =>
      apiFetch("/support", { method: "POST", body: JSON.stringify(body) }),
    subscribeNewsletter: (email: string) =>
      apiFetch("/support/newsletter", { method: "POST", body: JSON.stringify({ email }) }),
    tickets: () => apiFetch("/support/tickets"),
    updateTicketStatus: (id: string, status: string) =>
      apiFetch(`/support/tickets/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),
  },
};
