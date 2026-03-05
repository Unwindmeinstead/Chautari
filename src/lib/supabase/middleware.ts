import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getUserRedirectPath } from "@/lib/auth-redirect";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export const VIEW_AS_COOKIE = "chautari_view_as";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const { pathname } = request.nextUrl;

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

  const isAuthPage = pathname.startsWith("/auth/");
  const shouldTreatAsPublic = isPublicRoute || isAuthPage;

  const supabaseUrl = getSupabaseUrl();
  const supabaseKey = getSupabasePublishableKey();

  const keyIsValid = supabaseKey?.startsWith("eyJ") || supabaseKey?.startsWith("sb_publishable_");
  if (!supabaseUrl || !supabaseKey || !keyIsValid) {
    if (shouldTreatAsPublic) return supabaseResponse;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = createServerClient<any>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options as any)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  function redirectWithSession(destination: URL): NextResponse {
    const redirectResponse = NextResponse.redirect(destination);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  if (!user && !shouldTreatAsPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return redirectWithSession(redirectUrl);
  }

  if (user) {
    const correctDashboard = await getUserRedirectPath(supabase, user);
    const isAdmin = correctDashboard === "/admin";

    // ── View As (admin preview mode) ─────────────────────────────────────────
    // If the user is an admin and has the view-as cookie set, let them browse
    // patient or agency dashboards freely without being bounced back to /admin.
    const viewAs = request.cookies.get(VIEW_AS_COOKIE)?.value;
    if (isAdmin && viewAs && viewAs !== "admin") {
      // Allow admin to access the target role's routes freely
      // Only block them from /admin while previewing (so they must use the banner to return)
      if (pathname.startsWith("/admin")) {
        // Clear the cookie and send to admin
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/admin";
        const res = redirectWithSession(redirectUrl);
        res.cookies.delete(VIEW_AS_COOKIE);
        return res;
      }
      // Otherwise let them through to whatever route they're viewing
      return supabaseResponse;
    }
    // ── End View As ───────────────────────────────────────────────────────────

    if (pathname.startsWith("/auth/")) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = correctDashboard;
      return redirectWithSession(redirectUrl);
    }

    const isAdminRoute = pathname.startsWith("/admin");
    const isAgencyRoute = pathname.startsWith("/agency");
    const isAgency = correctDashboard === "/agency/dashboard";

    if (isAdminRoute && !isAdmin) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = correctDashboard;
      return redirectWithSession(redirectUrl);
    }

    if (isAgencyRoute && !isAgency && !isAdmin) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = correctDashboard;
      return redirectWithSession(redirectUrl);
    }
  }

  return supabaseResponse;
}
