import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl()!,
    getSupabasePublishableKey()!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, any> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                path: options?.path || "/",
                maxAge: options?.maxAge || 60 * 60 * 24 * 7,
                sameSite: options?.sameSite || "lax",
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
              });
            });
          } catch {
            // Server component - cookies set in middleware
          }
        },
      },
    }
  );
}
