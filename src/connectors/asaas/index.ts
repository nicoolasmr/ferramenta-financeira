import { verifySignature } from "./verifySignature";
import { normalizeAsaas as normalize } from "./normalize";
import { Connector } from "../_shared/connector.interface";

export const AsaasConnector: Connector = {
    verifySignature,
    normalize: normalize as any
};
