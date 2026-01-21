import Link from "next/link";
import { Check, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { landingContent } from "@/content/landingContent";

export const metadata = {
    title: "Planos e Preços | RevenueOS",
    description: "Escolha o plano ideal para escalar sua operação financeira e reduzir a inadimplência.",
};

export default function PricingPage() {
    const { pricing, faq } = landingContent;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* HERO */}
            <header className="bg-slate-900 text-white py-24 text-center relative">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link href="/" className="absolute left-4 top-8 text-slate-500 hover:text-white transition-colors text-sm font-bold tracking-wider">
                        ← REVENUEOS
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Investimento que se paga no primeiro mês</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        Pare de perder dinheiro com inadimplência invisível. Escolha o plano que se adapta ao seu volume.
                    </p>
                </div>
            </header>

            {/* PRICING CARDS */}
            <section className="container mx-auto px-4 py-16 max-w-6xl -mt-20">
                <div className="grid md:grid-cols-3 gap-8">
                    {pricing.plans.map((plan) => (
                        <div key={plan.name} className={`relative bg-white rounded-2xl p-8 shadow-xl border-2 flex flex-col ${plan.highlight ? 'border-blue-500 scale-105 z-10' : 'border-slate-100'}`}>
                            {plan.highlight && (
                                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                    {plan.highlight}
                                </div>
                            )}
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                <p className="text-sm text-slate-500 mt-2 h-10">{plan.desc}</p>
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                                <span className="text-slate-500">{plan.period}</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                                        <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link href={plan.ctaLink || "#"}>
                                <Button className={`w-full font-bold ${plan.highlight ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                                    {plan.cta}
                                    {plan.highlight && <ArrowRight className="w-4 h-4 ml-2" />}
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* COMPARISON TABLE */}
            <section className="container mx-auto px-4 py-16 max-w-5xl">
                <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Comparativo Detalhado</h2>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-6 text-sm font-bold text-slate-500 uppercase">Recurso</th>
                                <th className="p-6 text-sm font-bold text-slate-900">Starter</th>
                                <th className="p-6 text-sm font-bold text-blue-600">Pro</th>
                                <th className="p-6 text-sm font-bold text-slate-900">Enterprise</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pricing.comparison.map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-6 text-sm font-medium text-slate-700">{row.feature}</td>
                                    <td className="p-6 text-sm text-slate-600">{row.starter}</td>
                                    <td className="p-6 text-sm font-bold text-slate-900">{row.pro}</td>
                                    <td className="p-6 text-sm text-slate-600">{row.ent}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* FAQ */}
            <section className="container mx-auto px-4 py-16 max-w-3xl">
                <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Dúvidas Comuns</h2>
                <div className="space-y-6">
                    {faq.questions.map((item, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors">
                            <h3 className="flex items-center gap-3 font-bold text-lg text-slate-900 mb-3">
                                <HelpCircle className="w-5 h-5 text-blue-500" />
                                {item.q}
                            </h3>
                            <p className="text-slate-600 leading-relaxed pl-8">
                                {item.a}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="bg-slate-900 py-24 text-center text-white">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-3xl font-bold mb-6">Pronto para assumir o controle?</h2>
                    <p className="text-xl text-slate-400 mb-8">
                        Comece hoje e veja a diferença no seu caixa já no próximo mês.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/signup">
                            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8">
                                Criar conta grátis
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="border-slate-600 hover:bg-slate-800 text-white">
                                Falar com Vendas
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
