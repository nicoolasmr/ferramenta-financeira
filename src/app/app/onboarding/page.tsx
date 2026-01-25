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
    // Steps: 0=Welcome, 1=Org, 2=Integration, 3=Project (Plan step removed from UI, defaulted in state)
    // We map internal step numbers to UI: 
    // UI Step 1: Org (Internal 1)
    // UI Step 2: Integration (Internal 3) - Skipped 2
    // UI Step 3: Project (Internal 4)

    // Actually simpler: re-index.
    // 0=Welcome
    // 1=Org
    // 2=Integration
    // 3=Project
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        orgName: "",
        orgSlug: "",
        projectName: "",
        planCode: "pro", // Default to pro for now, or logic to detect
        integration: ""
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);
    const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSet = (key: string, value: string) => setFormData({ ...formData, [key]: value });

    const handleAction = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("orgName", formData.orgName);
            formDataToSend.append("orgSlug", formData.orgSlug);
            formDataToSend.append("projectName", formData.projectName);
            formDataToSend.append("planCode", formData.planCode);
            formDataToSend.append("integration", formData.integration);

            const result = await completeOnboarding(formDataToSend);
            if (result?.error) {
                setIsSubmitting(false);
                const errorObj = result.error as any;
                const errorMessage = errorObj.server ||
                    (typeof result.error === 'object' ? Object.values(result.error).flat().join(', ') : '') ||
                    "Falha ao completar onboarding. Verifique os dados.";
                toast.error(errorMessage);
            }
        } catch (error) {
            setIsSubmitting(false);
            if (error instanceof Error && (error.message === 'NEXT_REDIRECT' || error.message.includes('NEXT_REDIRECT'))) {
                return;
            }
            console.error(error);
            toast.error("Erro inesperado ao processar onboarding.");
        }
    };

    return (
        <div className="h-full w-full flex items-center justify-center -mt-8"> {/* Negative margin to offset parent padding for perfect center */}
            <Card className="w-full max-w-lg shadow-xl animate-in fade-in zoom-in duration-300">
                {step > 0 && (
                    <CardHeader>
                        <StepIndicator currentStep={step} totalSteps={3} />
                        <CardTitle className="text-center text-2xl">
                            {step === 1 && "Start your Organization"}
                            {step === 2 && "Connect Integration"}
                            {step === 3 && "Create your First Project"}
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

                    {/* Step Plan skipped */}

                    {step === 2 && (
                        <StepIntegration value={formData.integration} onChange={(val) => handleSet('integration', val)} />
                    )}

                    {step === 3 && (
                        <StepProject data={formData} onChange={handleChange} />
                    )}
                </CardContent>

                {step > 0 && (
                    <CardFooter className="flex justify-between border-t pt-6">
                        <Button type="button" variant="ghost" onClick={handleBack} disabled={isSubmitting}>
                            Back
                        </Button>

                        {step < 3 ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                disabled={
                                    (step === 1 && (!formData.orgName || !formData.orgSlug)) ||
                                    (step === 2 && !formData.integration && formData.integration !== 'skip')
                                }
                            >
                                Continue
                            </Button>
                        ) : (
                            <form action={() => handleAction(new FormData())}>
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
