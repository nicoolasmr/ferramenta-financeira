import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Book, Code, Terminal } from "lucide-react";

export const metadata = {
    title: "Documentação API | RevenueOS",
    description: "Referência completa da API REST e Webhooks."
};

export default function ApiDocs() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Hero */}
            <div className="bg-slate-900 text-white py-24">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-300 px-3 py-1 rounded-full text-xs font-mono mb-6 uppercase tracking-wider border border-blue-500/20">
                        v1.0.0 Stable
                    </div>
                    <h1 className="text-5xl font-bold mb-6 tracking-tight">Documentação da API</h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
                        Integre o RevenueOS ao seu produto em minutos. RESTful, webhooks tipados e SDKs prontos para produção.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/docs/guides/api-reference">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Ver Referência Completa</Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-20 max-w-6xl">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6 text-blue-600">
                            <Book className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Guias Rápidos</h3>
                        <p className="text-slate-500 mb-6">Tutoriais passo a passo para autenticação, criação de clientes e assinaturas.</p>
                        <Link href="/docs/guides/quickstart" className="text-blue-600 font-medium hover:underline">Ler Guias &rarr;</Link>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6 text-purple-600">
                            <Terminal className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Referência API</h3>
                        <p className="text-slate-500 mb-6">Endpoints, parâmetros, códigos de erro e exemplos de response JSON.</p>
                        <Link href="/docs/guides/api-reference" className="text-blue-600 font-medium hover:underline">Explorar Endpoints &rarr;</Link>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                        <div className="bg-emerald-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6 text-emerald-600">
                            <Code className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold mb-3">SDKs & Libraries</h3>
                        <p className="text-slate-500 mb-6">Bibliotecas oficiais para Node.js, Python, Ruby e PHP.</p>
                        <Link href="/docs/guides/sdks" className="text-blue-600 font-medium hover:underline">Ver SDKs &rarr;</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
