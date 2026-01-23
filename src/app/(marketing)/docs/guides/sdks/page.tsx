import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Github } from "lucide-react";

export default function SdksPage() {
    return (
        <div>
            <h1>SDKs & Bibliotecas</h1>
            <p className="lead">Desenvolva mais rápido com nossas bibliotecas oficiais e tipadas.</p>

            <div className="grid md:grid-cols-2 gap-6 my-10">
                {/* Node.js */}
                <div className="border rounded-xl p-6 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg m-0">Node.js</h3>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">v2.4.0</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Suporte total a TypeScript e Promises.</p>
                    <pre className="bg-slate-100 p-2 rounded text-xs mb-4">npm install revenueos-node</pre>
                    <Link href="https://github.com/revenueos/revenueos-node">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                            <Github className="w-4 h-4" /> Ver no GitHub
                        </Button>
                    </Link>
                </div>

                {/* Python */}
                <div className="border rounded-xl p-6 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg m-0">Python</h3>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">v1.8.2</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Compatível com Python 3.6+. Sync e Async (httpx).</p>
                    <pre className="bg-slate-100 p-2 rounded text-xs mb-4">pip install revenueos</pre>
                    <Link href="https://github.com/revenueos/revenueos-python">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                            <Github className="w-4 h-4" /> Ver no GitHub
                        </Button>
                    </Link>
                </div>

                {/* PHP */}
                <div className="border rounded-xl p-6 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg m-0">PHP</h3>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">v1.0.1</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Compatível com Laravel e Symfony. Composer ready.</p>
                    <pre className="bg-slate-100 p-2 rounded text-xs mb-4">composer require revenueos/php</pre>
                    <Link href="https://github.com/revenueos/revenueos-php">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                            <Github className="w-4 h-4" /> Ver no GitHub
                        </Button>
                    </Link>
                </div>

                {/* Go */}
                <div className="border rounded-xl p-6 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg m-0">Go</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">Beta</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-4">Idiomatic Go client. Context aware.</p>
                    <pre className="bg-slate-100 p-2 rounded text-xs mb-4">go get github.com/revenueos/go</pre>
                    <Link href="https://github.com/revenueos/revenueos-go">
                        <Button variant="outline" size="sm" className="w-full gap-2">
                            <Github className="w-4 h-4" /> Ver no GitHub
                        </Button>
                    </Link>
                </div>
            </div>

            <h2>Contribua</h2>
            <p>Nossas bibliotecas são Open Source. Encontrou um bug? Abra uma Issue ou um PR.</p>
        </div>
    );
}
