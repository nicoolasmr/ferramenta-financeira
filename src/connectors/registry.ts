import { Connector } from "./_shared/connector.interface";
import { StripeConnector } from "./stripe";
import { HotmartConnector } from "./hotmart";
import { AsaasConnector } from "./asaas";

export const ConnectorRegistry: Record<string, Connector> = {
    'stripe': StripeConnector,
    'hotmart': HotmartConnector,
    'asaas': AsaasConnector,
    // Add others as needed
};

export function getConnector(provider: string): Connector | undefined {
    return ConnectorRegistry[provider];
}
