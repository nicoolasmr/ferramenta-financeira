import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, index) => {
                const step = index + 1;
                const isCompleted = step < currentStep;
                const isCurrent = step === currentStep;

                return (
                    <div key={step} className="flex items-center">
                        {index > 0 && (
                            <div
                                className={cn(
                                    "h-[2px] w-8 mx-2",
                                    step <= currentStep ? "bg-primary" : "bg-slate-200"
                                )}
                            />
                        )}
                        <div
                            className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold transition-all",
                                isCompleted && "bg-primary border-primary text-primary-foreground",
                                isCurrent && "border-primary text-primary",
                                !isCompleted && !isCurrent && "border-slate-200 text-slate-400"
                            )}
                        >
                            {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
