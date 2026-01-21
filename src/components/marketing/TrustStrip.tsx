import { Quote, TrendingUp, Zap, Shield, Users } from "lucide-react";

const LOGOS = [
    { name: "FintechX", bg: "bg-indigo-900" },
    { name: "SaaSHealth", bg: "bg-emerald-900" },
    { name: "EduTech", bg: "bg-blue-900" },
    { name: "LogiPro", bg: "bg-orange-900" },
    { name: "CloudScale", bg: "bg-purple-900" },
    { name: "AgroData", bg: "bg-green-900" },
];

const METRICS = [
    { label: "Receita Processada", value: "R$ 2.5B+", icon: TrendingUp },
    { label: "Eventos / Segundo", value: "10k+", icon: Zap },
    { label: "Uptime (SLA)", value: "99.99%", icon: Shield },
    { label: "Devs ativos", value: "5.000+", icon: Users },
];

export function TrustStrip() {
    return (
        <section className="border-y border-slate-100 bg-slate-50/50">
            {/* Logos */}
            <div className="container mx-auto px-4 py-12">
                <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">
                    A infraestrutura financeira de 500+ empresas de alta performance
                </p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    {LOGOS.map((logo, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-md ${logo.bg}`}></div>
                            <span className="font-bold text-slate-700 text-lg">{logo.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Metrics Strip */}
            <div className="bg-white py-12 border-t border-slate-200">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {METRICS.map((m, i) => (
                            <div key={i} className="text-center border-r border-slate-100 last:border-0">
                                <div className="flex justify-center mb-2 text-blue-600">
                                    <m.icon className="w-6 h-6" />
                                </div>
                                <div className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{m.value}</div>
                                <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">{m.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonial Placeholder */}
            <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
                <Quote className="w-12 h-12 text-blue-100 mx-auto mb-6" />
                <h2 className="text-2xl md:text-4xl font-medium text-slate-900 mb-8 leading-tight">
                    "Reduzimos nosso ciclo de fechamento contábil de 15 dias para <span className="text-blue-600 font-bold">4 horas</span>. O RevenueOS eliminou o 'Excel Hell' da nossa operação."
                </h2>
                <div className="flex items-center justify-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <div className="text-left">
                        <div className="font-bold text-slate-900">Fernanda Torres</div>
                        <div className="text-slate-500 text-sm">CFO, FintechX</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
