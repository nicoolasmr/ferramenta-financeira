import { Suspense } from "react";
import { getIntegrations } from "@/actions/integrations";
import { createClient } from "@/lib/supabase/server";
import { IntegrationsClientPage } from "./client";
import { redirect } from "next/navigation";

export default async function IntegrationsPage() {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        redirect("/auth/login");
    }

    // Get user's organization (first one for now)
    // In a real multi-tenant app, this would come from the session or URL param
    const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .select('org_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

    if (membershipError || !membership) {
        // Handle case where user has no org (onboarding or error)
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold mb-2">Setup Required</h1>
                <p className="text-muted-foreground max-w-md mb-6">
                    You need to be part of an organization to configure integrations. Please create an organization or ask an administrator to invite you.
                </p>
                <a href="/app/onboarding" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    Create Organization
                </a>
            </div>
        );
    }

    const orgId = membership.org_id;
    const integrations = await getIntegrations(orgId);

    return (
        <Suspense fallback={<div className="p-8">Carregando integrações...</div>}>
            <IntegrationsClientPage
                initialIntegrations={integrations}
                orgId={orgId}
            />
        </Suspense>
    );
}
