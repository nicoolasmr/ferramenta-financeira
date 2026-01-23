"use client";

import { motion } from "framer-motion";

interface Step {
    title: string;
    description: string;
}

interface TTVSectionProps {
    title: string;
    steps: Step[];
}

export function TTVSection({ title, steps }: TTVSectionProps) {
    return (
        <div className="py-12 px-8 rounded-3xl bg-blue-600 text-white overflow-hidden relative shadow-2xl">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-50" />

            <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-10 text-center">{title}</h2>
                <div className="grid md:grid-cols-3 gap-8 relative">
                    {/* Connecting line on desktop */}
                    <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-px bg-blue-400 opacity-30 z-0" />

                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.2 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center text-center relative z-10"
                        >
                            <div className="h-14 w-14 rounded-full bg-white text-blue-600 font-bold text-xl flex items-center justify-center mb-6 shadow-xl border-4 border-blue-500">
                                {i + 1}
                            </div>
                            <h3 className="font-bold text-xl mb-3">{step.title}</h3>
                            <p className="text-blue-100 text-sm leading-relaxed max-w-[240px]">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
