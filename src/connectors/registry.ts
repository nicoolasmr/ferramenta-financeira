
import { ProviderConnector } from "@/lib/integrations/sdk";
import { AsaasConnector } from "./asaas/connector";
import { KiwifyConnector } from "./kiwify/connector";
import { StripeConnector } from "./stripe/connector";
import { HotmartConnector } from "./hotmart/connector";
import { LastlinkConnector } from "./lastlink/connector";
import { EduzzConnector } from "./eduzz/connector";
import { MonetizzeConnector } from "./monetizze/connector";
import { MercadoPagoConnector } from "./mercadopago/connector";
import { PagSeguroConnector } from "./pagseguro/connector";
import { BelvoConnector } from "./belvo/connector";

export const ConnectorRegistry: Record<string, any> = {
    'asaas': AsaasConnector,
    'kiwify': KiwifyConnector,
    'stripe': StripeConnector,
    'hotmart': HotmartConnector,
    'lastlink': LastlinkConnector,
    'eduzz': EduzzConnector,
    'monetizze': MonetizzeConnector,
    'mercadopago': MercadoPagoConnector,
    'pagseguro': PagSeguroConnector,
    'belvo': BelvoConnector
};

export async function getConnector(provider: string): Promise<ProviderConnector | undefined> {
    const ClassRef = ConnectorRegistry[provider];
    if (!ClassRef) return undefined;
    return new ClassRef();
}
