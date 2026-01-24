import { getPostBySlug, getAllPosts } from "@/lib/content/blog";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { ChevronLeft, Calendar, User, Clock } from "lucide-react";

// Components for MDX
import { CTABox } from "@/components/mdx/CTABox";
import { Callout } from "@/components/mdx/Callout";
import { ScreenshotFrame } from "@/components/mdx/ScreenshotFrame";

const components = {
    CTABox,
    Callout,
    ScreenshotFrame
};

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (!post) return {};

    return {
        title: `${post.frontmatter.title} | Blog RevenueOS`,
        description: post.frontmatter.excerpt,
        openGraph: {
            title: post.frontmatter.title,
            description: post.frontmatter.excerpt,
            type: "article",
            publishedTime: post.frontmatter.date,
            authors: ["RevenueOS Team"],
        },
        twitter: {
            card: "summary_large_image",
            title: post.frontmatter.title,
            description: post.frontmatter.excerpt,
        }
    };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
    const { slug } = await params; // Next 15 await
    const post = getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    // JSON-LD for SEO
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.frontmatter.title,
        "description": post.frontmatter.excerpt,
        "datePublished": post.frontmatter.date,
        "dateModified": post.frontmatter.updatedAt || post.frontmatter.date,
        "author": {
            "@type": "Organization",
            "name": "RevenueOS"
        }
    };

    return (
        <article className="min-h-screen bg-white font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-200 py-16">
                <div className="container mx-auto px-4 max-w-3xl">
                    <div className="flex items-center gap-4 text-sm font-medium text-slate-500 mb-8">
                        <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
                        <span className="text-slate-300">/</span>
                        <Link href="/blog" className="hover:text-slate-900 transition-colors">Blog</Link>
                    </div>
                    <div className="flex gap-4 items-center mb-6">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            {post.frontmatter.category}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                        {post.frontmatter.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {post.frontmatter.date && format(new Date(post.frontmatter.date), "d 'de' MMMM, yyyy", { locale: ptBR })}
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {post.frontmatter.readingTime || "5 min de leitura"}
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            RevenueOS Team
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 max-w-4xl py-12 md:py-20">
                <div className="prose prose-slate prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-img:rounded-2xl prose-img:shadow-lg prose-p:leading-loose prose-li:leading-loose text-slate-700">
                    <MDXRemote source={post.content} components={components} />
                </div>

                {/* Horizontal Rule */}
                <hr className="my-12 border-slate-200" />

                {/* Tags */}
                {post.frontmatter.tags && (
                    <div className="flex flex-wrap gap-2 mb-12">
                        {post.frontmatter.tags.map(tag => (
                            <span key={tag} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-sm font-medium">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Bottom CTA */}
                <CTABox title="Gostou desse conteúdo?" subtitle="Assine nossa newsletter ou comece a organizar sua receita hoje mesmo." />
            </div>
        </article>
    );
}
