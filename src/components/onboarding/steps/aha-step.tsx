"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { simulateAhaEvent } from "@/app/app/onboarding/actions";
import { toast } from "sonner";

interface StepAhaProps {
    orgId: string;
    integration: string;
    onFinish: () => void;
}

export function StepAha({ orgId, integration, onFinish }: StepAhaProps) {
    const [status, setStatus] = useState<"waiting" | "received" | "celebrating">("waiting");
    const [isSimulating, setIsSimulating] = useState(false);

    const handleSimulate = async () => {
        setIsSimulating(true);
        try {
            await simulateAhaEvent(orgId, integration);
            setStatus("received");
            setTimeout(() => setStatus("celebrating"), 1500);
        } catch (error) {
            toast.error("Falha ao simular dado.");
        } finally {
            setIsSimulating(false);
        }
    };

    return (
        <div className="space-y-8 pt-4 text-center">
            {status === "waiting" && (
                <div className="flex flex-col items-center gap-6 py-6 transition-all animate-in fade-in slide-in-from-bottom-4">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <TrendingUp className="w-8 h-8 text-primary/40" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Aguardando seu primeiro dado...</h3>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">
                            Conecte o Webhook no <strong>{integration}</strong> para ver o RevenueOS em ação.
                        </p>
                    </div>
                    <div className="pt-4 flex flex-col gap-2 w-full max-w-xs">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">OU TESTE AGORA</div>
                        <Button
                            variant="outline"
                            className="w-full border-dashed border-2 hover:bg-primary/5 hover:border-primary transition-all group"
                            onClick={handleSimulate}
                            disabled={isSimulating}
                        >
                            {isSimulating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2 text-amber-500 group-hover:scale-125 transition-transform" />}
                            Simular Transação de Teste
                        </Button>
                    </div>
                </div>
            )}

            {status === "received" && (
                <div className="flex flex-col items-center gap-4 py-12 transition-all animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-600 animate-bounce" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-700">DADO RECEBIDO!</h3>
                </div>
            )}

            {status === "celebrating" && (
                <div className="flex flex-col items-center gap-6 py-4 transition-all animate-in fade-in scale-95 duration-700">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-6 shadow-sm w-full">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded uppercase">Venda Aprovada</span>
                            <span className="text-[11px] text-slate-400 font-mono">#{Math.floor(Math.random() * 90000)}</span>
                        </div>
                        <div className="text-left mb-4">
                            <p className="text-xs text-slate-500">Cliente</p>
                            <p className="font-bold text-slate-800">João Silva (Teste)</p>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-slate-500">Valor</p>
                                <p className="text-2xl font-black text-slate-900">R$ 150,00</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400">Via {integration}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 w-full">
                        <Button className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" onClick={onFinish}>
                            Começar de Verdade 🚀
                        </Button>
                        <p className="text-[11px] text-muted-foreground mt-4 italic">
                            O RevenueOS já normalizou as taxas e preparou o seu calendário de recebíveis.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
