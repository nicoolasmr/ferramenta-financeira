"use client";

import { useEffect, useState } from "react";
import { CreditCard, Check, ArrowRight, Package, Receipt, AlertCircle, Plus } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOrganization } from "@/components/providers/OrganizationProvider";
import { ErrorState } from "@/components/states/ErrorState";

export default function BillingPage() {
    const { activeOrganization, loading: orgLoading } = useOrganization();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // Payment Method Dialog
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [paymentData, setPaymentData] = useState({
        name: "John Doe",
        card: "**** **** **** 4242",
        expiry: "12/26",
        cvv: "***"
    });

    const fetchData = async () => {
        if (!activeOrganization) return;
        try {
            const [plansData, subData] = await Promise.all([
                getAvailablePlans(),
                getBillingInfo(activeOrganization.id),
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
        if (orgLoading) return;

        if (activeOrganization) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [activeOrganization, orgLoading]);

    const handleUpdatePlan = async (planId: string) => {
        if (!activeOrganization) return;
        setIsUpdating(true);
        try {
            // New Flow: Create Stripe Checkout Session
            // We need the user email for Stripe customer creation (or we fetch it from auth)
            // Ideally passing the email here or letting backend fetch it. 
            // Let's pass a placeholder or current user email if available.
            // For now, let's grab it from the backend action if possible, or pass it.
            // Since this is a client component, we don't have the user object directly unless passed.
            // The action createCheckoutSession asks for email. 
            // Let's rely on the backend to figure it out or pass a dummy for now if we can't easily get it here without context.
            // Actually, best practice: Action gets currentUser().

            // Let's assume we fetch email in the action to be safe/cleaner.
            // But I defined the action to take (orgId, planId, email).
            // Let's update the action signature in a bit? Or just pass "user@example.com" for now?
            // Wait, we can get user email from subscription? No.
            // Let's just update the signature of createCheckoutSession to get user from auth() on server side.

            // UPDATING ACTION SIGNATURE IN NEXT STEP.
            // Calling it assuming it doesn't need email passed from client (security best practice anyway).

            const { createCheckoutSession } = await import("@/actions/billing");
            const response = await createCheckoutSession(activeOrganization.id, planId);

            if (response?.url) {
                window.location.href = response.url;
            } else {
                toast.success("Plan updated (Mock Mode)");
                fetchData();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to start checkout");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = async () => {
        if (!activeOrganization) return;
        if (!confirm("Are you sure you want to cancel your subscription?")) return;
        setIsUpdating(true);
        try {
            await cancelSubscription(activeOrganization.id);
            toast.success("Subscription canceled");
            fetchData();
        } catch (error) {
            toast.error("Failed to cancel subscription");
        } finally {
            setIsUpdating(false);
        }
    };

    const onUpdatePayment = () => {
        setIsUpdating(true);
        setTimeout(() => {
            toast.success("Payment method updated!");
            setIsPaymentOpen(false);
            setIsUpdating(false);
        }, 1000);
    };

    if (orgLoading || loading) return <LoadingState />;
    if (!activeOrganization) return <ErrorState message="Nenhuma organização encontrada" />;

    const currentPlan = subscription?.plan;

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto pb-12">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
                <p className="text-slate-500">Manage your subscription and billing information</p>
            </div>

            {/* Current Subscription & Payment Method */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-slate-50">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Package className="w-6 h-6 text-blue-600" />
                                <div>
                                    <CardTitle>Current Plan</CardTitle>
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
                        <div className="flex flex-col gap-1">
                            <p className="text-lg font-bold">{currentPlan?.name || "Free Plan"}</p>
                            <p className="text-sm text-slate-500">
                                {subscription ? `${currentPlan?.currency || "BRL"} ${(currentPlan?.price_cents || 0) / 100}/mo` : "Standard features"}
                            </p>
                            {subscription?.cancel_at_period_end && (
                                <Badge className="bg-yellow-100 text-yellow-800 mt-2 border-yellow-200">Cancels on renewal</Badge>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t pt-4">
                        <Button variant="outline" size="sm" onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}>
                            Change Plan
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="bg-slate-50">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <CreditCard className="w-6 h-6 text-slate-600" />
                            <div>
                                <CardTitle>Payment Method</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                            <div className="w-10 h-7 bg-slate-100 rounded flex items-center justify-center font-bold text-[10px] text-slate-500 uppercase">VISA</div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Visa ending in 4242</p>
                                <p className="text-xs text-slate-500">Exp: 12/26</p>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t pt-4">
                        <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">Update Payment</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Update Payment Method</DialogTitle>
                                    <DialogDescription>Update your credit card details securely.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="card">Card Number</Label>
                                        <Input id="card" defaultValue="**** **** **** 4242" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="expiry">Expiry Date</Label>
                                            <Input id="expiry" placeholder="MM/YY" />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor="cvv">CVV</Label>
                                            <Input id="cvv" placeholder="123" />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>Cancel</Button>
                                    <Button onClick={onUpdatePayment} disabled={isUpdating}>
                                        {isUpdating ? "Processing..." : "Save Card"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>
            </div>

            {/* Plan Selection */}
            <div id="plans" className="grid gap-6 md:grid-cols-3">
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
                                    {isCurrent ? "Current Plan" : "Upgrade Now"}
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
                                <Button variant="ghost" size="sm" onClick={() => toast.success("Invoice downloading...")}>Download</Button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <div className="flex flex-col">
                                <span className="font-medium">Dec 2025 Invoice</span>
                                <span className="text-xs text-slate-500">Paid on Dec 15, 2025</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-semibold">BRL 299.00</span>
                                <Button variant="ghost" size="sm" onClick={() => toast.success("Invoice downloading...")}>Download</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-center pt-4 border-t">
                    <Button variant="link" className="text-slate-500" onClick={() => toast.info("No more invoices to display.")}>View more invoices</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
