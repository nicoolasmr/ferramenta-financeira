import { Info, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import { ReactNode } from "react";

const styles = {
    info: "bg-blue-50 border-blue-200 text-blue-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    tip: "bg-violet-50 border-violet-200 text-violet-900"
};

type CalloutProps = {
    type?: keyof typeof styles;
    title?: string;
    children: ReactNode;
};

export function Callout({ type = "info", title, children }: CalloutProps) {
    const Icon = {
        info: Info,
        warning: AlertTriangle,
        success: CheckCircle,
        tip: Lightbulb
    }[type];

    const style = styles[type];

    return (
        <div className={`my-8 p-6 rounded-xl border-l-4 shadow-sm flex gap-4 ${style}`}>
            <Icon className="w-6 h-6 shrink-0 mt-1" />
            <div>
                {title && <h4 className="font-bold text-lg mb-2">{title}</h4>}
                <div className="text-base leading-relaxed opacity-90">
                    {children}
                </div>
            </div>
        </div>
    );
}
