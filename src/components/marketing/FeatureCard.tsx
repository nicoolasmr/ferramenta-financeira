"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    className?: string;
    iconClassName?: string;
    variant?: "default" | "glass" | "outline";
}

export function FeatureCard({
    icon: Icon,
    title,
    description,
    className,
    iconClassName,
    variant = "default"
}: FeatureCardProps) {
    const variants = {
        default: "bg-slate-50 border-transparent hover:border-slate-200",
        glass: "bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]",
        outline: "bg-transparent border-slate-200 hover:border-blue-300 hover:shadow-[0_10px_30px_-10px_rgba(59,130,246,0.1)]",
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={cn(
                "group p-8 rounded-2xl border transition-all duration-300",
                variants[variant],
                className
            )}
        >
            <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center mb-6 shadow-sm",
                variant === "glass" ? "bg-white/10 text-white" : "bg-white text-slate-900 border",
                iconClassName
            )}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className={cn(
                "text-xl font-bold mb-3",
                variant === "glass" ? "text-white" : "text-slate-900"
            )}>{title}</h3>
            <p className={cn(
                "leading-relaxed text-sm",
                variant === "glass" ? "text-slate-400" : "text-slate-600"
            )}>
                {description}
            </p>
        </motion.div>
    );
}
