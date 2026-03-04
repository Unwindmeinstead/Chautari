import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRedirectPath } from "@/lib/auth-redirect";

function safeNextPath(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("/auth/")) return null;
  return raw;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedPath = safeNextPath(searchParams.get("redirectedFrom"));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ redirectTo: "/auth/login" });
  }

  const rolePath = await getUserRedirectPath(supabase, user);
  return NextResponse.json({ redirectTo: requestedPath ?? rolePath });
}
