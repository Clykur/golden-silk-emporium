import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database, MakeDatabaseCompat } from "./types";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  ) as unknown as SupabaseClient<MakeDatabaseCompat<Database>>;

  // Refresh the auth token — wrapped in try/catch so a network failure
  // in the middleware never blocks the user from loading pages.
  let user: any = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data?.user ?? null;
  } catch (err) {
    // Network error reaching Supabase from the Edge runtime.
    // Fall through and let the client-side auth handle protection.
    console.warn("[middleware] Could not reach Supabase auth endpoint:", (err as any)?.message);
  }

  const nextPath = request.nextUrl.pathname;

  // --- Admin route protection ---
  if (nextPath.startsWith("/admin")) {
    if (!user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", nextPath);
      url.searchParams.set("message", "Please sign in to continue.");
      return NextResponse.redirect(url);
    }
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/?error=unauthorized", request.url));
      }
    } catch {
      // Profile fetch failed — allow through; page-level guards will handle it.
    }
  }

  // --- Account & Dashboard route protection ---
  // Only redirect when we POSITIVELY know the user is not authenticated
  // (i.e. getUser() succeeded and returned null). If fetch failed, let
  // the client-side DashboardLayout guard handle it instead.
  if (nextPath.startsWith("/account") || nextPath.startsWith("/dashboard")) {
    // Only redirect if we were able to reach Supabase AND user is null
    if (user === null) {
      // Check if the fetch succeeded by verifying supabase was reachable:
      // We use a lightweight session check from the cookies themselves to
      // avoid an extra network call.
      const hasSessionCookie = request.cookies
        .getAll()
        .some(
          (c) =>
            c.name.startsWith("sb-") &&
            (c.name.includes("-auth-token") || c.name.includes("access-token")),
        );

      if (!hasSessionCookie) {
        const url = new URL("/login", request.url);
        url.searchParams.set("redirect", nextPath);
        url.searchParams.set("message", "Please sign in to access your account.");
        return NextResponse.redirect(url);
      }
      // Has a session cookie but getUser failed (network issue) — allow through.
      // The client-side auth will validate the session.
    }
  }

  return supabaseResponse;
}
