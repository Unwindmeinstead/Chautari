import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export function createClient() {
  return createBrowserClient(
    getSupabaseUrl()!,
    getSupabasePublishableKey()!,
    {
      cookies: {
        getAll() {
          if (typeof document === "undefined") return [];
          return document.cookie.split(";").map((c) => {
            const [name, ...v] = c.trim().split("=");
            return { name, value: v.join("=") };
          });
        },
        setAll(cookiesToSet) {
          if (typeof document === "undefined") return;
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = `${name}=${value}; path=${options?.path || "/"}; max-age=${options?.maxAge || 31536000}; sameSite=${options?.sameSite || "lax"}${options?.secure ? "; secure" : ""}`;
          });
        },
      },
    }
  );
}
