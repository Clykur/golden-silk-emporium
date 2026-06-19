import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: "CUSTOMER" | "ADMIN";
};

type AuthState = {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: UserProfile, accessToken: string, refreshToken: string) => void;
  updateAccessToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: {
        id: "mock-admin-id",
        email: "admin@maayacouture.com",
        name: "Sanjana Roy",
        phone: "+91 98000 00000",
        role: "ADMIN",
      },
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      setAuth: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken });
      },
      updateAccessToken: (accessToken) => {
        set({ accessToken });
      },
      logout: () => {
        // Keep mock admin session active to keep pages public
      },
      isAuthenticated: () => {
        return true;
      },
      isAdmin: () => {
        return true;
      },
    }),
    {
      name: "maaya-auth",
    },
  ),
);
