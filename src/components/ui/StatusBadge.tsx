import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
    className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-green-100 text-green-700" },
    inactive: { label: "Inactive", className: "bg-slate-100 text-slate-700" },
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
    paid: { label: "Paid", className: "bg-green-100 text-green-700" },
    failed: { label: "Failed", className: "bg-red-100 text-red-700" },
    connected: { label: "Connected", className: "bg-green-100 text-green-700" },
    disconnected: { label: "Disconnected", className: "bg-slate-100 text-slate-700" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfig[status.toLowerCase()] || {
        label: status,
        className: "bg-slate-100 text-slate-700",
    };

    return (
        <Badge className={cn(config.className, className)}>
            {config.label}
        </Badge>
    );
}
