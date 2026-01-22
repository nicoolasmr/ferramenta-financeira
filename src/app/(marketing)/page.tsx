
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { landingContent } from "@/content/landingContent";
import { ArrowRight, CheckCircle2, Menu, Zap } from "lucide-react";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { ProductTour } from "@/components/marketing/ProductTour";

export const metadata = {
    title: "RevenueOS - O Sistema Operacional Financeiro para SaaS Moderno",
    description: landingContent.hero.subheadline,
};

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col font-sans text-slate-900">
            {/* HEADER */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
                        {/* Simple Logo Placeholder */}
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold">
                            R
                        </div>
                        {landingContent.nav.logo}
                    </div>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                        {landingContent.nav.links.map((link) => (
                            <Link key={link.label} href={link.href} className="hover:text-slate-900 transition-colors">
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link href={landingContent.nav.ctaSecondary.href} className="text-sm font-medium text-slate-600 hover:text-slate-900 hidden sm:block">
                            {landingContent.nav.ctaSecondary.label}
                        </Link>
                        <Link href={landingContent.nav.ctaPrimary.href}>
                            <Button>{landingContent.nav.ctaPrimary.label}</Button>
                        </Link>
                        {/* Mobile Menu Trigger Placeholder */}
                        <button className="md:hidden text-slate-600">
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* HERO SECTION */}
                <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-slate-50">
                    <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>
                    <div className="container relative mx-auto max-w-6xl px-4 text-center">
                        <div className="mx-auto mb-6 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-slate-200 bg-white px-7 py-2 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-sm font-semibold text-slate-700">
                                Novo: Data Truth Layer
                            </p>
                        </div>

                        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight">
                            {landingContent.hero.headline}
                        </h1>

                        <p className="mx-auto max-w-2xl text-lg text-slate-600 mb-10 leading-relaxed">
                            {landingContent.hero.subheadline}
                        </p>

                        {/* Bullets */}
                        <div className="flex flex-wrap justify-center gap-4 mb-10 text-sm font-medium text-slate-700">
                            {landingContent.hero.bullets.map((bullet, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border shadow-sm">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    {bullet}
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                            <Link href={landingContent.hero.ctaPrimary.href}>
                                <Button size="lg" className="h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all">
                                    {landingContent.hero.ctaPrimary.label} <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/demo">
                                <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-white text-slate-900 hover:bg-slate-50">
                                    Ver demo
                                </Button>
                            </Link>
                        </div>

                        {/* Dashboard Preview */}
                        <div className="relative mx-auto max-w-4xl rounded-2xl border bg-slate-900 p-2 lg:p-4 shadow-2xl">
                            <div className="aspect-[16/9] bg-slate-800 rounded-xl overflow-hidden shadow-inner">
                                <img
                                    src={landingContent.hero.dashboardImage}
                                    alt="RevenueOS Dashboard Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* TRUST STRIP */}
                <TrustStrip />

                {/* PROBLEMS SECTION */}
                <section className="py-20 bg-white">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                                {landingContent.problems.title}
                            </h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {landingContent.problems.cards.map((card, i) => (
                                <div key={i} className="bg-slate-50 p-8 rounded-2xl border border-transparent hover:border-slate-200 transition-colors">
                                    <div className="h-12 w-12 bg-white text-slate-900 rounded-xl flex items-center justify-center mb-6 shadow-sm border">
                                        <card.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{card.title}</h3>
                                    <p className="text-slate-600 leading-relaxed text-sm">
                                        {card.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PRODUCT TOUR */}
                <ProductTour />

                {/* DATA TRUTH LAYER */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-6">{landingContent.dataTruth.title}</h2>
                                <p className="text-slate-600 mb-8 text-lg">{landingContent.dataTruth.description}</p>
                                <ul className="space-y-4 mb-8">
                                    {landingContent.dataTruth.bullets.map((bullet, i) => (
                                        <li key={i} className="flex gap-3 items-start">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                                            <span className="text-slate-700 font-medium">{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link href={landingContent.dataTruth.cta.href}>
                                    <Button variant="outline" className="h-10 px-6">{landingContent.dataTruth.cta.label}</Button>
                                </Link>
                            </div>
                            <div className="bg-white p-2 rounded-xl border shadow-lg -rotate-1 hover:rotate-0 transition-transform duration-500">
                                <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center border border-dashed border-slate-300">
                                    <p className="text-slate-400 font-medium text-sm">Screenshot: Reconciliation Delta Visual</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES (JOBS) */}
                <section id="produto" className="py-24 bg-white">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                                {landingContent.features.title}
                            </h2>
                            <p className="mt-4 text-lg text-slate-600">
                                {landingContent.features.subtitle}
                            </p>
                        </div>
                        <div className="space-y-24">
                            {landingContent.features.blocks.map((block, i) => (
                                <div key={i}>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-8 border-l-4 border-blue-600 pl-4">
                                        {block.title}
                                    </h3>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {block.items.map((item, j) => (
                                            <div key={j} className="group p-6 rounded-xl border bg-white hover:border-blue-200 transition-all hover:shadow-md">
                                                <div className="mb-4 p-3 bg-blue-50 text-blue-600 rounded-lg w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                    <item.icon className="w-6 h-6" />
                                                </div>
                                                <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                                                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* INTEGRATIONS */}
                <section id="integracoes" className="py-24 bg-slate-50 border-t">
                    <div className="container mx-auto max-w-5xl px-4 text-center">
                        <h2 className="text-3xl font-bold text-slate-900 mb-12">{landingContent.integrations.title}</h2>
                        <div className="grid md:grid-cols-3 gap-8 mb-16">
                            {landingContent.integrations.tier1.map((integ, i) => (
                                <div key={i} className="bg-white p-8 rounded-xl border shadow-sm flex flex-col items-center hover:shadow-lg transition-all hover:-translate-y-1">
                                    <div className="h-16 w-full flex items-center justify-center mb-6">
                                        {integ.isImage ? (
                                            <img src={integ.logo} alt={integ.name} className="h-12 object-contain" />
                                        ) : (
                                            <span className={`text-4xl font-bold tracking-tighter ${integ.color}`}>{integ.textLogo}</span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">{integ.name}</h3>
                                    <div className="flex gap-2 flex-wrap justify-center">
                                        {integ.tags.map(tag => (
                                            <span key={tag} className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="inline-flex flex-col items-center gap-2">
                            <div className="px-4 py-2 bg-slate-200 rounded-full text-sm text-slate-700 font-medium">
                                Em breve: {landingContent.integrations.roadmap}
                            </div>
                            <p className="text-xs text-slate-500 mt-2 font-mono">{landingContent.integrations.techProof}</p>
                        </div>
                    </div>
                </section>

                {/* AI COPILOT */}
                <section id="ia" className="py-24 bg-gradient-to-br from-indigo-900 to-slate-900 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
                    <div className="container mx-auto max-w-6xl px-4 relative z-10">
                        <div className="text-center mb-16 max-w-3xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wide mb-6">
                                <Zap className="w-3 h-3" /> Inteligência Híbrida
                            </div>
                            <h2 className="text-3xl font-bold mb-6 sm:text-4xl text-white">
                                {landingContent.copilot.headline}
                            </h2>
                            <p className="text-indigo-100 text-lg leading-relaxed">
                                {landingContent.copilot.description}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-16">
                            {landingContent.copilot.columns.map((col, i) => (
                                <div key={i} className={`p-8 rounded-2xl border ${i === 0 ? 'bg-white/10 border-white/10' : 'bg-indigo-600/10 border-indigo-500/20'}`}>
                                    <h3 className="font-bold text-lg mb-6 text-white">{col.title}</h3>
                                    <ul className="space-y-3">
                                        {col.items.map((item, j) => (
                                            <li key={j} className="flex gap-3 text-sm text-indigo-100">
                                                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {landingContent.copilot.subfeatures.map((feat, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                                    <div className="h-10 w-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                                        <feat.icon className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white text-sm">{feat.title}</h4>
                                        <p className="text-xs text-indigo-200 mt-1">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-xs text-indigo-400 mt-8 opacity-70">
                            *{landingContent.copilot.disclaimer}
                        </p>
                    </div>
                </section>

                {/* SECURITY */}
                <section id="seguranca" className="py-24 bg-slate-50 border-y border-slate-200">
                    <div className="container mx-auto max-w-5xl px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl mb-4">
                                {landingContent.security.title}
                            </h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                {landingContent.security.subtitle}
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {landingContent.security.cards.map((card, i) => (
                                <div key={i} className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-6">
                                        <card.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{card.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {card.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PRICING */}
                <section id="precos" className="py-24 bg-white">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                                {landingContent.pricing.title}
                            </h2>
                            <p className="mt-4 text-lg text-slate-600">
                                {landingContent.pricing.subtitle}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
                            {landingContent.pricing.plans.map((plan, i) => (
                                <div key={i} className={`p-8 rounded-2xl border bg-white flex flex-col relative ${plan.highlight ? 'border-2 border-indigo-600 shadow-xl scale-105' : 'border-slate-200'}`}>
                                    {plan.highlight && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                            {plan.highlight}
                                        </div>
                                    )}
                                    <h3 className="font-bold text-xl text-slate-900">{plan.name}</h3>
                                    <p className="text-slate-500 text-sm mt-2">{plan.desc}</p>
                                    <div className="my-6">
                                        <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                                        <span className="text-slate-500">{plan.period}</span>
                                    </div>
                                    <ul className="space-y-3 mb-8 flex-1">
                                        {plan.features.map((feat, j) => (
                                            <li key={j} className="flex gap-2 text-sm text-slate-600">
                                                <CheckCircle2 className={`w-4 h-4 ${plan.highlight ? 'text-indigo-500' : 'text-slate-400'}`} />
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                    <Link href={plan.ctaLink} className="w-full">
                                        <Button
                                            variant={plan.ctaVariant as "default" | "outline"}
                                            className={`w-full ${plan.highlight ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                                        >
                                            {plan.cta}
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {/* Comparison Table */}
                        <div className="max-w-4xl mx-auto overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-900 font-bold border-b">
                                    <tr>
                                        <th className="p-4">Recurso</th>
                                        <th className="p-4 text-center">Starter</th>
                                        <th className="p-4 text-center text-indigo-700">Pro</th>
                                        <th className="p-4 text-center">Enterprise</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {landingContent.pricing.comparison.map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50/50">
                                            <td className="p-4 font-medium text-slate-700">{row.feature}</td>
                                            <td className="p-4 text-center text-slate-600">{row.starter}</td>
                                            <td className="p-4 text-center text-indigo-700 font-medium">{row.pro}</td>
                                            <td className="p-4 text-center text-slate-600">{row.ent}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="py-24 bg-slate-50">
                    <div className="container mx-auto max-w-3xl px-4">
                        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
                            {landingContent.faq.title}
                        </h2>
                        <div className="space-y-4">
                            {landingContent.faq.questions.map((item, i) => (
                                <div key={i} className="bg-white p-6 rounded-lg border shadow-sm">
                                    <h4 className="font-bold text-slate-900 mb-2 text-base">{item.q}</h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="py-24 bg-slate-900 text-white text-center">
                    <div className="container mx-auto max-w-4xl px-4">
                        <h2 className="text-4xl font-bold mb-6 leading-tight">
                            {landingContent.finalCta.headline}
                        </h2>
                        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                            {landingContent.finalCta.sub}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={landingContent.finalCta.ctaPrimary.href}>
                                <Button size="lg" className="h-14 px-8 text-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-900/20">
                                    {landingContent.finalCta.ctaPrimary.label}
                                </Button>
                            </Link>
                            <Link href={landingContent.finalCta.ctaSecondary.href}>
                                <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent text-white border-slate-700 hover:bg-slate-800 hover:text-white">
                                    {landingContent.finalCta.ctaSecondary.label}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>


        </div>
    );
}
