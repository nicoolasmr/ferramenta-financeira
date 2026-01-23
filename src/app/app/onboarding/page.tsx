"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { completeOnboarding } from "./actions";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { StepWelcome } from "@/components/onboarding/steps/welcome-step";
import { StepOrg } from "@/components/onboarding/steps/org-step";
import { StepPlan } from "@/components/onboarding/steps/plan-step";
import { StepIntegration } from "@/components/onboarding/steps/integration-step";
import { StepProject } from "@/components/onboarding/steps/project-step";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingPage() {
    // Steps: 0=Welcome, 1=Org, 2=Plan, 3=Integration, 4=Project
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        orgName: "",
        orgSlug: "",
        projectName: "",
        planCode: "starter",
        integration: ""
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);
    const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSet = (key: string, value: string) => setFormData({ ...formData, [key]: value });

    const handleAction = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            const result = await completeOnboarding(data);
            if (result?.error) {
                setIsSubmitting(false);
                toast.error("Falha ao completar onboarding. Verifique os dados.");
            }
        } catch (error) {
            setIsSubmitting(false);
            // Ignore redirect errors as they are expected
            if (!(error instanceof Error && error.message === 'NEXT_REDIRECT')) {
                toast.error("Erro inesperado ao processar onboarding.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg shadow-xl">
                {step > 0 && (
                    <CardHeader>
                        <StepIndicator currentStep={step} totalSteps={4} />
                        <CardTitle className="text-center text-2xl">
                            {step === 1 && "Start your Organization"}
                            {step === 2 && "Choose your Plan"}
                            {step === 3 && "Connect Integration"}
                            {step === 4 && "Create your First Project"}
                        </CardTitle>
                        <CardDescription className="text-center">
                            Let&apos;s get your workspace ready for business.
                        </CardDescription>
                    </CardHeader>
                )}

                <CardContent className={step === 0 ? "pt-6" : ""}>
                    {step === 0 && <StepWelcome onNext={handleNext} />}

                    {step === 1 && (
                        <StepOrg data={formData} onChange={handleChange} />
                    )}

                    {step === 2 && (
                        <StepPlan value={formData.planCode} onChange={(val) => handleSet('planCode', val)} />
                    )}

                    {step === 3 && (
                        <StepIntegration value={formData.integration} onChange={(val) => handleSet('integration', val)} />
                    )}

                    {step === 4 && (
                        <StepProject data={formData} onChange={handleChange} />
                    )}
                </CardContent>

                {step > 0 && (
                    <CardFooter className="flex justify-between border-t pt-6">
                        <Button type="button" variant="ghost" onClick={handleBack} disabled={isSubmitting}>
                            Back
                        </Button>

                        {step < 4 ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                disabled={
                                    (step === 1 && (!formData.orgName || !formData.orgSlug)) ||
                                    (step === 2 && !formData.planCode) ||
                                    (step === 3 && !formData.integration && formData.integration !== 'skip')
                                }
                            >
                                Continue
                            </Button>
                        ) : (
                            <form action={handleAction}>
                                {/* Pass all state as hidden inputs */}
                                <input type="hidden" name="orgName" value={formData.orgName} />
                                <input type="hidden" name="orgSlug" value={formData.orgSlug} />
                                <input type="hidden" name="planCode" value={formData.planCode} />
                                <input type="hidden" name="integration" value={formData.integration} />
                                <input type="hidden" name="projectName" value={formData.projectName} />

                                <Button type="submit" disabled={!formData.projectName || isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Complete Setup
                                </Button>
                            </form>
                        )}
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
