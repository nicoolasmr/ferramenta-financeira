"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { landingContent } from "@/content/landingContent";
import { ArrowRight, CheckCircle2, Zap } from "lucide-react";
import { Header } from "@/components/marketing/Header";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { FeatureCard } from "@/components/marketing/FeatureCard";
import { ProductPreview } from "@/components/marketing/ProductPreview";
import { PricingCard } from "@/components/marketing/PricingCard";
import { LogoCloud } from "@/components/marketing/LogoCloud";
import { TTVSection } from "@/components/marketing/TTVSection";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col font-sans bg-white selection:bg-blue-100 selection:text-blue-900">
            <Header
                logo={landingContent.nav.logo}
                links={landingContent.nav.links}
                ctaPrimary={landingContent.nav.ctaPrimary}
                ctaSecondary={landingContent.nav.ctaSecondary}
            />

            <main className="flex-1">
                {/* HERO SECTION */}
                <section className="relative pt-12 lg:pt-20 pb-20 lg:pb-32 overflow-hidden">
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl overflow-hidden pointer-events-none">
                        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/20 blur-[140px] animate-pulse" />
                        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] animate-none" />
                        <div className="absolute bottom-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[100px]" />

                        {/* Subtle Grid Pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                    </div>

                    <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                            <div>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-8"
                                >
                                    <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                                    <span className="text-sm font-bold text-blue-700">{landingContent.hero.pill}</span>
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-5xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.05] mb-8"
                                >
                                    {landingContent.hero.headline}
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-xl text-slate-600 leading-relaxed mb-10 max-w-xl"
                                >
                                    {landingContent.hero.subheadline}
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="space-y-4 mb-12"
                                >
                                    {landingContent.hero.bullets.map((bullet, i) => (
                                        <div key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                                <CheckCircle2 className="h-3 w-3 text-white" />
                                            </div>
                                            {bullet}
                                        </div>
                                    ))}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex flex-col sm:flex-row items-center gap-4 mb-16"
                                >
                                    <Link href={landingContent.hero.ctaPrimary.href} className="w-full sm:w-auto relative group">
                                        <Button size="lg" className="w-full h-14 px-10 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all duration-300 relative overflow-hidden text-white">
                                            <span className="relative z-10 flex items-center">
                                                {landingContent.hero.ctaPrimary.label}
                                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                            </span>
                                            {/* Button shine effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:animate-shine" />
                                        </Button>
                                    </Link>
                                    <Link href={landingContent.hero.ctaSecondary.href} className="w-full sm:w-auto">
                                        <Button size="lg" variant="outline" className="w-full h-14 px-10 text-lg font-bold bg-blue-600 text-white border-none hover:bg-blue-700 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                                            {landingContent.hero.ctaSecondary.label}
                                        </Button>
                                    </Link>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="flex flex-wrap gap-x-8 gap-y-4"
                                >
                                    {landingContent.hero.microtrust.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            <item.icon className="h-4 w-4 text-blue-600" />
                                            {item.label}
                                        </div>
                                    ))}
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="relative"
                            >
                                <div className="absolute -inset-4 bg-blue-600/20 blur-[80px] rounded-full opacity-50" />
                                <div className="relative rounded-2xl border border-slate-200/50 shadow-2xl overflow-hidden backdrop-blur-sm bg-white/5">
                                    <ProductPreview />
                                </div>
                            </motion.div>
                        </div>

                        {/* Scroll Cue */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 1 }}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2 text-slate-400"
                        >
                            <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Scroll</span>
                            <motion.div
                                animate={{ y: [0, 8, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                className="w-px h-12 bg-gradient-to-b from-blue-600/0 via-blue-600 to-blue-600/0"
                            />
                        </motion.div>
                    </div>
                </section>

                {/* PROBLEMS SECTION */}
                <MarketingSection maxWidth="md">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight">
                            {landingContent.problems.title}
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {landingContent.problems.cards.map((card, i) => (
                            <FeatureCard
                                key={i}
                                icon={card.icon}
                                title={card.title}
                                description={card.description}
                                variant="outline"
                            />
                        ))}
                    </div>
                </MarketingSection>

                {/* TTV SECTION */}
                <MarketingSection maxWidth="md">
                    <TTVSection
                        title={landingContent.ttv.title}
                        steps={landingContent.ttv.steps}
                    />
                </MarketingSection>

                {/* DATA TRUTH LAYER */}
                <MarketingSection>
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 relative">
                            {/* ... existing data truth content ... */}
                            <div className="absolute -inset-4 bg-emerald-500/10 blur-3xl opacity-50" />
                            <div className="relative bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden group">
                                <div className="space-y-4 font-mono text-xs">
                                    <div className="flex gap-2">
                                        <span className="text-slate-500">RAW:</span>
                                        <span className="text-blue-400">{"{\"id\": \"evt_123\", \"amt\": 5000, \"cur\": \"brl\"}"}</span>
                                    </div>
                                    <div className="h-px bg-slate-800" />
                                    <div className="flex gap-2">
                                        <span className="text-slate-500">CANONICAL:</span>
                                        <span className="text-emerald-400">{"{\"event\": \"payment_success\", \"amount_normalized\": 50.00}"}</span>
                                    </div>
                                    <div className="h-px bg-slate-800" />
                                    <div className="flex gap-2">
                                        <span className="text-slate-500">APPLIED:</span>
                                        <span className="text-white">Applied to Project: Launch_2026. Balance updated.</span>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 leading-tight">
                                {landingContent.dataTruth.title}
                            </h2>
                            <p className="text-lg text-slate-600 mb-10">
                                {landingContent.dataTruth.description}
                            </p>
                            <div className="space-y-4 mb-10">
                                {landingContent.dataTruth.bullets.map((bullet, i) => (
                                    <div key={i} className="flex gap-3 items-center text-slate-700 font-semibold">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        {bullet}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8">
                                <Link href={landingContent.dataTruth.cta.href}>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-14 px-10 text-lg font-black text-blue-600 border-blue-200 hover:bg-blue-50/50 hover:border-blue-300 transition-all group"
                                    >
                                        <span>{landingContent.dataTruth.cta.label}</span>
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </MarketingSection>

                {/* CAIXA REAL (OPEN FINANCE) DIFFERENTIAL */}
                <MarketingSection className="bg-slate-900 text-white overflow-hidden py-24">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <Badge className="bg-blue-600 text-white mb-6 font-black uppercase tracking-widest px-4 py-1">Novidade: Open Finance</Badge>
                            <h2 className="text-4xl lg:text-6xl font-black mb-8 leading-tight">A Prova Real do seu Faturamento.</h2>
                            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
                                Pare de confiar cegamente nos números da sua plataforma de vendas. O RevenueOS conecta-se diretamente ao seu banco para garantir que cada centavo reportado realmente entrou no seu bolso.
                            </p>
                            <div className="grid grid-cols-2 gap-6 mb-10">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="text-emerald-400 font-black text-2xl mb-1">Delta Zero</div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Conciliação 100% Automática</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div className="text-blue-400 font-black text-2xl mb-1">+20 Bancos</div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Conectividade via Open Finance</p>
                                </div>
                            </div>
                            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 font-black text-lg h-14 px-10">
                                Conhecer Caixa Real
                            </Button>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-10 bg-blue-600/20 blur-[100px] rounded-full" />
                            <div className="relative glass-dark p-8 rounded-3xl border border-white/10 shadow-2xl">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="font-black text-lg uppercase tracking-wider">Matching Engine</div>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-bold">LIVE</Badge>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                        <div className="text-sm font-bold">Stripe Payout #2938</div>
                                        <div className="text-emerald-400 font-black">R$ 5.420,00</div>
                                    </div>
                                    <div className="flex justify-center flex-col items-center py-2 h-12 relative">
                                        <div className="w-px h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                        <div className="absolute top-1/2 -translate-y-1/2 bg-blue-600 p-1.5 rounded-full ring-4 ring-slate-900">
                                            <Zap className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <div className="text-sm font-bold">Banco Itaú (Extrato)</div>
                                        <div className="text-emerald-400 font-black">R$ 5.420,00</div>
                                    </div>
                                    <div className="text-center mt-4">
                                        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">Match Confirmado Deterministicamente</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </MarketingSection>

                {/* FEATURES GRID */}
                <MarketingSection id="produto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-6">
                            {landingContent.features.title}
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            {landingContent.features.subtitle}
                        </p>
                    </div>
                    <div className="space-y-20">
                        {landingContent.features.blocks.map((block, i) => (
                            <div key={i}>
                                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-10 pl-4 border-l-4 border-blue-600">
                                    {block.title}
                                </h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {block.items.map((item, j) => (
                                        <FeatureCard
                                            key={j}
                                            icon={item.icon}
                                            title={item.title}
                                            description={item.desc}
                                            variant="outline"
                                            className="p-6"
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </MarketingSection>

                {/* INTEGRATIONS */}
                <MarketingSection id="integracoes" className="bg-slate-50">
                    <LogoCloud
                        title={landingContent.integrations.title}
                        logos={landingContent.integrations.tier1}
                    />
                    <p className="text-center text-xs text-slate-400 font-mono mt-12">
                        {landingContent.integrations.techProof}
                    </p>
                </MarketingSection>

                {/* AI COPILOT */}
                <MarketingSection id="ia" className="bg-slate-950 text-white relative">
                    {/* Visual decor */}
                    <div className="absolute top-0 right-0 w-full h-full">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full" />
                    </div>

                    <div className="relative z-10">
                        <div className="max-w-3xl mx-auto text-center mb-20">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-black uppercase tracking-wider mb-8">
                                <Zap className="h-4 w-4" /> AI Copilot
                            </div>
                            <h2 className="text-3xl lg:text-5xl font-black text-white mb-8">
                                {landingContent.copilot.title}
                            </h2>
                            <p className="text-xl text-slate-400 leading-relaxed">
                                {landingContent.copilot.description}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-20">
                            {landingContent.copilot.columns.map((col, i) => (
                                <div key={i} className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
                                    <h3 className="text-xl font-bold mb-8 text-white flex items-center gap-3">
                                        <div className={cn("h-2 w-2 rounded-full", i === 0 ? "bg-emerald-500" : "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]")} />
                                        {col.title}
                                    </h3>
                                    <ul className="space-y-4">
                                        {col.items.map((item, j) => (
                                            <li key={j} className="flex gap-3 text-slate-300 items-start">
                                                <CheckCircle2 className="h-5 w-5 text-slate-700 shrink-0 mt-0.5" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {landingContent.copilot.subfeatures.map((feat, i) => (
                                <div key={i} className="flex gap-5 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all group">
                                    <div className="h-12 w-12 rounded-xl bg-blue-600/20 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                                        <feat.icon className="w-6 h-6 text-blue-400 group-hover:text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-2">{feat.title}</h4>
                                        <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-xs text-slate-600 mt-12 italic">
                            *{landingContent.copilot.disclaimer}
                        </p>
                    </div>
                </MarketingSection>

                {/* SECURITY */}
                <MarketingSection id="seguranca" maxWidth="md">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-black text-slate-900">
                            {landingContent.security.title}
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {landingContent.security.cards.map((card, i) => (
                            <div key={i} className="text-center p-6 transition-transform hover:-translate-y-1">
                                <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <card.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-3">{card.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{card.description}</p>
                            </div>
                        ))}
                    </div>
                </MarketingSection>

                {/* PRICING */}
                <MarketingSection id="precos" className="bg-slate-50/50">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl lg:text-6xl font-black text-slate-900 mb-6">
                            {landingContent.pricing.title}
                        </h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                            {landingContent.pricing.subtitle}
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-24">
                        {landingContent.pricing.plans.map((plan, i) => (
                            <PricingCard key={i} plan={plan} />
                        ))}
                    </div>

                    {/* Simple Comparison Table snippet for desktop */}
                    <div className="hidden lg:block max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-6 font-bold text-slate-900">Recurso</th>
                                    <th className="p-6 font-bold text-slate-900 text-center">Starter</th>
                                    <th className="p-6 font-bold text-blue-600 text-center bg-blue-50/30">Pro</th>
                                    <th className="p-6 font-bold text-slate-900 text-center">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {landingContent.pricing.comparison.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50">
                                        <td className="p-6 text-sm font-semibold text-slate-700">{row.feature}</td>
                                        <td className="p-6 text-sm text-slate-500 text-center">{row.starter}</td>
                                        <td className="p-6 text-sm font-bold text-blue-700 text-center bg-blue-50/10">{row.pro}</td>
                                        <td className="p-6 text-sm text-slate-500 text-center">{row.ent}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </MarketingSection>

                {/* FAQ */}
                <MarketingSection maxWidth="sm">
                    <h2 className="text-3xl lg:text-4xl font-black text-center text-slate-900 mb-16">
                        {landingContent.faq.title}
                    </h2>
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {landingContent.faq.questions.map((item, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="border rounded-2xl px-6 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <AccordionTrigger className="text-lg font-bold text-slate-900 hover:no-underline py-6">
                                    {item.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-600 leading-relaxed text-base pb-6">
                                    {item.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </MarketingSection>

                {/* FINAL CTA */}
                <MarketingSection className="bg-blue-600 text-white text-center py-20 lg:py-32">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl lg:text-7xl font-black mb-8 leading-[1.1] tracking-tighter">
                            {landingContent.finalCta.title}
                        </h2>
                        <p className="text-xl lg:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto">
                            {landingContent.finalCta.subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {landingContent.finalCta.buttons.map((btn, i) => (
                                <Link key={i} href={btn.href} className="w-full sm:w-auto">
                                    <Button
                                        size="lg"
                                        variant={btn.primary ? "default" : "outline"}
                                        className={cn(
                                            "w-full h-16 px-10 text-xl font-black transition-all",
                                            btn.primary
                                                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xl"
                                                : "bg-transparent text-white border-blue-400 hover:bg-white/10"
                                        )}
                                    >
                                        {btn.label}
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </div>
                </MarketingSection>
            </main>

            <footer className="py-12 border-t bg-white">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm font-bold text-slate-400 tracking-tighter uppercase">
                        {landingContent.nav.logo}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                        {landingContent.footer.copyright}
                    </p>
                </div>
            </footer>
        </div>
    );
}
