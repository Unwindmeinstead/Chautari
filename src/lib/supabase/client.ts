import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";

export function createClient() {
  return createBrowserClient<any>(
    getSupabaseUrl()!,
    getSupabasePublishableKey()!
  );
}
