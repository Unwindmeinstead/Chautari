import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getUserRedirectPath } from "@/lib/auth-redirect";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

// ⚠️  TEMPORARY: Set to true to bypass all auth checks while debugging.
//    Flip back to false before deploying with real auth.
const BYPASS_AUTH = true;

export async function updateSession(request: NextRequest) {
  // Short-circuit: let every request through with no auth check.
  if (BYPASS_AUTH) {
    return NextResponse.next({ request });
  }

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

  // Protected route handling
  if (!user && !shouldTreatAsPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If logged in and visiting auth pages, redirect by role
  if (user && pathname.startsWith("/auth/")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = await getUserRedirectPath(supabase, user);
    return NextResponse.redirect(redirectUrl);
  }

  // If logged in, enforce role-based dashboard access on page refresh
  // This ensures that if a user's role changes, the next page load redirects them correctly.
  if (user) {
    const correctDashboard = await getUserRedirectPath(supabase, user);

    // If patient visits /agency/ or /admin/ — send to their dashboard
    const isAdminRoute = pathname.startsWith("/admin");
    const isAgencyRoute = pathname.startsWith("/agency");
    const isPatientRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding") || pathname.startsWith("/profile") || pathname.startsWith("/switch") || pathname.startsWith("/notifications");

    const isAdmin = correctDashboard === "/admin";
    const isAgency = correctDashboard === "/agency/dashboard";
    const isPatient = !isAdmin && !isAgency;

    // Prevent non-admins from accessing /admin/*
    if (isAdminRoute && !isAdmin) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = correctDashboard;
      return NextResponse.redirect(redirectUrl);
    }

    // Prevent non-agency users from accessing /agency/*
    if (isAgencyRoute && !isAgency) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = correctDashboard;
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}
