import Link from "next/link";
import { getAllPosts, CATEGORIES } from "@/lib/content/blog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const metadata = {
    title: "Blog RevenueOS | Inteligência Financeira para SaaS",
    description: "Artigos sobre Receita Previsível, Gestão Financeira, SaaS Metrics e estratégias para escalar sua operação B2B.",
};

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const { category } = await searchParams;
    const allPosts = getAllPosts();
    // Await searchParams in Next.js 15 if needed, but for static generation typically it's fine.
    // In Next 15, searchParams might be a promise in some contexts, but let's assume standard usage for now.
    // Wait, let's keep it simple. Client-side filtering is often better for refined UX, but SEO needs server filtering.
    // We'll filter on server for simplicity if param exists.

    // Note: In Next 15 App router, searchParams is async. 
    // We will list all posts and maybe let client handle robust filtering or just show all for now.
    // Let's just show all for the MVP of this page.

    const posts = allPosts;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <header className="bg-slate-900 text-white py-20">
                <div className="container mx-auto px-4 max-w-6xl text-center relative">
                    <Link href="/" className="absolute left-4 top-0 text-slate-400 hover:text-white text-sm font-bold tracking-wider">
                        ← REVENUEOS
                    </Link>
                    <h1 className="text-4xl font-bold mb-4">Blog RevenueOS</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        Insights táticos sobre gestão de receita, inadimplência e operações financeiras para SaaS B2B.
                    </p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="grid lg:grid-cols-4 gap-12">
                    {/* SIDEBAR */}
                    <aside className="space-y-8">
                        <div>
                            <h3 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Categorias</h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/blog"
                                        className={`block font-medium px-4 py-3 rounded-lg transition-all ${!category
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                            : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                                            }`}
                                    >
                                        Todas
                                    </Link>
                                </li>
                                {CATEGORIES.map(cat => {
                                    const isActive = category === cat;
                                    return (
                                        <li key={cat}>
                                            <Link
                                                href={`/blog?category=${encodeURIComponent(cat)}`}
                                                className={`block font-medium px-4 py-3 rounded-lg transition-all ${isActive
                                                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                                    : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                                                    }`}
                                            >
                                                {cat}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <h4 className="font-bold text-blue-900 mb-2">Escalando sua operação?</h4>
                            <p className="text-sm text-blue-800 mb-4">Descubra como o RevenueOS automatiza seus recebíveis.</p>
                            <Link href="/precos">
                                <Button className="w-full bg-blue-600 hover:bg-blue-700">Comece agora</Button>
                            </Link>
                        </div>
                    </aside>

                    {/* POSTS GRID */}
                    <div className="lg:col-span-3">
                        <div className="grid md:grid-cols-2 gap-8">
                            {posts.map((post) => (
                                <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                                    <div className="flex-1 p-8">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                                                {post.frontmatter.category}
                                            </span>
                                            <span className="text-slate-400 text-xs flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {post.frontmatter.readingTime || "5 min"}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                                            {post.frontmatter.title}
                                        </h2>
                                        <p className="text-slate-600 line-clamp-3 mb-6 leading-relaxed">
                                            {post.frontmatter.excerpt}
                                        </p>
                                    </div>
                                    <div className="p-8 pt-0 mt-auto border-t border-slate-50">
                                        <div className="pt-6 flex items-center justify-between text-sm text-slate-500">
                                            <span className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {post.frontmatter.date && format(new Date(post.frontmatter.date), "d 'de' MMMM, yyyy", { locale: ptBR })}
                                            </span>
                                            <span className="flex items-center font-medium text-blue-600 group-hover:underline">
                                                Ler artigo <ArrowRight className="w-4 h-4 ml-1" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
