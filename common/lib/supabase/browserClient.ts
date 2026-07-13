import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/common/lib/supabase/database.types";
import { readSupabasePublicEnvironment } from "@/common/lib/supabase/env";

let browserClient: SupabaseClient<Database> | undefined;

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const { publishableKey, url } = readSupabasePublicEnvironment();
  browserClient = createBrowserClient<Database>(url, publishableKey);
  return browserClient;
}
