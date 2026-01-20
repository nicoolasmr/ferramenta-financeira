"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Zap, Check } from "lucide-react";

export default function BillingPage() {
    return (
        <div className="container py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
                <p className="text-muted-foreground">Manage your subscription and limits.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-yellow-500" />
                            Current Plan
                        </CardTitle>
                        <CardDescription>You are on the <span className="font-semibold text-foreground">Pro Plan</span></CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-2xl font-bold">R$ 299<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                        <Button className="w-full">Manage Subscription (Stripe)</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Usage Limits</CardTitle>
                        <CardDescription>Your consumption this month.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Projects</span>
                                <span className="font-mono">3 / 10</span>
                            </div>
                            <Progress value={30} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Users</span>
                                <span className="font-mono">2 / 5</span>
                            </div>
                            <Progress value={40} />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Processed Events</span>
                                <span className="font-mono">850 / 5000</span>
                            </div>
                            <Progress value={17} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="pt-8">
                <h3 className="text-xl font-semibold mb-4">Available Plans</h3>
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Starter */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Starter</CardTitle>
                            <CardDescription>For individuals.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-2xl font-bold">R$ 97<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                            <ul className="space-y-2 text-sm">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> 3 Projects</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> 1 User</li>
                            </ul>
                            <Button variant="outline" className="w-full">Downgrade</Button>
                        </CardContent>
                    </Card>

                    {/* Pro */}
                    <Card className="border-primary bg-primary/5">
                        <CardHeader>
                            <CardTitle>Pro</CardTitle>
                            <CardDescription>For growing businesses.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-2xl font-bold">R$ 299<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                            <ul className="space-y-2 text-sm">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> 10 Projects</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> 5 Users</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Advanced Integrations</li>
                            </ul>
                            <Button className="w-full" disabled>Current Plan</Button>
                        </CardContent>
                    </Card>

                    {/* Agency */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Agency</CardTitle>
                            <CardDescription>Scale without limits.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-2xl font-bold">R$ 997<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                            <ul className="space-y-2 text-sm">
                                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Unlimited Projects</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Unlimited Users</li>
                                <li className="flex gap-2"><Check className="w-4 h-4 text-green-500" /> Priority Support</li>
                            </ul>
                            <Button variant="outline" className="w-full">Upgrade</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
