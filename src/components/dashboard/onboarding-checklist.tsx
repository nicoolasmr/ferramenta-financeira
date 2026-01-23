"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getOnboardingStatus } from "@/actions/dashboard";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface OnboardingStatus {
    hasIntegrations: boolean;
    hasCustomers: boolean;
    hasTeam: boolean;
    hasWebhooks: boolean;
}

export function OnboardingChecklist() {
    const { activeOrganization } = useOrganization();
    const [status, setStatus] = useState<OnboardingStatus | null>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for dismissal
        const dismissed = localStorage.getItem("onboarding_dismissed");
        if (dismissed === "true") {
            setIsVisible(false);
            return;
        }

        if (activeOrganization) {
            getOnboardingStatus(activeOrganization.id)
                .then(setStatus)
                .finally(() => setLoading(false));
        }
    }, [activeOrganization]);

    if (!isVisible || !status || loading) return null;

    const steps = [
        {
            key: "hasIntegrations",
            label: "Connect Integration",
            description: "Connect Stripe, Hotmart or others to sync sales.",
            href: "/app/integrations",
            done: status.hasIntegrations,
        },
        {
            key: "hasWebhooks",
            label: "Configure Webhooks",
            description: "Receive real-time data updates.",
            href: "/app/integrations", // Usually same page
            done: status.hasWebhooks,
        },
        {
            key: "hasCustomers",
            label: "Import Customers",
            description: "Bring your existing customer base.",
            href: "/app/customers/import",
            done: status.hasCustomers,
        },
        {
            key: "hasTeam",
            label: "Invite Team",
            description: "Collaborate with your teammates.",
            href: "/app/settings/team",
            done: status.hasTeam,
        },
    ];

    const completedCount = steps.filter((s) => s.done).length;
    const progress = (completedCount / steps.length) * 100;

    // Auto-dismiss if all done
    if (completedCount === steps.length) {
        return null;
    }

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem("onboarding_dismissed", "true");
    };

    return (
        <Card className="border-primary/20 bg-primary/5 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg">Getting Started</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Complete these steps to get the most out of RevenueOS.
                    </p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleDismiss} className="-mr-2 -mt-2">
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 mb-6">
                    <Progress value={progress} className="h-2" />
                    <span className="text-sm font-medium text-primary whitespace-nowrap">
                        {Math.round(progress)}% Complete
                    </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step) => (
                        <Link
                            key={step.key}
                            href={step.href}
                            className={cn(
                                "flex flex-col gap-2 p-3 rounded-lg border transition-all hover:bg-background/80",
                                step.done
                                    ? "bg-slate-50 border-slate-100 opacity-60"
                                    : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-primary/30"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span className={cn("font-semibold text-sm", step.done && "line-through text-slate-500")}>
                                    {step.label}
                                </span>
                                {step.done ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                    <Circle className="h-5 w-5 text-slate-300" />
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {step.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
