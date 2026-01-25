import { createClient } from '@supabase/supabase-js';

export const getAdminClient = () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey || serviceRoleKey === 'placeholder-key') {
        console.error("FATAL: SUPABASE_SERVICE_ROLE_KEY is missing/invalid.");
        return null;
    }

    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
};
