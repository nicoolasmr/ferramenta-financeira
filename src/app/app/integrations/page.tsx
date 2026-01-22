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
            <div className="p-8">
                <h1 className="text-2xl font-bold">Acesso restrito</h1>
                <p className="text-muted-foreground">Você precisa pertencer a uma organização para acessar integrações.</p>
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
