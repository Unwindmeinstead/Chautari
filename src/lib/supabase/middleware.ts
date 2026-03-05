import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getUserRedirectPath } from "@/lib/auth-redirect";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { pathname } = request.nextUrl;

  // Public routes that don't need auth
  const publicRoutePrefixes = [
    "/",
    "/auth/",
    "/agencies",
    "/wages",
    "/submit-wages",
    "/compare",
    "/privacy",
    "/terms",
    "/hipaa",
  ];
  const isPublicRoute = publicRoutePrefixes.some((route) =>
    route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(`${route}/`)
  );

  // Keep all auth pages public
  const isAuthPage = pathname.startsWith("/auth/");
  const shouldTreatAsPublic = isPublicRoute || isAuthPage;

  // If Supabase credentials are missing, allow public routes through
  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabasePublishableKey();

  if (!supabaseUrl || !supabaseKey || !supabaseKey.startsWith("eyJ")) {
    if (shouldTreatAsPublic) {
      return supabaseResponse;
    }
    // Protected routes can't work without auth — redirect to login
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = createServerClient<any>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Helper: redirect while preserving any refreshed session cookies.
  // Without this, a token refresh that happened during getUser() above is
  // silently discarded — the browser never gets the new tokens — and the
  // next request looks unauthenticated, causing the sign-out loop.
  function redirectWithSession(destination: URL): NextResponse {
    const redirectResponse = NextResponse.redirect(destination);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  // Protected route handling
  if (!user && !shouldTreatAsPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return redirectWithSession(redirectUrl);
  }

  // For authenticated users, resolve their role once and reuse it below.
  // Previously getUserRedirectPath was called twice per request (two DB round-trips).
  if (user) {
    const correctDashboard = await getUserRedirectPath(supabase, user);

    // If logged in and visiting an auth page, send to their dashboard
    if (pathname.startsWith("/auth/")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = correctDashboard;
      return redirectWithSession(redirectUrl);
    }

    const isAdminRoute = pathname.startsWith("/admin");
    const isAgencyRoute = pathname.startsWith("/agency");

    const isAdmin = correctDashboard === "/admin";
    const isAgency = correctDashboard === "/agency/dashboard";

    // Prevent non-admins from accessing /admin/*
    if (isAdminRoute && !isAdmin) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = correctDashboard;
      return redirectWithSession(redirectUrl);
    }

    // Prevent non-agency users from accessing /agency/*
    if (isAgencyRoute && !isAgency) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = correctDashboard;
      return redirectWithSession(redirectUrl);
    }
  }

  return supabaseResponse;
}
