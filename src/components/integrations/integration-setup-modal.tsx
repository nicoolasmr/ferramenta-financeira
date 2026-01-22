
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Check, Copy, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { PROVIDERS, ProviderSpec } from "@/lib/integrations/providers";
import { saveIntegrationConfig } from "@/actions/integrations"; // We will create this
import { toast } from "sonner";
import Image from "next/image";

interface IntegrationSetupModalProps {
    providerId: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    orgId: string;
}

export function IntegrationSetupModal({ providerId, isOpen, onOpenChange, orgId }: IntegrationSetupModalProps) {
    const provider = PROVIDERS[providerId];
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Record<string, string>>({});

    if (!provider) return null;

    const steps = provider.steps;
    const currentStep = steps[step];

    const handleNext = async () => {
        if (step === 1 && provider.modes.includes("api_key")) {
            // Save config if on credentials step
            setLoading(true);
            try {
                await saveIntegrationConfig(orgId, providerId, formData);
                toast.success("Credenciais salvas com sucesso!");
                setStep(step + 1);
            } catch (error) {
                toast.error("Erro ao salvar credenciais.");
            } finally {
                setLoading(false);
            }
        } else if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onOpenChange(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copiado!");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        {/* Logo placeholder if not available */}
                        <div className="w-10 h-10 relative bg-gray-100 rounded-md flex items-center justify-center">
                            <img src={provider.logo} alt={provider.name} className="w-8 h-8 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                        </div>
                        <div>
                            <DialogTitle>Conectar {provider.name}</DialogTitle>
                            <DialogDescription>{provider.description}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Stepper Header */}
                <div className="flex items-center justify-between px-2 mb-6 text-sm">
                    {steps.map((s, idx) => (
                        <div key={idx} className={`flex items-center gap-2 ${idx === step ? "text-primary font-medium" : "text-muted-foreground"}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border ${idx <= step ? "bg-primary text-primary-foreground border-primary" : "border-gray-300"}`}>
                                {idx < step ? <Check size={14} /> : idx + 1}
                            </div>
                            <span className="hidden sm:inline">{s.title}</span>
                            {idx < steps.length - 1 && <div className="w-8 h-[1px] bg-gray-200 mx-2" />}
                        </div>
                    ))}
                </div>

                {/* Content Body */}
                <div className="py-4 space-y-4">
                    <h3 className="text-lg font-semibold">{currentStep.title}</h3>
                    <p className="text-muted-foreground">{currentStep.description}</p>

                    {/* Step 0: Overview Checklist */}
                    {step === 0 && currentStep.checklist && (
                        <ul className="space-y-2 mt-2">
                            {currentStep.checklist.map((item, i) => (
                                <li key={i} className="flex gap-2 items-start text-sm">
                                    <Check className="w-4 h-4 text-green-500 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Step 1: Connect (Fields) */}
                    {step === 1 && currentStep.fields && currentStep.fields.length > 0 && (
                        <div className="space-y-4 mt-2">
                            {currentStep.fields.map((field) => (
                                <div key={field.key} className="space-y-1">
                                    <Label>{field.label} {field.required && <span className="text-red-500">*</span>}</Label>
                                    <Input
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        value={formData[field.key] || ""}
                                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                    />
                                    {field.helperText && <p className="text-xs text-muted-foreground">{field.helperText}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Step 2: Webhooks (URL Display) */}
                    {step === 2 && currentStep.hasWebhookUrl && (
                        <div className="bg-slate-50 p-4 rounded-md border space-y-4">
                            <div className="flex flex-col gap-1">
                                <Label className="text-xs font-semibold uppercase text-muted-foreground">Webhook URL</Label>
                                <div className="flex items-center gap-2">
                                    <code className="bg-white px-2 py-1 rounded border flex-1 text-sm font-mono overflow-hidden text-ellipsis">
                                        {`https://api.revenueos.com/webhooks/${providerId}/${orgId}`}
                                    </code>
                                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(`https://api.revenueos.com/webhooks/${providerId}/${orgId}`)}>
                                        <Copy size={14} />
                                    </Button>
                                </div>
                            </div>

                            {currentStep.hasWebhookToken && (
                                <div className="flex flex-col gap-1">
                                    <Label className="text-xs font-semibold uppercase text-muted-foreground">Webhook Token</Label>
                                    <div className="flex items-center gap-2">
                                        <code className="bg-white px-2 py-1 rounded border flex-1 text-sm font-mono">
                                            whsec_ExampleTokenToPasteInProvider
                                        </code>
                                        <Button variant="outline" size="icon" onClick={() => copyToClipboard('whsec_ExampleTokenToPasteInProvider')}>
                                            <Copy size={14} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Alert Box */}
                    {currentStep.alert && (
                        <Alert variant={currentStep.alert.type === "warning" ? "destructive" : "default"} className="mt-4">
                            {currentStep.alert.type === "warning" ? <AlertTriangle className="h-4 w-4" /> : <Loader2 className="h-4 w-4" />}
                            <AlertTitle>{currentStep.alert.type === "warning" ? "Atenção" : "Nota"}</AlertTitle>
                            <AlertDescription>{currentStep.alert.text}</AlertDescription>
                        </Alert>
                    )}

                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                    {step > 0 && (
                        <Button variant="outline" onClick={() => setStep(step - 1)} disabled={loading}>Voltar</Button>
                    )}
                    <Button onClick={handleNext} disabled={loading}>
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {step === steps.length - 1 ? "Finalizar" : "Continuar"}
                        {step < steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}
