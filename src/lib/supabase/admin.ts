import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com service_role — NUNCA expor ao browser.
 * Usar exclusivamente em Server Actions e Route Handlers.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
