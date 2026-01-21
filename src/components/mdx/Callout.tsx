import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";

export function Callout({ type = "info", title, children }: { type?: "info" | "success" | "warning" | "error", title?: string, children: React.ReactNode }) {
    const styles = {
        info: "bg-blue-50 border-blue-200 text-blue-900 icon-blue-500",
        success: "bg-emerald-50 border-emerald-200 text-emerald-900 icon-emerald-500",
        warning: "bg-amber-50 border-amber-200 text-amber-900 icon-amber-500",
        error: "bg-red-50 border-red-200 text-red-900 icon-red-500"
    };

    const icons = {
        info: Info,
        success: CheckCircle2,
        warning: AlertCircle,
        error: XCircle
    };

    const Icon = icons[type];
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
