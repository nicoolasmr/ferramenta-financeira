
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Check } from "lucide-react";

export default function BillingPage() {
    const [subscription, setSubscription] = useState<any>(null);
    const [usage, setUsage] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function load() {
            // Get User Org (Assuming single org context for MVP or selected org)
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Mock getting first org membership
            const { data: members } = await supabase.from('organization_members').select('org_id').eq('user_id', user.id).single();
            if (!members) return; // No org
            const orgId = members.org_id;

            // Fetch Sub
            const { data: sub } = await supabase.from('subscriptions').select('*').eq('org_id', orgId).single();
            setSubscription(sub || { plan: 'starter', status: 'active' });

            // Fetch Usage
            const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
            const { data: usg } = await supabase.from('usage_events')
                .select('*')
                .eq('org_id', orgId)
                .eq('period_month', currentMonth)
                .single();
            setUsage(usg || { events_processed: 0 });

            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="p-12"><Loader2 className="animate-spin" /></div>;

    const plan = subscription?.plan || 'starter';
    const limit = plan === 'starter' ? 1000 : plan === 'pro' ? 50000 : 999999999;
    const used = usage?.events_processed || 0;
    const percentage = Math.min(100, Math.round((used / limit) * 100));

    return (
        <div className="space-y-8 max-w-4xl py-6">
            <div>
                <h1 className="text-3xl font-bold">Billing & Usage</h1>
                <p className="text-muted-foreground">Manage your plan and monitor your limits.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Current Plan: <span className="capitalize text-primary">{plan}</span></CardTitle>
                            <CardDescription>
                                {plan === 'starter' ? 'Perfect for small businesses.' : 'Growth and scale.'}
                            </CardDescription>
                        </div>
                        <Badge variant={subscription?.status === 'active' ? 'default' : 'destructive'} className="uppercase">
                            {subscription?.status || 'Active'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span>Events Processed</span>
                            <span>{used.toLocaleString()} / {limit === 999999999 ? '∞' : limit.toLocaleString()}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <p className="text-xs text-muted-foreground">Resets on the 1st of next month.</p>
                    </div>
                </CardContent>
                <CardFooter className="bg-slate-50 border-t flex justify-between items-center">
                    <div className="text-sm text-slate-500">
                        Need more volume?
                    </div>
                    {plan === 'starter' && (
                        <Button>Upgrade to Pro ($99/mo)</Button>
                    )}
                    {plan === 'pro' && (
                        <Button variant="outline">Contact Enterprise</Button>
                    )}
                </CardFooter>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3 text-slate-600">
                            <CreditCard className="w-5 h-5" />
                            <span>•••• 4242</span>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="link" className="p-0">Manage in Stripe</Button>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>April 2026</span>
                                <span className="font-bold">$0.00</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
