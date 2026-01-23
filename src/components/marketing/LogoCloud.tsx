"use client";

import { motion } from "framer-motion";

interface Integration {
    name: string;
    logo: string;
    isImage?: boolean;
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
                        whileInView={{ opacity: 0.5 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ opacity: 1, scale: 1.05 }}
                        className="flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                    >
                        {/* 
                            In a real app, these would be next/image or real SVG logos.
                            Since I don't have all files, I'll use placeholders or the paths provided.
                        */}
                        <div className="h-8 flex items-center gap-2">
                            <div className="h-6 w-6 bg-slate-300 rounded" />
                            <span className="font-bold text-slate-400 group-hover:text-slate-900">{logo.name}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
