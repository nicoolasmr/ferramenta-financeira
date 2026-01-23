import { Metadata } from "next";
import LandingPageClient from "./LandingPageClient";

export const metadata: Metadata = {
    title: "RevenueOS | Gestão Financeira para Operações de Lançamento e SaaS",
    description: "Controle seus recebíveis, inadimplência e reconciliação de pagamentos em um só lugar. Integrado com Stripe, Hotmart, Asaas e mais.",
    openGraph: {
        title: "RevenueOS | Gestão Financeira Premium",
        description: "Transforme dados brutos em inteligência financeira acionável.",
        url: "https://revenueos.com.br",
        siteName: "RevenueOS",
        locale: "pt_BR",
        type: "website",
    },
};

export default function LandingPage() {
    return <LandingPageClient />;
}
