import { ProviderConnector } from "@/lib/integrations/sdk";

const loaders: Record<string, () => Promise<any>> = {
    'asaas': () => import("./asaas/connector").then(m => new m.AsaasConnector()),
    'kiwify': () => import("./kiwify/connector").then(m => new m.KiwifyConnector()),
    'stripe': () => import("./stripe/connector").then(m => new m.StripeConnector()),
    'hotmart': () => import("./hotmart/connector").then(m => new m.HotmartConnector()),
    'lastlink': () => import("./lastlink/connector").then(m => new m.LastlinkConnector()),
    'eduzz': () => import("./eduzz/connector").then(m => new m.EduzzConnector()),
    'monetizze': () => import("./monetizze/connector").then(m => new m.MonetizzeConnector()),
    'mercadopago': () => import("./mercadopago/connector").then(m => new m.MercadoPagoConnector()),
    'pagseguro': () => import("./pagseguro/connector").then(m => new m.PagSeguroConnector()),
    'belvo': () => import("./belvo/connector").then(m => new m.BelvoConnector())
};

export async function getConnector(provider: string): Promise<ProviderConnector | undefined> {
    const loader = loaders[provider];
    if (!loader) return undefined;

    // Ensure we await the loader result which returns the instance
    const instance = await loader();
    return instance;
}
