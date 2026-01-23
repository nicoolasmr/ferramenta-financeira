
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

declare global {
    interface Window {
        belvoSDK: {
            createWidget: (accessToken: string, options: any) => { build: () => void };
        };
    }
}

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

    const handleBelvoConnect = async () => {
        setLoading(true);
        try {
            // 1. Get Widget Token
            const res = await fetch("/api/belvo/widget-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ org_id: orgId })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to get token");

            // 2. Load Belvo Script if needed
            if (!window.belvoSDK) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement("script");
                    script.src = "https://cdn.belvo.io/belvo-widget-1-stable.js";
                    script.async = true;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            }

            // 3. Open Widget
            // @ts-ignore
            window.belvoSDK.createWidget(data.access, {
                callback: async (link: string, institution: string) => {
                    console.log("Belvo Success:", link, institution);
                    setLoading(true);
                    try {
                        const { saveBelvoConnection } = await import("@/actions/integrations");
                        await saveBelvoConnection(orgId, link, institution);
                        toast.success(`Conectado com sucesso ao ${institution}!`);
                        onOpenChange(false);
                    } catch (error) {
                        console.error(error);
                        toast.error("Erro ao salvar conexão.");
                    } finally {
                        setLoading(false);
                    }
                },
                onExit: () => {
                    setLoading(false);
                    toast.info("Conexão cancelada pelo usuário.");
                },
                onEvent: (data: any) => {
                    console.log("Belvo Event:", data);
                }
            }).build();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erro ao iniciar Belvo widget");
            setLoading(false);
        }
    };

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

                    {/* Step 1: Connect (Fields or Widget) */}
                    {step === 1 && (
                        <>
                            {providerId === "belvo" ? (
                                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-slate-50">
                                    <div className="text-center space-y-4">
                                        <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto">
                                            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.873.571-4.217" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">Abrir Conector Bancário</h4>
                                            <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1">
                                                Clique abaixo para abrir o widget seguro da Belvo e selecionar seu banco.
                                            </p>
                                        </div>
                                        <Button onClick={handleBelvoConnect} disabled={loading} className="w-full max-w-xs">
                                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                            Conectar Conta Bancária
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                currentStep.fields && currentStep.fields.length > 0 && (
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
                                )
                            )}
                        </>
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
                    {providerId !== "belvo" && (
                        <Button onClick={handleNext} disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {step === steps.length - 1 ? "Finalizar" : "Continuar"}
                            {step < steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
                        </Button>
                    )}
                </div>

            </DialogContent>
        </Dialog>
    );
}
