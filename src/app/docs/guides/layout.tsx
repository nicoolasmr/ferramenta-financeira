import Link from "next/link";
import { Book, Code, Terminal, Key, Shield, Webhook } from "lucide-react";

const SIDEBAR_LINKS = [
    {
        section: "Começando",
        items: [
            { label: "Visão Geral", href: "/docs/guides/quickstart", icon: Book },
            { label: "Autenticação", href: "/docs/guides/auth", icon: Key },
            { label: "Erros & Status", href: "/docs/guides/errors", icon: Shield },
        ]
    },
    {
        section: "Recursos",
        items: [
            { label: "API Reference", href: "/docs/guides/api-reference", icon: Terminal },
            { label: "SDKs & Biblitecas", href: "/docs/guides/sdks", icon: Code },
            { label: "Webhooks", href: "/docs/guides/webhooks", icon: Webhook },
        ]
    }
];

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col md:flex-row gap-12">
                {/* Sidebar */}
                <aside className="w-full md:w-64 shrink-0 space-y-8 md:sticky md:top-24 md:h-[calc(100vh-8rem)] overflow-y-auto">
                    {SIDEBAR_LINKS.map((section) => (
                        <div key={section.section}>
                            <h4 className="font-bold text-slate-900 mb-4 px-2">{section.section}</h4>
                            <ul className="space-y-1">
                                {section.items.map((item) => (
                                    <li key={item.href}>
                                        <Link
                                            href={item.href}
                                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-colors"
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 py-4">
                    <div className="prose prose-slate prose-blue max-w-none">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
