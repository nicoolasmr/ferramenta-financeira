import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ManualSaleForm } from "@/components/sales/manual-sale-form";

export default async function NewSalePage({ searchParams }: { searchParams: Promise<{ org: string }> }) {
    const orgId = (await searchParams).org;
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
