import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ManualSaleForm } from "@/components/sales/manual-sale-form";
import { getActiveOrganization } from "@/actions/organization";

export default async function NewSalePage({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
    const params = await searchParams;
    let orgId = params.org;

    if (!orgId) {
        const activeOrg = await getActiveOrganization();
        orgId = activeOrg?.id;
    }

    if (!orgId) {
        return (
            <div className="flex-1 p-8">
                <p className="text-red-500 font-medium">Organization not found. Please select an organization first.</p>
            </div>
        );
    }

    const supabase = await createClient();

    const { data: projects } = await supabase
        .from("projects")
        .select("id, name")
        .eq("org_id", orgId);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Nova Venda Manual</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Detalhes da Venda</CardTitle>
                        <CardDescription>
                            Lance vendas feitas fora das integrações automáticas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ManualSaleForm orgId={orgId} projects={projects || []} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
