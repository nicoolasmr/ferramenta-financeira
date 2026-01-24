import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Filter, FileText, CheckSquare, BarChart3, ArrowRight } from "lucide-react";

export const metadata = {
    title: "Resource Center | RevenueOS",
    description: "Guias, benchmarks e ferramentas para líderes financeiros.",
};

const RESOURCES = [
    {
        title: "State of Receivables 2026",
        category: "Benchmark",
        type: "Report",
        excerpt: "Análise de 15M+ de transações mostrando as tendências de inadimplência no Brasil.",
        href: "/benchmarks/state-of-receivables-2026",
        featured: true
    },
    {
        title: "Checklist de Implantação SaaS",
        category: "Ops",
        type: "Checklist",
        excerpt: "O passo a passo definitivo para migrar seu billing sem perder dados.",
        href: "/recursos/checklist-implantacao",
        featured: false
    },
    {
        title: "Guia de Conciliação Multi-Gateway",
        category: "Finance",
        type: "Guide",
        excerpt: "Como unificar Stripe, Adyen e Itaú em um único ledger confiável.",
        href: "/recursos/guia-conciliacao",
        featured: false
    },
    // More placeholders will be replaced by real generated content
];

export default function ResourceCenter() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Hero */}
            <div className="bg-slate-900 text-white py-20 px-4 relative">
                <div className="container mx-auto max-w-6xl">
                    <Link href="/" className="absolute left-4 top-8 text-slate-500 hover:text-white transition-colors text-sm font-bold tracking-wider">
                        ← REVENUEOS
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Resource Center</h1>
                    <p className="text-xl text-slate-400 max-w-2xl mb-8">
                        A biblioteca definitiva para operadores financeiros.
                        Dados, playbooks e ferramentas para escalar sua operação.
                    </p>

                    {/* Search Bar - Visual only for now */}
                    <div className="flex gap-2 max-w-lg bg-white/10 p-2 rounded-lg border border-white/20 backdrop-blur-sm">
                        <Search className="text-white/50 m-2 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar por tópico (ex: churn, conciliação)..."
                            className="bg-transparent border-none outline-none text-white placeholder:text-white/50 flex-1 w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto max-w-6xl px-4 py-12 flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 shrink-0 space-y-8">
                    <div>
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Filter className="w-4 h-4" /> Tipo
                        </h4>
                        <div className="space-y-2">
                            {["Todos", "Guides", "Benchmarks", "Checklists", "Webinars"].map(item => (
                                <label key={item} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 cursor-pointer">
                                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-4">Tópicos</h4>
                        <div className="space-y-2">
                            {["Recebíveis", "Conciliação", "SaaS Metrics", "Compliance", "Integrações"].map(item => (
                                <label key={item} className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 cursor-pointer">
                                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                    {item}
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Resource Grid */}
                <main className="flex-1">
                    <div className="grid md:grid-cols-2 gap-6">
                        {RESOURCES.map((res, i) => (
                            <Link key={i} href={res.href} className="group">
                                <article className={`h-full bg-white p-6 rounded-xl border border-slate-200 transition-all hover:shadow-lg hover:border-blue-300 flex flex-col ${res.featured ? 'md:col-span-2 bg-gradient-to-br from-white to-blue-50/50' : ''}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${res.type === 'Report' ? 'bg-purple-100 text-purple-700' :
                                            res.type === 'Guide' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                                            }`}>
                                            {res.type}
                                        </span>
                                        <span className="text-slate-400 text-xs font-medium">{res.category}</span>
                                    </div>
                                    <h3 className={`font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors ${res.featured ? 'text-2xl' : 'text-lg'}`}>
                                        {res.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                                        {res.excerpt}
                                    </p>
                                    <div className="flex items-center text-blue-600 text-sm font-medium font-mono">
                                        Acessar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-12 flex justify-center gap-2">
                        <Button variant="outline" disabled>Anterior</Button>
                        <Button variant="outline">Próxima</Button>
                    </div>
                </main>
            </div>

            {/* Bottom CTA */}
            <section className="bg-slate-900 text-white py-16 text-center">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h2 className="text-3xl font-bold mb-4">Não encontrou o que procurava?</h2>
                    <p className="text-slate-400 mb-8">Nossos especialistas em Revenue Ops podem ajudar com sua dúvida específica.</p>
                    <div className="flex justify-center gap-4">
                        <Link href="/demo">
                            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold">Falar com Consultor</Button>
                        </Link>
                        <Link href="/ajuda">
                            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-bold">Ir para Ajuda</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
