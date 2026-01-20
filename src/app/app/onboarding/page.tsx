"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { completeOnboarding } from "./actions"; // Need to create this
import { CheckCircle2, Rocket } from "lucide-react";

export default function OnboardingPage() {
    const [step, setStep] = useState(1);

    // Simple state management for the wizard steps
    // In a real app, use React Hook Form + Zod
    const [formData, setFormData] = useState({
        orgName: "",
        orgSlug: "",
        projectName: "",
        planCode: "starter"
    });

    const handleNext = () => setStep(s => s + 1);
    const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Rocket className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">step {step} of 3</span>
                    </div>
                    <CardTitle className="text-2xl">
                        {step === 1 && "Start your Organization"}
                        {step === 2 && "Choose your Plan"}
                        {step === 3 && "Create your First Project"}
                    </CardTitle>
                    <CardDescription>
                        Let&apos;s get your workspace ready for business.
                    </CardDescription>
                </CardHeader>

                <form action={completeOnboarding as any}>
                    <CardContent className="space-y-4">
                        {step === 1 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Organization Name</Label>
                                    <Input name="orgName" placeholder="Acme Corp" value={formData.orgName} onChange={handleChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Workspace URL</Label>
                                    <div className="flex items-center">
                                        <span className="bg-slate-100 border border-r-0 rounded-l-md px-3 py-2 text-sm text-muted-foreground">app.revenueos.com/</span>
                                        <Input className="rounded-l-none" name="orgSlug" placeholder="acme" value={formData.orgSlug} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="grid gap-4">
                                {['starter', 'pro', 'agency'].map((plan) => (
                                    <div key={plan}
                                        className={`border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors ${formData.planCode === plan ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
                                        onClick={() => setFormData({ ...formData, planCode: plan })}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold capitalize">{plan}</span>
                                            {formData.planCode === plan && <CheckCircle2 className="w-4 h-4 text-primary" />}
                                        </div>
                                        <input type="radio" name="planCode" value={plan} className="hidden" checked={formData.planCode === plan} readOnly />
                                    </div>
                                ))}
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>First Project Name</Label>
                                    <Input name="projectName" placeholder="My First Product Launch" value={formData.projectName} onChange={handleChange} required />
                                </div>
                                {/* Hidden fields to pass state from previous steps */}
                                <input type="hidden" name="orgName" value={formData.orgName} />
                                <input type="hidden" name="orgSlug" value={formData.orgSlug} />
                                <input type="hidden" name="planCode" value={formData.planCode} />
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        {step > 1 && (
                            <Button type="button" variant="ghost" onClick={() => setStep(s => s - 1)}>Back</Button>
                        )}
                        <div className="ml-auto">
                            {step < 3 ? (
                                <Button type="button" onClick={handleNext} disabled={
                                    (step === 1 && !formData.orgName) || (step === 2 && !formData.planCode)
                                }>Continue</Button>
                            ) : (
                                <Button type="submit">Complete Setup</Button>
                            )}
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
