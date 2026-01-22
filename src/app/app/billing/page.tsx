"use client";

import { useEffect, useState } from "react";
import { CreditCard, Check, ArrowRight, Package, Receipt, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LoadingState } from "@/components/states/LoadingState";
import {
    getAvailablePlans,
    getBillingInfo,
    updatePlan,
    cancelSubscription,
    type Plan,
    type Subscription,
} from "@/actions/billing";

export default function BillingPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchData = async () => {
        try {
            const [plansData, subData] = await Promise.all([
                getAvailablePlans(),
                getBillingInfo("org-1"), // Real org ID should be fetched from context
            ]);
            setPlans(plansData);
            setSubscription(subData);
        } catch (error) {
            toast.error("Failed to load billing data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdatePlan = async (planId: string) => {
        setIsUpdating(true);
        try {
            await updatePlan("org-1", planId);
            toast.success("Plan updated successfully!");
            fetchData();
        } catch (error) {
            toast.error("Failed to update plan");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel your subscription?")) return;
        setIsUpdating(true);
        try {
            await cancelSubscription("org-1");
            toast.success("Subscription canceled");
            fetchData();
        } catch (error) {
            toast.error("Failed to cancel subscription");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return <LoadingState />;

    const currentPlan = subscription?.plan;

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
                <p className="text-slate-500">Manage your subscription and billing information</p>
            </div>

            {/* Current Subscription */}
            <Card className="bg-slate-50">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Package className="w-6 h-6 text-blue-600" />
                            <div>
                                <CardTitle>Current Plan</CardTitle>
                                <CardDescription>
                                    Your organization is currently on the <strong>{currentPlan?.name || "Free"}</strong> plan.
                                </CardDescription>
                            </div>
                        </div>
                        {subscription && (
                            <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                                {subscription.status.toUpperCase()}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {subscription ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-8 py-2">
                                <div>
                                    <p className="text-sm text-slate-500">Amount</p>
                                    <p className="text-lg font-semibold">
                                        {currentPlan?.currency || "BRL"} {(currentPlan?.price_cents || 0) / 100}/mo
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Current Period End</p>
                                    <p className="text-lg font-semibold">
                                        {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "N/A"}
                                    </p>
                                </div>
                            </div>
                            {subscription.cancel_at_period_end && (
                                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    Subscription will be canceled at the end of the current period.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 border border-dashed rounded-lg text-center text-slate-500">
                            You don't have an active subscription. Choose a plan below to get started.
                        </div>
                    )}
                </CardContent>
                {subscription && !subscription.cancel_at_period_end && (
                    <CardFooter className="flex justify-end gap-2 border-t pt-4">
                        <Button variant="outline" size="sm" onClick={handleCancel} disabled={isUpdating}>
                            Cancel Subscription
                        </Button>
                        <Button size="sm" onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}>
                            Upgrade Plan
                        </Button>
                    </CardFooter>
                )}
            </Card>

            {/* Plan Selection */}
            <div className="grid gap-6 md:grid-cols-3">
                {plans.length === 0 ? (
                    <div className="col-span-3 text-center py-12 text-slate-500">
                        No plans available. Please contact support.
                    </div>
                ) : plans.map((plan) => {
                    const isCurrent = plan.id === subscription?.plan_id;
                    return (
                        <Card key={plan.id} className={`flex flex-col ${isCurrent ? 'ring-2 ring-blue-600 border-blue-600' : ''}`}>
                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription>
                                    <span className="text-3xl font-bold text-slate-900">
                                        {plan.currency} {plan.price_cents / 100}
                                    </span>
                                    /mo
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-4">
                                <div className="space-y-2">
                                    {Object.entries(plan.features || {}).map(([key, value]: [any, any]) => (
                                        <div key={key} className="flex items-center gap-2 text-sm text-slate-600">
                                            <Check className="w-4 h-4 text-green-500" />
                                            {String(value)}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={isCurrent ? "secondary" : "default"}
                                    disabled={isCurrent || isUpdating}
                                    onClick={() => handleUpdatePlan(plan.id)}
                                >
                                    {isCurrent ? "Current Plan" : "Choose Plan"}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            {/* Billing History */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Receipt className="w-6 h-6 text-slate-600" />
                        <div>
                            <CardTitle>Billing History</CardTitle>
                            <CardDescription>View and download your past invoices</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="divide-y">
                        <div className="flex items-center justify-between py-3">
                            <div className="flex flex-col">
                                <span className="font-medium">Jan 2026 Invoice</span>
                                <span className="text-xs text-slate-500">Paid on Jan 15, 2026</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-semibold">BRL 299.00</span>
                                <Button variant="ghost" size="sm">Download</Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div className="flex flex-col">
                                <span className="font-medium">Dec 2025 Invoice</span>
                                <span className="text-xs text-slate-500">Paid on Dec 15, 2025</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-semibold">BRL 299.00</span>
                                <Button variant="ghost" size="sm">Download</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-center pt-4 border-t">
                    <Button variant="link" className="text-slate-500">View more invoices</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
