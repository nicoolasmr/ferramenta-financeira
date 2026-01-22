"use client";

import { useEffect, useState } from "react";
import { Sparkles, X, Check, AlertTriangle, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState } from "@/components/states/LoadingState";
import {
    getCopilotSuggestions,
    dismissSuggestion,
    markSuggestionComplete,
    type CopilotSuggestion,
} from "@/actions/copilot";
import { toast } from "sonner";

const PRIORITY_COLORS = {
    high: "border-red-200 bg-red-50",
    medium: "border-yellow-200 bg-yellow-50",
    low: "border-blue-200 bg-blue-50",
};

const PRIORITY_BADGES = {
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
    const [suggestions, setSuggestions] = useState<CopilotSuggestion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCopilotSuggestions("org-1")
            .then(setSuggestions)
            .catch(() => toast.error("Failed to load suggestions"))
            .finally(() => setLoading(false));
    }, []);

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

    if (loading) return <LoadingState />;

    const topSuggestions = suggestions.slice(0, 3);

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-8 h-8" />
                    <h1 className="text-3xl font-bold">IA Copilot</h1>
                </div>
                <p className="text-purple-100">
                    AI-powered insights and recommendations to optimize your revenue operations
                </p>
            </div>

            {/* Top 3 Actions */}
            {topSuggestions.length > 0 && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Top 3 Recommended Actions</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        {topSuggestions.map((suggestion) => {
                            const Icon = ICONS[suggestion.category as keyof typeof ICONS] || ICONS.default;
                            return (
                                <Card key={suggestion.id} className={PRIORITY_COLORS[suggestion.priority]}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <Icon className="w-5 h-5" />
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_BADGES[suggestion.priority]
                                                    }`}
                                            >
                                                {suggestion.priority}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <h3 className="font-semibold mb-2">{suggestion.title}</h3>
                                        <p className="text-sm text-slate-600 mb-4">{suggestion.description}</p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleComplete(suggestion.id)}
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Done
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDismiss(suggestion.id)}
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Dismiss
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
                                                            className={`px-2 py-1 rounded text-xs font-medium ${PRIORITY_BADGES[suggestion.priority]
                                                                }`}
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
