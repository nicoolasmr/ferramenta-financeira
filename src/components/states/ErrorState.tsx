import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
    title?: string;
    message: string;
    retry?: () => void;
}

export function ErrorState({
    title = "Something went wrong",
    message,
    retry
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm">{message}</p>
            {retry && (
                <Button onClick={retry} variant="outline">
                    Try again
                </Button>
            )}
        </div>
    );
}
