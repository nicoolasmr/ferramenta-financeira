"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderProps {
    logo: string;
    links: { label: string; href: string }[];
    ctaPrimary: { label: string; href: string };
    ctaSecondary: { label: string; href: string };
}

export function Header({ logo, links, ctaPrimary, ctaSecondary }: HeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-300",
                isScrolled
                    ? "bg-white/80 backdrop-blur-md border-b shadow-sm"
                    : "bg-transparent border-b border-transparent"
            )}
        >
            <div className="container mx-auto max-w-7xl flex h-20 items-center justify-between px-4 sm:px-6">
                <Link href="/" className="flex items-center gap-2 font-black text-2xl tracking-tighter text-slate-900 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white font-bold group-hover:bg-blue-600 transition-colors">
                        R
                    </div>
                    <span>{logo}</span>
                </Link>

                <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
                    {links.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            className="hover:text-blue-600 transition-colors relative group"
                        >
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <Link href={ctaSecondary.href} className="hidden sm:block">
                        <Button variant="ghost" className="text-sm font-bold text-slate-600 hover:text-slate-900">
                            {ctaSecondary.label}
                        </Button>
                    </Link>
                    <Link href={ctaPrimary.href}>
                        <Button className="h-10 px-6 text-sm font-black bg-slate-900 text-white hover:bg-blue-600 transition-all shadow-sm">
                            {ctaPrimary.label}
                        </Button>
                    </Link>
                    <button
                        className="lg:hidden p-2 text-slate-600"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-b overflow-hidden"
                    >
                        <div className="container mx-auto px-4 py-8 flex flex-col gap-4">
                            {links.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="text-lg font-bold text-slate-900"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <hr className="border-slate-100" />
                            <Link href={ctaSecondary.href} onClick={() => setIsMobileMenuOpen(false)}>
                                <Button variant="outline" className="w-full h-12">{ctaSecondary.label}</Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
