import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, CartItem } from "./types";
import { normalizeProduct } from "./types";
import { cartApi, wishlistApi } from "./api";

type ShopState = {
  cart: CartItem[];
  wishlist: string[];
  wishlistItems: Product[];
  cartOpen: boolean;
  quickView: Product | null;
  addToCart: (product: Product, size?: string, qty?: number) => void;
  removeFromCart: (id: string, size?: string) => void;
  updateQty: (id: string, size: string, qty: number) => void;
  toggleWishlist: (product: Product) => void;
  openCart: () => void;
  closeCart: () => void;
  setQuickView: (p: Product | null) => void;
  clearCart: () => void;
  clearWishlist: () => void;
  syncWithDatabase: () => Promise<void>;
};

// Module-level lock to prevent concurrent sync calls
let _isSyncing = false;

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      wishlistItems: [],
      cartOpen: false,
      quickView: null,
      addToCart: (product, size = "Free Size", qty = 1) =>
        set((s) => {
          const existing = s.cart.find((c) => c.product.id === product.id && c.size === size);
          const currentQty = existing ? existing.qty : 0;
          const maxStock = product.stock_quantity;

          if (currentQty + qty > maxStock) {
            import("sonner").then(({ toast }) => {
              toast.error(`Only ${maxStock} units are available in stock.`);
            });
            qty = maxStock - currentQty;
            if (qty <= 0) {
              return {};
            }
          }

          const cart = existing
            ? s.cart.map((c) => (c === existing ? { ...c, qty: c.qty + qty } : c))
            : [...s.cart, { product, size, qty }];

          // Sync with database if logged in
          import("./auth-store").then(({ useAuth }) => {
            const user = useAuth.getState().user;
            if (user) {
              const item = cart.find((c) => c.product.id === product.id && c.size === size);
              if (item) {
                cartApi.upsert(user.id, product.id, item.qty, size).catch(console.error);
              }
            }
          });

          return { cart };
        }),
      removeFromCart: (id, size) =>
        set((s) => {
          const cart = s.cart.filter(
            (c) => !(c.product.id === id && (size === undefined || c.size === size)),
          );

          // Sync with database if logged in
          import("./auth-store").then(({ useAuth }) => {
            const user = useAuth.getState().user;
            if (user) {
              if (size !== undefined) {
                cartApi.remove(user.id, id, size).catch(console.error);
              } else {
                const removedItems = s.cart.filter((c) => c.product.id === id);
                Promise.all(
                  removedItems.map((item) => cartApi.remove(user.id, id, item.size)),
                ).catch(console.error);
              }
            }
          });

          return { cart };
        }),
      updateQty: (id, size, qty) =>
        set((s) => {
          const item = s.cart.find((c) => c.product.id === id && c.size === size);
          if (item && qty > item.product.stock_quantity) {
            import("sonner").then(({ toast }) => {
              toast.error(`Only ${item.product.stock_quantity} units are available in stock.`);
            });
            qty = item.product.stock_quantity;
          }
          const cart = s.cart
            .map((c) => (c.product.id === id && c.size === size ? { ...c, qty } : c))
            .filter((c) => c.qty > 0);

          // Sync with database if logged in
          import("./auth-store").then(({ useAuth }) => {
            const user = useAuth.getState().user;
            if (user) {
              if (qty > 0) {
                cartApi.upsert(user.id, id, qty, size).catch(console.error);
              } else {
                cartApi.remove(user.id, id, size).catch(console.error);
              }
            }
          });

          return { cart };
        }),
      toggleWishlist: (product) =>
        set((s) => {
          const isWishlisted = s.wishlist.includes(product.id);
          const wishlist = isWishlisted
            ? s.wishlist.filter((w) => w !== product.id)
            : [...s.wishlist.filter((w) => w !== product.id), product.id];
          const wishlistItems = isWishlisted
            ? s.wishlistItems.filter((w) => w.id !== product.id)
            : [...s.wishlistItems.filter((w) => w.id !== product.id), product];

          // Sync with database if logged in
          import("./auth-store").then(({ useAuth }) => {
            const user = useAuth.getState().user;
            if (user) {
              if (isWishlisted) {
                wishlistApi.remove(user.id, product.id).catch(console.error);
              } else {
                wishlistApi.add(user.id, product.id).catch(console.error);
              }
            }
          });

          return { wishlist, wishlistItems };
        }),
      openCart: () => set({ cartOpen: true }),
      closeCart: () => set({ cartOpen: false }),
      setQuickView: (p) => set({ quickView: p }),
      clearCart: () => {
        set({ cart: [] });
        // Also clear the database cart for the logged-in user
        import("./auth-store").then(({ useAuth }) => {
          const user = useAuth.getState().user;
          if (user) {
            cartApi.clear(user.id).catch(console.error);
          }
        });
      },
      clearWishlist: () => set({ wishlist: [], wishlistItems: [] }),
      syncWithDatabase: async () => {
        // Prevent concurrent sync calls (e.g. triggered by multiple auth events)
        if (_isSyncing) return;
        _isSyncing = true;

        try {
          const { useAuth } = await import("./auth-store");
          const user = useAuth.getState().user;
          if (!user) return;

          // ---- 1. Sync Cart ----
          const dbCartItems = (await cartApi.get(user.id)) as any[];
          const localCart = get().cart;

          // Upsert local items into DB (cartApi.upsert handles conflicts gracefully)
          for (const localItem of localCart) {
            const dbItem = dbCartItems.find(
              (item) => item.product_id === localItem.product.id && item.size === localItem.size,
            );
            const newQty = dbItem ? Math.max(dbItem.quantity, localItem.qty) : localItem.qty;
            await cartApi.upsert(user.id, localItem.product.id, newQty, localItem.size);
          }

          // Fetch final merged cart from DB
          const finalDbCartItems = (await cartApi.get(user.id)) as any[];
          const mergedCart = finalDbCartItems.map((item) => ({
            product: normalizeProduct({
              ...item.product,
              images: item.product?.images || [],
            } as any),
            size: item.size,
            qty: item.quantity,
          }));

          // ---- 2. Sync Wishlist ----
          const dbWishlistItems = (await wishlistApi.get(user.id)) as any[];
          const dbWishlistIds = new Set(dbWishlistItems.map((item: any) => item.product_id));
          const localWishlist = get().wishlist;

          // Only add items not already in DB to avoid duplicate key errors
          for (const localId of localWishlist) {
            if (!dbWishlistIds.has(localId)) {
              await wishlistApi.add(user.id, localId);
            }
          }

          // Fetch final wishlist from DB
          const finalDbWishlistItems = (await wishlistApi.get(user.id)) as any[];
          const mergedWishlist = finalDbWishlistItems.map((item) => item.product_id);
          const mergedWishlistItems = finalDbWishlistItems.map((item) =>
            normalizeProduct({
              ...item.product,
              images: item.product?.images || [],
            } as any),
          );

          set({ cart: mergedCart, wishlist: mergedWishlist, wishlistItems: mergedWishlistItems });
        } catch (err) {
          console.error("Error syncing cart/wishlist with database:", err);
        } finally {
          _isSyncing = false;
        }
      },
    }),
    { name: "drapeva-shop" },
  ),
);

export const cartTotal = (cart: CartItem[]) =>
  cart.reduce((s, c) => s + (c.product.sale_price || c.product.price) * c.qty, 0);
export const cartCount = (cart: CartItem[]) => cart.reduce((s, c) => s + c.qty, 0);
