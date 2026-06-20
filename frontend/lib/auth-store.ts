import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "./supabase";
import type { Profile } from "./types";

type AuthState = {
  user: Profile | null;
  session: { access_token: string; refresh_token: string } | null;
  loading: boolean;
  setAuth: (user: Profile, session: { access_token: string; refresh_token: string }) => void;
  setUser: (user: Profile | null) => void;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      setAuth: (user, session) => set({ user, session, loading: false }),
      setUser: (user) => set({ user, loading: false }),
      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, loading: false });
        try {
          const { useShop } = await import("./store");
          useShop.getState().clearCart();
          useShop.getState().clearWishlist();
        } catch (e) {
          console.error("Error clearing shop store on logout:", e);
        }
      },
      isAuthenticated: () => !!get().user,
      isAdmin: () => get().user?.role === "admin",
    }),
    {
      name: "drapeva-auth",
      partialize: (state) => ({ user: state.user, session: state.session }),
      onRehydrateStorage: () => (state) => {
        // After localStorage rehydration completes:
        // If no user was persisted, we can immediately set loading=false.
        // If a user WAS persisted, keep loading=true until onAuthStateChange
        // fires and confirms (or invalidates) the session.
        if (state && !state.user) {
          useAuth.setState({ loading: false });
        }
      },
    },
  ),
);

// Re-export for backward compatibility
export type UserProfile = Profile;

// Module-level flag: track whether we have already performed the initial
// cart/wishlist DB sync for the current authenticated session.
let _syncedForSession = false;
// Track the auth listener subscription so we never register it twice.
let _authListenerActive = false;

/**
 * Call once at app root (providers.tsx).
 * Sets up a single Supabase auth listener that:
 *  - Updates the Zustand store on every auth event.
 *  - Triggers cart/wishlist DB sync exactly ONCE per SIGNED_IN event.
 *  - Clears store state on sign-out.
 */
export function initAuthListener() {
  if (_authListenerActive) return;
  _authListenerActive = true;

  supabase.auth.onAuthStateChange(async (event, session) => {
    const { setUser, setAuth } = useAuth.getState();

    if (session?.user) {
      // Fetch profile from DB
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setAuth(profile, {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      } else {
        // Profile not found yet (may be being created), still mark loading done
        useAuth.setState({ loading: false });
      }

      // Sync cart & wishlist ONLY on explicit sign-in (not token refresh / initial session re-load).
      // This prevents the repeated 409 errors from multiple sync calls.
      if (event === "SIGNED_IN" && !_syncedForSession) {
        _syncedForSession = true;
        try {
          const { useShop } = await import("./store");
          await useShop.getState().syncWithDatabase();
        } catch (e) {
          console.error("Error syncing shop store on sign-in:", e);
        }
      } else if (event === "INITIAL_SESSION" && !_syncedForSession) {
        // Handle browser refresh: session already exists, sync once
        _syncedForSession = true;
        try {
          const { useShop } = await import("./store");
          await useShop.getState().syncWithDatabase();
        } catch (e) {
          console.error("Error syncing shop store on initial session:", e);
        }
      }
    } else {
      // Signed out
      _syncedForSession = false;
      setUser(null);
      try {
        const { useShop } = await import("./store");
        useShop.getState().clearCart();
        useShop.getState().clearWishlist();
      } catch (e) {
        console.error("Error clearing shop store on sign-out:", e);
      }
    }
  });
}
