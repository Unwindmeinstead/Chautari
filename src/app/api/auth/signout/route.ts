import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  // Next.js prefetches <Link> hrefs as RSC requests on page load.
  // If this endpoint is linked via <Link>, those prefetches would sign the
  // user out silently. Detect and ignore RSC prefetch requests.
  const isRscPrefetch =
    request.nextUrl.searchParams.has("_rsc") ||
    request.headers.get("RSC") === "1" ||
    request.headers.get("Next-Router-Prefetch") === "1";

  if (isRscPrefetch) {
    return new NextResponse(null, { status: 204 });
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  // Redirect back to the same origin so it works on any domain
  // (localhost, Vercel preview URLs, production, etc.)
  const origin = request.nextUrl.origin;
  return NextResponse.redirect(new URL("/", origin));
}
