"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CopilotSuggestion, dismissSuggestion, markSuggestionComplete } from '@/actions/copilot';
import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCheck, X } from 'lucide-react';

export function CopilotList({ initialSuggestions }: { initialSuggestions: CopilotSuggestion[] }) {
    const [suggestions, setSuggestions] = useState(initialSuggestions);

    const handleDismiss = async (id: string) => {
        // Optimistic update
        setSuggestions(prev => prev.filter(s => s.id !== id));
        try {
            await dismissSuggestion(id);
            toast.success("Sugestão dispensada.");
        } catch (e) {
            toast.error("Erro ao dispensar sugestão.");
            // Revert would happen if we re-fetched, but for MVP simpler is ok
        }
    };

    const handleComplete = async (id: string, actionUrl?: string) => {
        setSuggestions(prev => prev.filter(s => s.id !== id));
        try {
            await markSuggestionComplete(id);
            if (actionUrl) {
                toast.success("Redirecionando para ação...");
                window.location.href = actionUrl;
            } else {
                toast.success("Ação concluída!");
            }
        } catch (e) {
            toast.error("Erro ao completar ação.");
        }
    };

    const PRIORITY_COLORS = {
        critical: 'bg-red-100 text-red-700',
        high: 'bg-orange-100 text-orange-700',
        medium: 'bg-yellow-100 text-yellow-700',
        low: 'bg-blue-100 text-blue-700',
    };

    if (suggestions.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500">Nenhuma sugestão nova no momento. Bom trabalho! 🎉</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {suggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${PRIORITY_COLORS[suggestion.priority as keyof typeof PRIORITY_COLORS] || 'bg-slate-100'}`}>
                                        {suggestion.priority}
                                    </span>
                                </div>
                                <CardDescription>{suggestion.description}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleComplete(suggestion.id, suggestion.action_url)}>
                                <CheckCheck className="w-4 h-4 mr-2" />
                                {suggestion.category === 'revenue' ? 'Ver Detalhes' : 'Resolver'}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDismiss(suggestion.id)}>
                                <X className="w-4 h-4 mr-2" />
                                Dispensar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
