
import { ProviderConnector, NormalizedEvent, CapabilityMatrix, WebhookConfig } from "@/lib/integrations/sdk";
import { applySales } from "@/lib/integrations/apply/sales";
import { applySubscriptions } from "@/lib/integrations/apply/subscriptions";

/**
 * Base V2 Connector
 * Implements shared logic like the Apply Router.
 */
export abstract class BaseConnectorV2 implements ProviderConnector {
    abstract providerKey: string;
    abstract displayName: string;
    abstract capabilities: CapabilityMatrix;

    abstract getSetupConfig(projectId: string): Promise<WebhookConfig>;
    abstract verifyWebhook(body: string, headers: Record<string, string>, secrets: Record<string, string>): Promise<{ ok: boolean; reason?: string }>;
    abstract normalize(raw: any, ctx: { org_id: string; project_id: string; trace_id: string }): Promise<NormalizedEvent[]>;

    // Shared Apply Logic (Router)
    async apply(evt: NormalizedEvent, ctx: { org_id: string; project_id: string }): Promise<{ applied: boolean }> {
        console.log(`[BaseConnector] Routing apply for ${evt.canonical_module}`);

        switch (evt.canonical_module) {
            case 'sales':
                await applySales(evt);
                break;
            case 'subscriptions':
                await applySubscriptions(evt);
                break;
            default:
                console.warn(`No Engine for module: ${evt.canonical_module}`);
                return { applied: false };
        }
        return { applied: true };
    }
}
