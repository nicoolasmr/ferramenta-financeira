import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONTENT_DIR = path.join(process.cwd(), "content/resources");

export async function generateStaticParams() {
    const files = fs.readdirSync(CONTENT_DIR);
    return files
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => ({
            slug: file.replace(/\.mdx$/, ""),
        }));
}

async function getResource(slug: string) {
    try {
        const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const { data, content } = matter(fileContent);
        return { frontmatter: data, content };
    } catch {
        return null;
    }
}

export default async function ResourcePage({ params }: { params: { slug: string } }) {
    const resource = await getResource(params.slug);

    if (!resource) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white font-sans">
            <div className="bg-slate-50 border-b py-6">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link href="/recursos" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para Resource Center
                    </Link>
                    <div className="mt-4">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold uppercase rounded mb-4">
                            {resource.frontmatter.type || "Resource"}
                        </span>
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">{resource.frontmatter.title}</h1>
                        {resource.frontmatter.excerpt && (
                            <p className="text-xl text-slate-600">{resource.frontmatter.excerpt}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl py-12">
                <article className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-blue-600 hover:prose-a:text-blue-700">
                    <MDXRemote source={resource.content} />
                </article>

                <div className="mt-16 p-8 bg-slate-900 text-white rounded-2xl text-center">
                    <h3 className="text-2xl font-bold mb-4">Pronto para começar?</h3>
                    <p className="text-slate-400 mb-6">Implemente essas estratégias no RevenueOS hoje mesmo.</p>
                    <Link href="/precos">
                        <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600">
                            Começar Grátis
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
