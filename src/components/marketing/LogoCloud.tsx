"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface Integration {
    name: string;
    logo: string;
    isImage?: boolean;
    className?: string;
}

interface LogoCloudProps {
    title: string;
    logos: Integration[];
}

export function LogoCloud({ title, logos }: LogoCloudProps) {
    return (
        <div className="w-full">
            <h3 className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-12">
                {title}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-10 px-4">
                {logos.map((logo, i) => (
                    <motion.div
                        key={logo.name}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.1 }}
                        className={cn(
                            "flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100",
                            logo.className
                        )}
                    >
                        <div className={cn("h-9 md:h-12 flex items-center justify-center grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all", logo.className ? "h-auto" : "")}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={logo.logo}
                                alt={logo.name}
                                className={cn("h-full w-auto max-w-[180px] object-contain", logo.className)}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
