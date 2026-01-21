import { getHelpArticleBySlug, getAllHelpArticles } from "@/lib/content/help";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Components
import { Callout } from "@/components/mdx/Callout";
import { ScreenshotFrame } from "@/components/mdx/ScreenshotFrame";

const components = {
    Callout,
    ScreenshotFrame
};

export async function generateStaticParams() {
    const articles = getAllHelpArticles();
    return articles.map((doc) => ({
        slug: doc.slug,
    }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const doc = getHelpArticleBySlug(slug);
    if (!doc) return {};

    return {
        title: `${doc.frontmatter.title} | Central de Ajuda RevenueOS`,
        description: doc.frontmatter.excerpt,
    };
}

export default async function HelpArticle({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const doc = getHelpArticleBySlug(slug);

    if (!doc) {
        notFound();
    }

    return (
        <article className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 py-10">
                <div className="container mx-auto px-4 max-w-4xl">
                    <nav className="flex items-center text-sm text-slate-500 mb-6">
                        <Link href="/ajuda" className="hover:text-blue-600 flex items-center transition-colors">
                            <ChevronLeft className="w-4 h-4 mr-1" /> Central de Ajuda
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="text-slate-900 font-medium">{doc.frontmatter.category}</span>
                    </nav>
                    <h1 className="text-3xl font-bold text-slate-900">
                        {doc.frontmatter.title}
                    </h1>
                </div>
            </header>

            {/* Content */}
            <div className="container mx-auto px-4 max-w-4xl mt-12 bg-white p-10 rounded-2xl shadow-sm border border-slate-200">
                <div className="prose prose-slate prose-blue max-w-none">
                    <MDXRemote source={doc.content} components={components} />
                </div>

                <hr className="my-10 border-slate-100" />

                <p className="text-sm text-slate-500 text-center">
                    Última atualização: {doc.frontmatter.updatedAt}
                </p>
            </div>
        </article>
    );
}
