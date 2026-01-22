"use client";

import { CheckCircle2, Circle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'testing';

interface ConnectionStatusProps {
    status: ConnectionStatus;
    className?: string;
}

export function ConnectionStatus({ status, className }: ConnectionStatusProps) {
    const config = {
        connected: {
            color: 'text-green-600',
            bgColor: 'bg-green-500',
            text: 'Connected',
            icon: CheckCircle2
        },
        disconnected: {
            color: 'text-gray-500',
            bgColor: 'bg-gray-400',
            text: 'Not Configured',
            icon: Circle
        },
        error: {
            color: 'text-red-600',
            bgColor: 'bg-red-500',
            text: 'Connection Error',
            icon: XCircle
        },
        testing: {
            color: 'text-blue-600',
            bgColor: 'bg-blue-500',
            text: 'Testing...',
            icon: AlertCircle
        }
    };

    const { color, bgColor, text, icon: Icon } = config[status];

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className={cn(
                "h-2 w-2 rounded-full",
                bgColor,
                status === 'connected' && "animate-pulse"
            )} />
            <Icon className={cn("h-4 w-4", color)} />
            <span className={cn("text-sm font-medium", color)}>{text}</span>
        </div>
    );
}
