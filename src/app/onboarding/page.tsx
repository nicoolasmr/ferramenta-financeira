
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Rocket, Zap, Database } from "lucide-react";
import { seedDemoData } from "@/actions/demo/seed"; // We will create this
import { createClient } from "@/lib/supabase/client";

const STEPS = [
    { id: 'welcome', title: "Welcome to RevenueOS" },
    { id: 'connect', title: "Connect Revenue Source" },
    { id: 'processing', title: "Analyzing Data..." },
    { id: 'ready', title: "Your Financial Clarity" }
];

export default function OnboardingWizard() {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    async function handleDemo() {
        setLoading(true);
        // Call Server Action to seed data
        try {
            await seedDemoData();
            setStep(2); // Move to processing
            // Simulate processing time for UX "Wow"
            setTimeout(() => setStep(3), 2500);
        } catch (e) {
            console.error(e);
            alert("Failed to seed demo.");
            setLoading(false);
        }
    }

    async function handleSkipConnect() {
        // Just move to dashboard empty
        router.push('/app/dashboard');
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-lg shadow-xl border-t-4 border-t-primary">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{STEPS[step].title}</CardTitle>
                    <CardDescription>Step {step + 1} of 4</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                    {step === 0 && (
                        <div className="space-y-4 text-center">
                            <Rocket className="w-12 h-12 mx-auto text-primary" />
                            <p className="text-muted-foreground">
                                You are minutes away from full financial clarity.
                                We will unify your payment gateways into a single source of truth.
                            </p>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="grid grid-cols-1 gap-4">
                            <Button variant="outline" className="h-20 justify-start px-6 gap-4" onClick={() => router.push('/app/settings/integrations/new')}>
                                <Zap className="w-6 h-6 text-yellow-500" />
                                <div className="text-left">
                                    <div className="font-bold">Connect Real Data</div>
                                    <div className="text-xs text-muted-foreground">Stripe, Hotmart, Asaas...</div>
                                </div>
                            </Button>
                            <Button variant="secondary" className="h-20 justify-start px-6 gap-4" onClick={handleDemo} disabled={loading}>
                                <Database className="w-6 h-6 text-blue-500" />
                                <div className="text-left">
                                    <div className="font-bold">Use Demo Data</div>
                                    <div className="text-xs text-muted-foreground">See how it works instantly.</div>
                                </div>
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="text-center py-8 space-y-4">
                            <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                            <p className="text-lg font-medium animate-pulse">Standardizing transactions...</p>
                            <p className="text-sm text-muted-foreground">Calculating overdue receivables...</p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center space-y-4">
                            <div className="text-4xl font-black text-emerald-600">R$ 45.200,00</div>
                            <p className="text-muted-foreground">Potential revenue found in overdue payments.</p>
                        </div>
                    )}

                </CardContent>
                <CardFooter className="flex justify-between">
                    {step === 0 && <Button className="w-full" onClick={() => setStep(1)}>Get Started</Button>}
                    {step === 3 && <Button className="w-full" onClick={() => router.push('/app/dashboard')}>Go to Dashboard</Button>}
                </CardFooter>
            </Card>
        </div>
    );
}
