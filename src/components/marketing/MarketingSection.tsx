"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface MarketingSectionProps extends HTMLMotionProps<"section"> {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

const maxWidthMap = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
};

export function MarketingSection({
    children,
    className,
    containerClassName,
    maxWidth = "lg",
    ...props
}: MarketingSectionProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn("py-20 lg:py-32 overflow-hidden", className)}
            {...props}
        >
            <div className={cn("container mx-auto px-4 sm:px-6", maxWidthMap[maxWidth], containerClassName)}>
                {children}
            </div>
        </motion.section>
    );
}
