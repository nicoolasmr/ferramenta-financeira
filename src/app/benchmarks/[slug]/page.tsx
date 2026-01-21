import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
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

async function getBenchmark(slug: string) {
    try {
        const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const { data, content } = matter(fileContent);
        return { frontmatter: data, content };
    } catch {
        return null;
    }
}

export default async function BenchmarkPage({ params }: { params: { slug: string } }) {
    const benchmark = await getBenchmark(params.slug);

    if (!benchmark) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white font-sans">
            <div className="bg-gradient-to-br from-purple-900 to-slate-900 text-white py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link href="/benchmarks" className="inline-flex items-center text-sm text-purple-200 hover:text-white mb-6">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar para Benchmarks
                    </Link>
                    <div className="mt-4">
                        <span className="inline-block px-3 py-1 bg-purple-500/30 border border-purple-400/30 text-purple-200 text-xs font-bold uppercase rounded mb-4">
                            Benchmark Report 2026
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">{benchmark.frontmatter.title}</h1>
                        {benchmark.frontmatter.excerpt && (
                            <p className="text-xl text-purple-100">{benchmark.frontmatter.excerpt}</p>
                        )}
                        <div className="mt-6">
                            <Button size="lg" className="bg-white text-purple-900 hover:bg-purple-50">
                                <Download className="w-4 h-4 mr-2" />
                                Baixar PDF Completo
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl py-12">
                <article className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-purple-600 hover:prose-a:text-purple-700">
                    <MDXRemote source={benchmark.content} />
                </article>

                <div className="mt-16 p-8 bg-slate-900 text-white rounded-2xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Quer dados em tempo real?</h3>
                            <p className="text-slate-400">Conecte suas fontes e veja seus próprios benchmarks no RevenueOS.</p>
                        </div>
                        <Link href="/signup">
                            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap">
                                Começar Grátis
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
