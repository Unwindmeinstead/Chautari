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

  return supabaseResponse;
}
