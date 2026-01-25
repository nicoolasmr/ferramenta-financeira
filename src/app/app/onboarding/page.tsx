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
import { StepAha } from "@/components/onboarding/steps/aha-step";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
    const router = useRouter();
    // Steps: 0=Welcome, 1=Org, 2=Integration, 3=Project, 4=AHA
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdOrgId, setCreatedOrgId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        orgName: "",
        orgSlug: "",
        projectName: "",
        planCode: "pro",
        integration: ""
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);
    const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSet = (key: string, value: string) => setFormData({ ...formData, [key]: value });

    const handleAction = async () => {
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
            } else if (result?.success) {
                setCreatedOrgId(result.orgId);
                setStep(4); // Move to AHA
            }
        } catch (error) {
            setIsSubmitting(false);
            console.error(error);
            toast.error("Erro inesperado ao processar onboarding.");
        }
    };

    const handleFinish = () => {
        if (createdOrgId) {
            window.location.href = `/app?org=${createdOrgId}`;
        }
    };

    return (
        <div className="h-full w-full flex items-center justify-center -mt-8">
            <Card className="w-full max-w-lg shadow-xl animate-in fade-in zoom-in duration-300">
                {step > 0 && (
                    <CardHeader>
                        <StepIndicator currentStep={step} totalSteps={4} />
                        <CardTitle className="text-center text-2xl">
                            {step === 1 && "Inicie sua Organização"}
                            {step === 2 && "Conecte sua Integração"}
                            {step === 3 && "Crie seu Primeiro Projeto"}
                            {step === 4 && "Verificação Final"}
                        </CardTitle>
                        <CardDescription className="text-center">
                            {step < 4 ? "Vamos preparar seu ambiente de negócios." : "Validando o fluxo de caixa..."}
                        </CardDescription>
                    </CardHeader>
                )}

                <CardContent className={step === 0 ? "pt-6" : ""}>
                    {step === 0 && <StepWelcome onNext={handleNext} />}
                    {step === 1 && <StepOrg data={formData} onChange={handleChange} />}
                    {step === 2 && <StepIntegration value={formData.integration} onChange={(val) => handleSet('integration', val)} />}
                    {step === 3 && <StepProject data={formData} onChange={handleChange} />}
                    {step === 4 && createdOrgId && (
                        <StepAha
                            orgId={createdOrgId}
                            integration={formData.integration || "Stripe"}
                            onFinish={handleFinish}
                        />
                    )}
                </CardContent>

                {step > 0 && step < 4 && (
                    <CardFooter className="flex justify-between border-t pt-6">
                        <Button type="button" variant="ghost" onClick={handleBack} disabled={isSubmitting}>
                            Voltar
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
                                Continuar
                            </Button>
                        ) : (
                            <Button type="button" onClick={handleAction} disabled={!formData.projectName || isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Finalizar Setup
                            </Button>
                        )}
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
