import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/common/lib/supabase/database.types";
import { readSupabasePublicEnvironment } from "@/common/lib/supabase/env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { publishableKey, url } = readSupabasePublicEnvironment();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. A future auth proxy will
          // own token refresh before protected routes switch from demo auth.
        }
      }
    }
  });
}
