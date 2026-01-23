import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, PieChart, ArrowUpRight } from "lucide-react";

export const metadata = {
    title: "Benchmarks SaaS 2026 | RevenueOS",
    description: "Dados proprietários sobre churn, inadimplência e eficiência financeira no Brasil.",
};

export default function BenchmarksPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <div className="bg-slate-900 text-white py-24 px-4 overflow-hidden relative">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/40 to-transparent"></div>

                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-6">
                        <BarChart3 className="w-3 h-3" /> Data Report 2026
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">SaaS Intelligence</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed">
                        Analisamos 15 milhões de transações anonimizadas para trazer os benchmarks definitivos de performance financeira para startups na América Latina.
                    </p>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg">
                        Baixar Report Completo (PDF)
                    </Button>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4 py-20">
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="w-32 h-32 text-blue-600" />
                        </div>
                        <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-2">Inadimplência Média (B2B)</h3>
                        <p className="text-4xl font-bold text-slate-900 mb-4">2.4%</p>
                        <p className="text-sm text-slate-600">Empresas com RevenueOS reduzem este número para 0.8% em 90 dias.</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-2">Recovered Revenue</h3>
                        <p className="text-4xl font-bold text-emerald-600 mb-4">$12M+</p>
                        <p className="text-sm text-slate-600">Receita recuperada automaticamente via Dunning inteligente em 2025.</p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-2">Churn Rate (Annual)</h3>
                        <p className="text-4xl font-bold text-slate-900 mb-4">11.5%</p>
                        <p className="text-sm text-slate-600">Abaixo da média global de 14%. O mercado brasileiro está retendo mais.</p>
                    </div>
                </div>

                <h2 className="text-3xl font-bold mb-10">Reports Disponíveis</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <Link href="#" className="group">
                        <div className="aspect-video bg-slate-200 rounded-xl mb-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white font-bold flex items-center gap-2">Ler Report <ArrowUpRight /></span>
                            </div>
                            <div className="flex h-full items-center justify-center text-slate-400 font-mono text-xs uppercase">Cover Image: State of Receivables</div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600">State of Receivables 2026</h3>
                        <p className="text-slate-600">Guia de previsibilidade e eficiência de caixa.</p>
                    </Link>

                    <Link href="#" className="group">
                        <div className="aspect-video bg-slate-200 rounded-xl mb-4 relative overflow-hidden">
                            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white font-bold flex items-center gap-2">Ler Report <ArrowUpRight /></span>
                            </div>
                            <div className="flex h-full items-center justify-center text-slate-400 font-mono text-xs uppercase">Cover Image: API Economy</div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600">The API Economy in Latam</h3>
                        <p className="text-slate-600">Como interfaces financeiras estão comendo o mundo.</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
