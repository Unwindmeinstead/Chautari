import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRedirectPath } from "@/lib/auth-redirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      const roleDefault = user ? await getUserRedirectPath(supabase, user) : "/profile";
      const destination = next && next.startsWith("/") ? next : roleDefault;
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?message=auth-error`);
}
