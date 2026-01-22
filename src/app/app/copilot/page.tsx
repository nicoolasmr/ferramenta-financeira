"use client";

import { Sparkles, AlertCircle, TrendingUp, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const insights = [
    {
        id: 1,
        type: "warning",
        title: "High Churn Risk Detected",
        description: "3 customers haven't paid in 60+ days. Consider reaching out.",
        priority: "high",
        action: "View Customers",
    },
    {
        id: 2,
        type: "success",
        title: "Revenue Milestone Reached",
        description: "You've reached R$ 100k MRR this month! 🎉",
        priority: "medium",
        action: "View Report",
    },
    {
        id: 3,
        type: "info",
        title: "Integration Sync Delayed",
        description: "Stripe hasn't synced in 6 hours. Check connection.",
        priority: "medium",
        action: "Check Integration",
    },
];

export default function CopilotPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">IA Copilot</h1>
                    <p className="text-slate-500">Intelligent insights and recommendations</p>
                </div>
            </div>

            <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                    <CardTitle className="text-lg">Top 3 Actions This Week</CardTitle>
                    <CardDescription>
                        AI-powered recommendations based on your data
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {insights.map((insight) => (
                        <div
                            key={insight.id}
                            className="flex items-start justify-between p-4 bg-white rounded-lg border"
                        >
                            <div className="flex items-start gap-3 flex-1">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                    {insight.type === "warning" && (
                                        <AlertCircle className="w-4 h-4 text-orange-600" />
                                    )}
                                    {insight.type === "success" && (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    )}
                                    {insight.type === "info" && (
                                        <TrendingUp className="w-4 h-4 text-blue-600" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold">{insight.title}</h3>
                                        <Badge
                                            variant={insight.priority === "high" ? "destructive" : "secondary"}
                                            className="text-xs"
                                        >
                                            {insight.priority}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600">{insight.description}</p>
                                </div>
                            </div>
                            <Button size="sm" variant="outline">
                                {insight.action}
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
