import Link from "next/link";
import { Search, FileText, ChevronRight } from "lucide-react";
import { HELP_CATEGORIES, getAllHelpArticles } from "@/lib/content/help";
import { Button } from "@/components/ui/button";

export const metadata = {
    title: "Central de Ajuda | RevenueOS",
    description: "Documentação, tutoriais e suporte para usar o RevenueOS.",
};

export default async function HelpCenter({ searchParams }: { searchParams: { category?: string } }) {
    // In Next 15, we might need to await searchParams. 
    // Ideally we treat it as potentially async or just access it.
    // For safety in this environment, let's treat it as an object for now, 
    // but if it's a Promise in strict Next 15, we'd need `await searchParams`.
    const { category } = await searchParams || {};

    const allArticles = getAllHelpArticles();
    const filteredArticles = category
        ? allArticles.filter(a => a.frontmatter.category === HELP_CATEGORIES.find(c => c.id === category)?.label)
        : [];

    const selectedCategory = category ? HELP_CATEGORIES.find(c => c.id === category) : null;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* SEARCH HERO */}
            <div className="bg-slate-900 text-white py-20 text-center">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="text-3xl font-bold mb-6">
                        {selectedCategory ? `${selectedCategory.label}` : "Como podemos ajudar?"}
                    </h1>

                    {/* Simplified Search/Nav for context */}
                    {selectedCategory && (
                        <Link href="/ajuda" className="text-slate-400 hover:text-white text-sm mb-4 inline-block">
                            &larr; Voltar para todas as categorias
                        </Link>
                    )}

                    {!selectedCategory && (
                        <div className="relative max-w-xl mx-auto">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-4 py-4 rounded-xl text-slate-900 bg-white border-none focus:ring-4 focus:ring-blue-500/30 text-lg shadow-xl"
                                placeholder="Buscar artigos..."
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-5xl">
                {selectedCategory ? (
                    /* ARTICLES LIST VIEW */
                    <div className="space-y-6">
                        {filteredArticles.length > 0 ? (
                            filteredArticles.map(article => (
                                <Link key={article.slug} href={`/ajuda/${article.slug}`} className="block p-6 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 mb-1">{article.frontmatter.title}</h3>
                                                <p className="text-slate-500 text-sm line-clamp-1">{article.frontmatter.excerpt}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-slate-300" />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                <p>Nenhum artigo encontrado nesta categoria.</p>
                                <Link href="/ajuda" className="text-blue-600 hover:underline mt-2 inline-block">Voltar ao início</Link>
                            </div>
                        )}
                    </div>
                ) : (
                    /* CATEGORIES GRID VIEW */
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-8 border-b pb-4">Navegar por Tópicos</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {HELP_CATEGORIES.map(cat => (
                                <Link key={cat.id} href={`/ajuda?category=${cat.id}`} className="block p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all group">
                                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 mb-2">
                                        {cat.label}
                                    </h3>
                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                        {allArticles.filter(a => a.frontmatter.category === cat.label).length} artigos
                                        <ChevronRight className="w-3 h-3" />
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* SUPPORT BOX */}
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
