
import * as fs from 'fs';
import * as path from 'path';

const providerName = process.argv[2];

if (!providerName) {
    console.error("Please provide a connector name. Usage: npm run create-connector <name>");
    process.exit(1);
}

const basePath = path.join(process.cwd(), 'src', 'connectors', providerName);

if (fs.existsSync(basePath)) {
    console.error(`Connector ${providerName} already exists.`);
    process.exit(1);
}

fs.mkdirSync(basePath, { recursive: true });

const template = `
import { BaseConnectorV2 } from "../base-v2";
import { CapabilityMatrix, NormalizedEvent, WebhookConfig } from "@/lib/integrations/sdk";
import { getWebhookUrl } from "@/lib/integrations/setup";

export class ${capitalize(providerName)}Connector extends BaseConnectorV2 {
    providerKey = "${providerName}";
    displayName = "${capitalize(providerName)}";

    capabilities: CapabilityMatrix = {
        webhooks: true,
        backfill: false,
        subscriptions: false,
        payouts: false,
        disputes: false,
        refunds: false,
        installments: false,
        commissions: false,
        affiliates: false,
        multi_currency: false
    };

    async getSetupConfig(projectId: string): Promise<WebhookConfig> {
        const url = await getWebhookUrl(projectId, this.providerKey);
        return {
            webhookUrl: url,
            verificationKind: 'none',
            recommendedEvents: [],
            fields: [],
            instructions: []
        };
    }

    async verifyWebhook(body: string, headers: Record<string, string>, secrets: Record<string, string>): Promise<{ ok: boolean; reason?: string }> {
        return { ok: true };
    }

    async normalize(raw: any, ctx: { org_id: string; project_id: string; trace_id: string }): Promise<NormalizedEvent[]> {
        return [];
    }
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
`;

fs.writeFileSync(path.join(basePath, 'connector.ts'), template.trim());

console.log(`✅ Created connector scaffold at src/connectors/${providerName}`);
console.log(`\nNext steps:\n1. Register in src/connectors/registry.ts\n2. Implement normalize() logic.`);

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
