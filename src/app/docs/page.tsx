import { PublicHeader } from "@/components/layout/public-header";
import Link from "next/link";
import { ArrowRight, Book, FileText, Code } from "lucide-react";

export default function DocsPage() {
    const guides = [
        { title: "Quickstart", description: "Get your account set up in minutes.", icon: <Book className="h-6 w-6" /> },
        { title: "Integrations", description: "Connect Stripe, Hotmart and Asaas.", icon: <Code className="h-6 w-6" /> },
        { title: "API Reference", description: "Programmatic access to your data.", icon: <FileText className="h-6 w-6" /> },
    ];

    return (
        <div className="flex min-h-screen flex-col">
            <PublicHeader />
            <main className="flex-1 container py-12">
                <h1 className="text-4xl font-bold mb-4">Documentation</h1>
                <p className="text-xl text-muted-foreground mb-12">Everything you need to build with RevenueOS.</p>

                <div className="grid gap-6 md:grid-cols-3">
                    {guides.map((guide) => (
                        <Link key={guide.title} href="#" className="group relative rounded-lg border p-6 hover:bg-muted/50 transition-colors">
                            <div className="mb-4 text-blue-600">{guide.icon}</div>
                            <h3 className="font-bold mb-2 group-hover:underline flex items-center">
                                {guide.title} <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </h3>
                            <p className="text-muted-foreground">{guide.description}</p>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 p-8 bg-muted rounded-lg border">
                    <h2 className="text-2xl font-bold mb-4">Need help?</h2>
                    <p className="mb-4">Our support team is available during business hours to assist with integration issues.</p>
                    <a href="mailto:support@revenueos.com" className="text-blue-600 font-medium hover:underline">Contact Support &rarr;</a>
                </div>
            </main>
        </div>
    );
}
