import { Button } from "@/components/ui/button";
import { CheckCircle2, Rocket } from "lucide-react";

interface StepWelcomeProps {
    onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
    return (
        <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
                <div className="p-4 bg-primary/10 rounded-full animate-bounce-slow">
                    <Rocket className="w-12 h-12 text-primary" />
                </div>
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Bem-vindo ao RevenueOS</h2>
                <p className="text-slate-500 max-w-sm mx-auto">
                    O sistema operacional financeiro definitivo para operações de alta escala. Vamos configurar seu ambiente em menos de 2 minutos.
                </p>
            </div>

            <div className="space-y-4 pt-4">
                <div className="flex items-center justify-center gap-8 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Controle Financeiro</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>CRM de Vendas</span>
                    </div>
                </div>
            </div>

            <Button onClick={onNext} size="lg" className="w-full max-w-xs">
                Começar Agora
            </Button>
        </div>
    );
}
