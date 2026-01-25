
import { createClient } from "@supabase/supabase-js";

/**
 * Service Role Client
 * Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS and Auth context.
 * WARNING: Use only in secure backend contexts (background jobs, cron, webhooks).
 */
export function createServiceClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Fallback ONLY for dev if Service Role missing, but ideally strict

    // In prod, ensure SERVICE_ROLE is set.
    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
