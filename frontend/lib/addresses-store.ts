import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addressesApi } from "./api";
import type { CustomerAddress } from "./types";

type AddressesState = {
  addresses: CustomerAddress[];
  loading: boolean;
  fetchAddresses: (userId: string, force?: boolean) => Promise<CustomerAddress[]>;
  addAddress: (
    address: Omit<CustomerAddress, "id" | "created_at" | "updated_at">,
  ) => Promise<CustomerAddress>;
  updateAddress: (id: string, address: Partial<CustomerAddress>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string, userId: string) => Promise<void>;
};

export const useAddressesStore = create<AddressesState>()(
  persist(
    (set, get) => ({
      addresses: [],
      loading: false,
      fetchAddresses: async (userId, force = false) => {
        const { addresses } = get();
        if (!force && addresses.length > 0) {
          return addresses;
        }
        set({ loading: true });
        try {
          const list = await addressesApi.list(userId);
          set({ addresses: list, loading: false });
          return list;
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },
      addAddress: async (addr) => {
        const tempId = Math.random().toString();
        const tempAddress: CustomerAddress = {
          id: tempId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...addr,
        };
        set((s) => ({ addresses: [tempAddress, ...s.addresses] }));

        try {
          const inserted = await addressesApi.create(addr);
          set((s) => ({
            addresses: s.addresses.map((a) => (a.id === tempId ? inserted : a)),
          }));
          return inserted;
        } catch (err) {
          set((s) => ({ addresses: s.addresses.filter((a) => a.id !== tempId) }));
          throw err;
        }
      },
      updateAddress: async (id, addr) => {
        const prevAddresses = get().addresses;
        set((s) => ({
          addresses: s.addresses.map((a) => (a.id === id ? { ...a, ...addr } : a)),
        }));

        try {
          await addressesApi.update(id, addr);
        } catch (err) {
          set({ addresses: prevAddresses });
          throw err;
        }
      },
      deleteAddress: async (id) => {
        const prevAddresses = get().addresses;
        set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) }));

        try {
          await addressesApi.delete(id);
        } catch (err) {
          set({ addresses: prevAddresses });
          throw err;
        }
      },
      setDefaultAddress: async (id, userId) => {
        const prevAddresses = get().addresses;
        set((s) => ({
          addresses: s.addresses.map((a) => ({
            ...a,
            is_default: a.id === id,
          })),
        }));

        try {
          await addressesApi.setDefault(id, userId);
        } catch (err) {
          set({ addresses: prevAddresses });
          throw err;
        }
      },
    }),
    { name: "drapeva-addresses" },
  ),
);
