import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Estudos de Caso | RevenueOS",
    description: "Como empresas de alta performance escalam suas operações financeiras.",
};

const CASES = [
    {
        client: "FintechX",
        sector: "Banking as a Service",
        result: "Escalou de 10k para 100k transações/mês sem aumentar o time financeiro.",
        quote: "O RevenueOS é a única ferramenta que aguenta nossa volumetria.",
        logo: "F",
        color: "bg-indigo-600"
    },
    {
        client: "SaaSHealth",
        sector: "Healthtech",
        result: "Reduziu o tempo de fechamento contábil de 10 dias para 4 horas.",
        quote: "Auditoria agora é um processo de um clique.",
        logo: "S",
        color: "bg-emerald-600"
    },
    {
        client: "EduTech Pro",
        sector: "Education",
        result: "Recuperou R$ 1.5M em revenue leakage de taxas de cartão.",
        quote: "O ROI foi pago na primeira semana de uso.",
        logo: "E",
        color: "bg-blue-600"
    }
];

export default function CasesPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            <div className="bg-slate-50 py-24 px-4 text-center border-b">
                <div className="container mx-auto max-w-4xl">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900">Histórias de Sucesso</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
                        Descubra como os times financeiros mais eficientes do Brasil usam tecnologia para eliminar trabalho manual.
                    </p>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4 py-20">
                <div className="grid gap-12">
                    {CASES.map((story, i) => (
                        <div key={i} className="flex flex-col md:flex-row gap-8 items-center bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                            <div className={`w-full md:w-1/3 aspect-square rounded-2xl flex items-center justify-center text-white text-9xl font-bold ${story.color}`}>
                                {story.logo}
                            </div>
                            <div className="flex-1 text-left">
                                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{story.sector}</div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-4">{story.client}</h2>
                                <p className="text-xl text-slate-700 font-medium mb-6 leading-relaxed">
                                    "{story.result}"
                                </p>
                                <blockquote className="border-l-4 border-slate-200 pl-4 italic text-slate-500 mb-8">
                                    {story.quote}
                                </blockquote>
                                <Button variant="outline" className="border-slate-300">Ler Estudo Completo</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <section className="bg-blue-600 text-white py-24 text-center">
                <h2 className="text-3xl font-bold mb-6">Sua história é a próxima?</h2>
                <Link href="/precos">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">Começar Agora</Button>
                </Link>
            </section>
        </div>
    );
}
