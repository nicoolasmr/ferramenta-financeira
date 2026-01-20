import { verifySignature } from "./verifySignature";
import { normalize } from "./normalize";
import { Connector } from "../_shared/connector.interface";

export const AsaasConnector: Connector = {
    verifySignature,
    normalize
};
