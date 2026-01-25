import { PROVIDERS } from "@/lib/integrations/providers";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface IntegrationHelpPageProps {
    params: {
        slug: string;
    };
}

export async function generateStaticParams() {
    return Object.keys(PROVIDERS).map((slug) => ({
        slug,
    }));
}

export default function IntegrationHelpPage({ params }: IntegrationHelpPageProps) {
    const provider = PROVIDERS[params.slug];

    if (!provider) {
        notFound();
    }

    return (
        <div className="container max-w-3xl py-10">
            <Link href="/app/integrations" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Integrações
            </Link>

            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                    <img src={provider.logo} alt={provider.name} className="w-10 h-10 object-contain" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Configurando {provider.name}</h1>
                    <p className="text-xl text-muted-foreground">Guia passo a passo para integração</p>
                </div>
            </div>

            <div className="prose max-w-none">
                <p className="lead">
                    Siga este guia para conectar sua conta {provider.name} ao RevenueOS e começar a processar pagamentos e assinaturas.
                </p>

                <h2>O que você vai precisar</h2>
                <ul>
                    {provider.steps[0]?.checklist?.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>

                <h2>Passo a Passo</h2>
                <div className="space-y-8 mt-6">
                    {provider.steps.slice(1).map((step, idx) => (
                        <div key={idx} className="border rounded-lg p-6 bg-slate-50">
                            <h3 className="text-lg font-semibold mt-0 mb-2">{idx + 1}. {step.title}</h3>
                            <p className="text-slate-600 mb-4">{step.description}</p>
                            {step.fields && (
                                <div className="bg-white p-4 rounded border text-sm">
                                    <p className="font-medium mb-2">Campos necessários:</p>
                                    <ul className="list-disc list-inside text-muted-foreground">
                                        {step.fields.map(f => (
                                            <li key={f.key}>{f.label}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-10 p-6 bg-blue-50 rounded-lg border border-blue-100">
                    <h3 className="text-blue-900 mt-0">Precisa de mais ajuda?</h3>
                    <p className="text-blue-700 mb-4">
                        Consulte a documentação oficial do {provider.name} ou entre em contato com nosso suporte.
                    </p>
                    <div className="flex gap-4">
                        <Button variant="outline" asChild>
                            <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer">
                                Documentação Oficial ↗
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
