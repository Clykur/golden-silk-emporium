import { create } from "zustand";
import { persist } from "zustand/middleware";
import { productsApi } from "./api";
import type { Product } from "./types";

type ProductsState = {
  products: Product[];
  bestsellers: Product[];
  newArrivals: Product[];
  featured: Product[];
  lastFetched: number | null;
  loading: boolean;
  fetchProducts: (force?: boolean) => Promise<Product[]>;
  fetchBestsellers: (limit?: number, force?: boolean) => Promise<Product[]>;
  fetchNewArrivals: (limit?: number, force?: boolean) => Promise<Product[]>;
  fetchFeatured: (limit?: number, force?: boolean) => Promise<Product[]>;
};

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: [],
      bestsellers: [],
      newArrivals: [],
      featured: [],
      lastFetched: null,
      loading: false,
      fetchProducts: async (force = false) => {
        const { products, lastFetched } = get();
        if (
          !force &&
          products.length > 0 &&
          lastFetched &&
          Date.now() - lastFetched < 5 * 60 * 1000
        ) {
          return products;
        }
        set({ loading: true });
        try {
          const list = await productsApi.list();
          set({ products: list, lastFetched: Date.now(), loading: false });
          return list;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },
      fetchBestsellers: async (limit = 8, force = false) => {
        const { bestsellers, lastFetched } = get();
        if (
          !force &&
          bestsellers.length >= limit &&
          lastFetched &&
          Date.now() - lastFetched < 5 * 60 * 1000
        ) {
          return bestsellers.slice(0, limit);
        }
        set({ loading: true });
        try {
          const list = await productsApi.getBestsellers(limit);
          set((state) => {
            const merged = [...list];
            state.bestsellers.forEach((item) => {
              if (!merged.find((m) => m.id === item.id)) {
                merged.push(item);
              }
            });
            return { bestsellers: merged, loading: false };
          });
          return list;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },
      fetchNewArrivals: async (limit = 8, force = false) => {
        const { newArrivals, lastFetched } = get();
        if (
          !force &&
          newArrivals.length >= limit &&
          lastFetched &&
          Date.now() - lastFetched < 5 * 60 * 1000
        ) {
          return newArrivals.slice(0, limit);
        }
        set({ loading: true });
        try {
          const list = await productsApi.getNewArrivals(limit);
          set((state) => {
            const merged = [...list];
            state.newArrivals.forEach((item) => {
              if (!merged.find((m) => m.id === item.id)) {
                merged.push(item);
              }
            });
            return { newArrivals: merged, loading: false };
          });
          return list;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },
      fetchFeatured: async (limit = 8, force = false) => {
        const { featured, lastFetched } = get();
        if (
          !force &&
          featured.length >= limit &&
          lastFetched &&
          Date.now() - lastFetched < 5 * 60 * 1000
        ) {
          return featured.slice(0, limit);
        }
        set({ loading: true });
        try {
          const list = await productsApi.getFeatured(limit);
          set((state) => {
            const merged = [...list];
            state.featured.forEach((item) => {
              if (!merged.find((m) => m.id === item.id)) {
                merged.push(item);
              }
            });
            return { featured: merged, loading: false };
          });
          return list;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },
    }),
    { name: "drapeva-products" },
  ),
);
