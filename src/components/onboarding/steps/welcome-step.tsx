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
                <h2 className="text-3xl font-bold tracking-tight">Welcome to RevenueOS</h2>
                <p className="text-slate-500 max-w-sm mx-auto">
                    The all-in-one financial operating system for high-performance SaaS. Let's set up your workspace in less than 2 minutes.
                </p>
            </div>

            <div className="space-y-4 pt-4">
                <div className="flex items-center justify-center gap-8 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Financial Control</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Sales CRM</span>
                    </div>
                </div>
            </div>

            <Button onClick={onNext} size="lg" className="w-full max-w-xs">
                Get Started
            </Button>
        </div>
    );
}
