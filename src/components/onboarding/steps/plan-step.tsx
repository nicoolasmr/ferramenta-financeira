import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepPlanProps {
    value: string;
    onChange: (value: string) => void;
}

export function StepPlan({ value, onChange }: StepPlanProps) {
    const plans = [
        { id: 'starter', name: 'Starter', price: 'Free', features: ['Up to 3 users', 'Basic Reporting', '1,000 Customers'] },
        { id: 'pro', name: 'Professional', price: '$49/mo', features: ['Unlimited users', 'Advanced Analytics', 'Unlimited Customers'] },
        { id: 'agency', name: 'Agency', price: '$199/mo', features: ['White-label', 'Priority Support', 'API Access'] },
    ];

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center mb-6">
                <h2 className="text-2xl font-bold">Choose your Plan</h2>
                <p className="text-slate-500">Start for free, upgrade as you grow.</p>
            </div>

            <div className="grid gap-4">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={cn(
                            "border rounded-lg p-4 cursor-pointer hover:border-primary transition-all relative overflow-hidden",
                            value === plan.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-200"
                        )}
                        onClick={() => onChange(plan.id)}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-lg capitalize">{plan.name}</span>
                                    {value === plan.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                </div>
                                <span className="text-sm font-medium text-slate-600">{plan.price}</span>
                            </div>
                        </div>
                        <div className="mt-3 flex gap-2 text-xs text-muted-foreground">
                            {plan.features.map((f, i) => (
                                <span key={i} className="bg-white px-2 py-1 rounded border border-slate-100">{f}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
