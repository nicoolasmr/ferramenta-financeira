"use client";

import { useEffect, useState } from "react";
import { Sparkles, X, Check, AlertTriangle, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/states/LoadingState";
import { ErrorState } from "@/components/states/ErrorState";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import {
    getCopilotSuggestions,
    dismissSuggestion,
    markSuggestionComplete,
    type CopilotSuggestion,
} from "@/actions/copilot";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS = {
    critical: "border-red-500 bg-red-50",
    high: "border-red-200 bg-red-50",
    medium: "border-yellow-200 bg-yellow-50",
    low: "border-blue-200 bg-blue-50",
};

const PRIORITY_BADGES = {
    critical: "bg-red-600 text-white",
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-blue-100 text-blue-700",
};

const ICONS = {
    churn: AlertTriangle,
    revenue: TrendingUp,
    team: Users,
    default: Sparkles,
};

export default function CopilotPage() {
    const { activeOrganization, loading: orgLoading } = useOrganization();
    const [suggestions, setSuggestions] = useState<CopilotSuggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadSuggestions = async () => {
        if (!activeOrganization) return;
        setRefreshing(true);
        try {
            const data = await getCopilotSuggestions(activeOrganization.id);
            setSuggestions(data);
        } catch (error) {
            toast.error("Failed to load suggestions");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadSuggestions();
    }, [activeOrganization]);

    const handleDismiss = async (id: string) => {
        try {
            await dismissSuggestion(id);
            setSuggestions((prev) => prev.filter((s) => s.id !== id));
            toast.success("Suggestion dismissed");
        } catch (error) {
            toast.error("Failed to dismiss suggestion");
        }
    };

    const handleComplete = async (id: string) => {
        try {
            await markSuggestionComplete(id);
            setSuggestions((prev) => prev.filter((s) => s.id !== id));
            toast.success("Marked as complete!");
        } catch (error) {
            toast.error("Failed to mark as complete");
        }
    };

    if (orgLoading || loading) return <LoadingState />;
    if (!activeOrganization) return <ErrorState message="Nenhuma organização encontrada" />;

    const topSuggestions = suggestions.slice(0, 3);
    const hasHighPriority = suggestions.some(s => s.priority === 'high' || s.priority === 'critical');

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-8 text-white shadow-lg border border-white/10">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                <Sparkles className="w-8 h-8 text-yellow-300" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">AI Copilot 2.0</h1>
                        </div>
                        <p className="text-indigo-100 max-w-xl text-lg leading-relaxed">
                            Inteligência proativa monitorando seu faturamento em tempo real.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full backdrop-blur-md border border-white/20 mb-2">
                                <div className={cn("w-2 h-2 rounded-full", hasHighPriority ? "bg-red-400 animate-pulse" : "bg-green-400")} />
                                <span className="text-xs font-semibold uppercase tracking-wider">Status: {hasHighPriority ? "Atenção" : "Saudável"}</span>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="bg-white/20 hover:bg-white/30 border-white/10 text-white backdrop-blur-sm"
                                onClick={loadSuggestions}
                                disabled={refreshing}
                            >
                                <TrendingUp className={cn("w-4 h-4 mr-2", refreshing && "animate-spin")} />
                                {refreshing ? "Analisando..." : "Atualizar Análise"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full -ml-32 -mb-32 blur-3xl" />
            </div>

            {/* Top 3 Actions */}
            {topSuggestions.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        Próximos Passos Recomendados
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">Top 3</span>
                    </h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        {topSuggestions.map((suggestion) => {
                            const Icon = ICONS[suggestion.category as keyof typeof ICONS] || ICONS.default;
                            return (
                                <Card key={suggestion.id} className={cn(
                                    "transition-all hover:shadow-md border-2",
                                    suggestion.priority === 'high' ? "border-red-100 bg-red-50/50" : "border-slate-100"
                                )}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className={cn(
                                                "p-2 rounded-lg",
                                                PRIORITY_BADGES[suggestion.priority]
                                            )}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span
                                                className={cn(
                                                    "px-2 py-1 rounded text-xs font-bold uppercase tracking-wider",
                                                    PRIORITY_BADGES[suggestion.priority]
                                                )}
                                            >
                                                {suggestion.priority}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <h3 className="font-bold mb-2 text-slate-900">{suggestion.title}</h3>
                                        <p className="text-sm text-slate-600 mb-6 leading-relaxed">{suggestion.description}</p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                className="flex-1 bg-primary hover:bg-primary/90"
                                                size="sm"
                                                onClick={() => handleComplete(suggestion.id)}
                                            >
                                                <Check className="h-4 w-4 mr-2" />
                                                Concluir
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-slate-400 hover:text-slate-600"
                                                onClick={() => handleDismiss(suggestion.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* All Suggestions */}
            {suggestions.length > 3 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">All Suggestions ({suggestions.length})</h2>
                    <div className="grid gap-4">
                        {suggestions.slice(3).map((suggestion) => {
                            const Icon = ICONS[suggestion.category as keyof typeof ICONS] || ICONS.default;
                            return (
                                <Card key={suggestion.id}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4 flex-1">
                                                <Icon className="w-5 h-5 mt-1" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold">{suggestion.title}</h3>
                                                        <span
                                                            className={cn(
                                                                "px-2 py-1 rounded text-xs font-medium",
                                                                PRIORITY_BADGES[suggestion.priority]
                                                            )}
                                                        >
                                                            {suggestion.priority}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600">{suggestion.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleComplete(suggestion.id)}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDismiss(suggestion.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {suggestions.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                        <h3 className="text-lg font-semibold mb-2">No suggestions at the moment</h3>
                        <p className="text-slate-500">
                            Your AI Copilot is analyzing your data. Check back soon for personalized recommendations.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
