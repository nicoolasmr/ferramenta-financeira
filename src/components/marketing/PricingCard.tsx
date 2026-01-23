"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

interface PricingCardProps {
    plan: {
        name: string;
        desc: string;
        price: string;
        period: string;
        cta: string;
        ctaLink: string;
        ctaVariant?: any;
        highlight?: string;
        features: string[];
    };
}

export function PricingCard({ plan }: PricingCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={cn(
                "p-8 rounded-2xl border bg-white flex flex-col relative h-full transition-all duration-300",
                plan.highlight
                    ? "border-emerald-600 shadow-2xl ring-1 ring-emerald-600/20 z-10 scale-[1.02]"
                    : "border-slate-200 hover:shadow-xl"
            )}
        >
            {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                    {plan.highlight}
                </div>
            )}

            <div className="mb-8">
                <h3 className="font-bold text-2xl text-slate-900">{plan.name}</h3>
                <p className="text-slate-500 text-sm mt-2">{plan.desc}</p>
            </div>

            <div className="mb-8 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                <span className="text-slate-500 font-medium">{plan.period}</span>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
                {plan.features.map((feat, j) => (
                    <li key={j} className="flex gap-3 text-sm text-slate-600 items-start">
                        <CheckCircle2 className={cn(
                            "w-5 h-5 mt-0.5 shrink-0",
                            plan.highlight ? "text-emerald-500" : "text-slate-400"
                        )} />
                        {feat}
                    </li>
                ))}
            </ul>

            <Link href={plan.ctaLink} className="w-full">
                <Button
                    size="lg"
                    variant={plan.ctaVariant || "default"}
                    className={cn(
                        "w-full h-12 text-base font-black transition-all",
                        plan.highlight
                            ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-emerald-500/25 text-white"
                            : "bg-transparent text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                    )}
                >
                    {plan.cta}
                </Button>
            </Link>
        </motion.div>
    );
}
