import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONTENT_DIR = path.join(process.cwd(), "content/cases");

export async function generateStaticParams() {
    const files = fs.readdirSync(CONTENT_DIR);
    return files
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => ({
            slug: file.replace(/\.mdx$/, ""),
        }));
}

async function getCase(slug: string) {
    try {
        const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const { data, content } = matter(fileContent);
        return { frontmatter: data, content };
    } catch {
        return null;
    }
}

export default async function CasePage({ params }: { params: { slug: string } }) {
    const caseStudy = await getCase(params.slug);

    if (!caseStudy) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white font-sans">
            <div className="bg-slate-50 border-b py-6">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link href="/cases" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para Estudos de Caso
                    </Link>
                    <div className="mt-4">
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase rounded mb-4">
                            Case Study
                        </span>
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">{caseStudy.frontmatter.title}</h1>
                        {caseStudy.frontmatter.client && (
                            <p className="text-lg text-slate-600">Cliente: {caseStudy.frontmatter.client}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl py-12">
                <article className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-blue-600 hover:prose-a:text-blue-700">
                    <MDXRemote source={caseStudy.content} />
                </article>

                <div className="mt-16 p-8 bg-blue-600 text-white rounded-2xl text-center">
                    <h3 className="text-2xl font-bold mb-4">Sua história é a próxima?</h3>
                    <p className="text-blue-100 mb-6">Descubra como o RevenueOS pode transformar sua operação financeira.</p>
                    <Link href="/precos">
                        <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
                            Começar Agora
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
