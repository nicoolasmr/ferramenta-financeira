import Link from "next/link";
import { Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-16">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-2">
                        <Link href="/" className="text-2xl font-bold text-white mb-6 block">
                            REVENUEOS
                        </Link>
                        <p className="max-w-sm mb-6">
                            O sistema operacional financeiro para empresas de SaaS que buscam previsibilidade e escala.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></Link>
                            <Link href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></Link>
                            <Link href="#" className="hover:text-white transition-colors"><Github className="w-5 h-5" /></Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Produto</h4>
                        <ul className="space-y-3">
                            <li><Link href="/precos" className="hover:text-white transition-colors">Preços</Link></li>
                            <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="/ajuda" className="hover:text-white transition-colors">Central de Ajuda</Link></li>
                            <li><Link href="/recursos" className="hover:text-white transition-colors">Resource Center</Link></li>
                            <li><Link href="/benchmarks" className="hover:text-white transition-colors">Benchmarks 2026</Link></li>
                            <li><Link href="/cases" className="hover:text-white transition-colors">Estudos de Caso</Link></li>
                            <li><Link href="/docs" className="hover:text-white transition-colors">Documentação API</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Legal</h4>
                        <ul className="space-y-3">
                            <li><Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link></li>
                            <li><Link href="/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link></li>
                            <li><Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-800 pt-8 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center">
                    <p>&copy; {new Date().getFullYear()} RevenueOS. Todos os direitos reservados.</p>
                    <p className="mt-4 md:mt-0">Feito com ❤️ para fundadores.</p>
                </div>
            </div>
        </footer>
    );
}
