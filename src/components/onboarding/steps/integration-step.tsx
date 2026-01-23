import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StepIntegrationProps {
    value: string;
    onChange: (value: string) => void;
}

export function StepIntegration({ value, onChange }: StepIntegrationProps) {
    const integrations = [
        { id: 'Stripe', name: 'Stripe', color: 'bg-[#635BFF]' },
        { id: 'Hotmart', name: 'Hotmart', color: 'bg-[#F04E23]' },
        { id: 'Asaas', name: 'Asaas', color: 'bg-[#0030b9]' },
        { id: 'Kiwify', name: 'Kiwify', color: 'bg-[#4200FF]' },
    ];

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center mb-6">
                <h2 className="text-2xl font-bold">Connect Integration</h2>
                <p className="text-slate-500">Sync your sales data automatically.</p>
            </div>

            <div className="grid gap-3">
                {integrations.map((provider) => (
                    <div
                        key={provider.id}
                        className={cn(
                            "border rounded-lg p-4 cursor-pointer hover:border-primary transition-all",
                            value === provider.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-200"
                        )}
                        onClick={() => onChange(provider.id)}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className={cn("w-8 h-8 rounded flex items-center justify-center font-bold text-xs text-white", provider.color)}>
                                    {provider.name[0]}
                                </div>
                                <span className="font-semibold">{provider.name}</span>
                            </div>
                            {value === provider.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center pt-2">
                <Button
                    type="button"
                    variant="link"
                    className="text-muted-foreground"
                    onClick={() => onChange('skip')}
                >
                    {value === 'skip' ? "Selected: I'll connect later" : "I'll connect later"}
                </Button>
            </div>
        </div>
    );
}
