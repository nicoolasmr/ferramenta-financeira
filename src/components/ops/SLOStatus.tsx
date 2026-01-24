
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Activity } from "lucide-react";

interface SLOProps {
    title: string;
    currentValue: string | number;
    target: string;
    status: 'healthy' | 'warning' | 'critical';
    description?: string;
}

export function SLOStatus({ title, currentValue, target, status, description }: SLOProps) {
    const colors = {
        healthy: "text-emerald-600 bg-emerald-50 border-emerald-200",
        warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
        critical: "text-red-600 bg-red-50 border-red-200"
    };

    const icons = {
        healthy: CheckCircle,
        warning: AlertTriangle,
        critical: XCircle
    };

    const Icon = icons[status];

    return (
        <Card className={`border-l-4 ${status === 'healthy' ? 'border-l-emerald-500' : status === 'warning' ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
                    <Icon className={`h-5 w-5 ${status === 'healthy' ? 'text-emerald-500' : status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-black">{currentValue}</div>
                <div className="text-xs text-muted-foreground mt-1">Target: {target}</div>
                {description && <div className="text-xs mt-2 text-slate-500">{description}</div>}
            </CardContent>
        </Card>
    );
}
