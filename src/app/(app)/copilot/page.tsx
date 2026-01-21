'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUGGESTIONS = [
    {
        id: '1',
        type: 'churn_risk',
        priority: 'high',
        title: 'Cliente em risco de churn',
        description: 'Cliente #2847 não acessou a plataforma há 15 dias e tem histórico de reclamações.',
        action: 'Enviar email de retenção',
    },
    {
        id: '2',
        type: 'upsell',
        priority: 'medium',
        title: 'Oportunidade de upsell',
        description: 'Cliente #1923 está usando 95% do limite do plano atual.',
        action: 'Oferecer upgrade',
    },
    {
        id: '3',
        type: 'payment_retry',
        priority: 'critical',
        title: 'Pagamento falhado',
        description: '3 tentativas de cobrança falharam para Cliente #5612.',
        action: 'Tentar novo método',
    },
];

const PRIORITY_COLORS = {
    critical: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-blue-100 text-blue-700',
};

export default function CopilotPage() {
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
                        <div className="text-3xl font-bold">12</div>
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
                        <div className="text-3xl font-bold text-red-600">5</div>
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
                        <div className="text-3xl font-bold text-emerald-600">R$ 45k</div>
                        <div className="text-xs text-slate-500 mt-1">Receita recuperável</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                {SUGGESTIONS.map((suggestion) => (
                    <Card key={suggestion.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${PRIORITY_COLORS[suggestion.priority as keyof typeof PRIORITY_COLORS]}`}>
                                            {suggestion.priority}
                                        </span>
                                    </div>
                                    <CardDescription>{suggestion.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Button size="sm">{suggestion.action}</Button>
                                <Button size="sm" variant="outline">Dispensar</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
