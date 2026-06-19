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
  initialize: () => Promise<void>;
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
        set({ user: null, session: null });
      },
      isAuthenticated: () => !!get().user,
      isAdmin: () => get().user?.role === "admin",
      initialize: async () => {
        set({ loading: true });
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          set({
            user: profile || null,
            session: { access_token: session.access_token, refresh_token: session.refresh_token },
            loading: false,
          });
        } else {
          set({ user: null, session: null, loading: false });
        }
      },
    }),
    {
      name: "drapeva-auth",
      partialize: (state) => ({ user: state.user, session: state.session }),
    }
  )
);

// Re-export for backward compatibility
export type UserProfile = Profile;

// Listen for auth changes (call once at app root)
export function initAuthListener() {
  supabase.auth.onAuthStateChange(async (event, session) => {
    const { setUser, setAuth } = useAuth.getState();
    if (session?.user) {
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
      }
    } else {
      setUser(null);
    }
  });
}
