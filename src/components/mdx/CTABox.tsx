import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTABox({ title, subtitle }: { title?: string, subtitle?: string }) {
    return (
        <div className="my-10 p-8 rounded-2xl bg-slate-900 text-white text-center border border-slate-700 shadow-xl">
            <h3 className="text-2xl font-bold mb-3">{title || "Recebíveis sob controle. Sem planilhas."}</h3>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">{subtitle || "Comece agora e veja seu fluxo de caixa ficar previsível em minutos."}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                    <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold w-full sm:w-auto">
                        Começar grátis
                    </Button>
                </Link>
                <Link href="/demo">
                    <Button variant="outline" size="lg" className="text-white border-slate-600 hover:bg-slate-800 w-full sm:w-auto">
                        Agendar demo
                    </Button>
                </Link>
            </div>
        </div>
    );
}
