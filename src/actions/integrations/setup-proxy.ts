
"use server";

import { getConnector } from "@/connectors/registry";

export async function getSetupConfigFromAction(projectId: string, provider: string) {
    const connector = await getConnector(provider);
    if (!connector) return null;

    // Check auth? Assuming page middleware handles auth for /app route.

    return await connector.getSetupConfig(projectId);
}
