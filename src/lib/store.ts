import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./products";

type CartItem = { product: Product; qty: number; size: string };

type ShopState = {
  cart: CartItem[];
  wishlist: string[];
  cartOpen: boolean;
  quickView: Product | null;
  addToCart: (product: Product, size?: string, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  toggleWishlist: (id: string) => void;
  openCart: () => void;
  closeCart: () => void;
  setQuickView: (p: Product | null) => void;
  clearCart: () => void;
};

export const useShop = create<ShopState>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      cartOpen: false,
      quickView: null,
      addToCart: (product, size = "M", qty = 1) =>
        set((s) => {
          const existing = s.cart.find((c) => c.product.id === product.id && c.size === size);
          const cart = existing
            ? s.cart.map((c) =>
                c === existing ? { ...c, qty: c.qty + qty } : c,
              )
            : [...s.cart, { product, size, qty }];
          return { cart, cartOpen: true };
        }),
      removeFromCart: (id) =>
        set((s) => ({ cart: s.cart.filter((c) => c.product.id !== id) })),
      updateQty: (id, qty) =>
        set((s) => ({
          cart: s.cart
            .map((c) => (c.product.id === id ? { ...c, qty } : c))
            .filter((c) => c.qty > 0),
        })),
      toggleWishlist: (id) =>
        set((s) => ({
          wishlist: s.wishlist.includes(id)
            ? s.wishlist.filter((w) => w !== id)
            : [...s.wishlist, id],
        })),
      openCart: () => set({ cartOpen: true }),
      closeCart: () => set({ cartOpen: false }),
      setQuickView: (p) => set({ quickView: p }),
      clearCart: () => set({ cart: [] }),
    }),
    { name: "maaya-shop" },
  ),
);

export const cartTotal = (cart: CartItem[]) =>
  cart.reduce((s, c) => s + c.product.price * c.qty, 0);
export const cartCount = (cart: CartItem[]) =>
  cart.reduce((s, c) => s + c.qty, 0);
