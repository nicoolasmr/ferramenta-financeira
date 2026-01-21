import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTABox({ title, subtitle }: { title?: string, subtitle?: string }) {
    return (
        <div className="my-10 p-10 rounded-2xl bg-slate-900 text-white text-center border border-slate-800 shadow-2xl relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -z-10"></div>

            <h3 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">{title || "Pronto para escalar sua operação?"}</h3>
            <p className="text-slate-300 mb-8 max-w-lg mx-auto text-lg leading-relaxed">{subtitle || "Junte-se a empresas que já automatizaram milhões em recebíveis."}</p>

            <div className="flex justify-center">
                <Link href="/precos">
                    <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg px-8 py-6 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105">
                        Comece agora
                    </Button>
                </Link>
            </div>

            <p className="mt-6 text-xs text-slate-500 uppercase tracking-widest font-semibold">
                Setup em menos de 5 minutos
            </p>
        </div>
    );
}
