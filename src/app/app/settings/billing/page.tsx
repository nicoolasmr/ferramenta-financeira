
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, Check } from "lucide-react";

export default function BillingPage() {
    // Mock data for Stabilization Pack MVP
    const plan = {
        name: "Pro Plan",
        status: "active",
        renewalDate: "2026-05-01",
        usage: {
            projects: 5,
            limitProjects: 10,
            events: 12500,
            limitEvents: 50000
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-black">Billing & Usage</h1>
                <p className="text-muted-foreground">Manage your subscription and limits.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Current Plan */}
                <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl">Current Plan</CardTitle>
                                <CardDescription>You are on the <span className="font-bold text-blue-600">{plan.name}</span></CardDescription>
                            </div>
                            <Badge className="bg-blue-600 hover:bg-blue-700">Active</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium">Everything in Starter plus:</span>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300 ml-7">
                            <li className="flex items-center gap-2"><Check className="h-3 w-3" /> advanced reconciliation</li>
                            <li className="flex items-center gap-2"><Check className="h-3 w-3" /> unlimited integrations</li>
                            <li className="flex items-center gap-2"><Check className="h-3 w-3" /> priority support</li>
                        </ul>
                        <div className="pt-4">
                            <Button className="w-full">Manage Subscription</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Usage */}
                <Card>
                    <CardHeader>
                        <CardTitle>Usage Limits</CardTitle>
                        <CardDescription>Resets on {plan.renewalDate}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Active Projects</span>
                                <span className="font-bold">{plan.usage.projects} / {plan.usage.limitProjects}</span>
                            </div>
                            <Progress value={(plan.usage.projects / plan.usage.limitProjects) * 100} />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Events Processed</span>
                                <span className="font-bold">{plan.usage.events.toLocaleString()} / {plan.usage.limitEvents.toLocaleString()}</span>
                            </div>
                            <Progress value={(plan.usage.events / plan.usage.limitEvents) * 100} />
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                            Need more volume? <a href="#" className="underline">Contact Sales</a> for Enterprise limits.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
