import Link from "next/link";
import { Search } from "lucide-react";
import { HELP_CATEGORIES } from "@/lib/content/help";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Central de Ajuda | RevenueOS",
    description: "Documentação, tutoriais e suporte para usar o RevenueOS.",
};

export default function HelpCenter() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* SEARCH HERO */}
            <div className="bg-slate-900 text-white py-24 text-center">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="text-3xl md:text-4xl font-bold mb-8">Como podemos ajudar?</h1>

                    {/* Fake Search Input (Functional search can be added later) */}
                    <div className="relative max-w-xl mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-11 pr-4 py-4 rounded-xl text-slate-900 bg-white border-none focus:ring-4 focus:ring-blue-500/30 text-lg shadow-xl"
                            placeholder="Buscar artigos (ex: como integrar Stripe...)"
                        />
                    </div>
                </div>
            </div>

            {/* CATEGORIES GRID */}
            <div className="container mx-auto px-4 py-16 max-w-5xl">
                <h2 className="text-xl font-bold text-slate-900 mb-8 border-b pb-4">Tópicos de Ajuda</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {HELP_CATEGORIES.map(cat => (
                        <Link key={cat.id} href={`/ajuda?category=${cat.id}`} className="block p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group">
                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 mb-2">
                                {cat.label}
                            </h3>
                            <p className="text-sm text-slate-500">Ver artigos &rarr;</p>
                        </Link>
                    ))}
                </div>

                <div className="mt-16 p-8 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold text-blue-900 mb-2">Ainda precisa de suporte?</h3>
                        <p className="text-blue-800">Nosso time de engenharia financeira responde em até 2 horas.</p>
                    </div>
                    <Link href="mailto:suporte@revenueos.com">
                        <Button className="bg-blue-600 hover:bg-blue-700">Falar com Suporte</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
