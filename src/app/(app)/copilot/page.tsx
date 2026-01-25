import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Sparkles, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { getActiveOrganization } from "@/actions/organization";
import { getCopilotSuggestions } from "@/actions/copilot";
import { CopilotList } from "./CopilotList";
import { redirect } from 'next/navigation';

export const dynamic = "force-dynamic";

export default async function CopilotPage() {
    const org = await getActiveOrganization();
    if (!org) redirect("/app/onboarding");

    const suggestions = await getCopilotSuggestions(org.id);

    // Calculate Summary Metrics from suggestions (simple counts for now)
    const opportunityCount = suggestions.filter(s => s.priority !== 'critical' && s.priority !== 'high').length;
    const riskCount = suggestions.filter(s => s.priority === 'critical' || s.priority === 'high').length;

    return (
        <div className="container mx-auto py-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-purple-600" />
                    IA Copilot
                </h1>
                <p className="text-slate-600 mt-2">
                    Sugestões inteligentes para otimizar sua receita.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Oportunidades
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{opportunityCount}</div>
                        <div className="text-xs text-slate-500 mt-1">Ações recomendadas</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Riscos
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">{riskCount}</div>
                        <div className="text-xs text-slate-500 mt-1">Clientes em risco</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Potencial
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-600">--</div>
                        <div className="text-xs text-slate-500 mt-1">Em análise</div>
                    </CardContent>
                </Card>
            </div>

            <CopilotList initialSuggestions={suggestions} />
        </div>
    );
}
