import { verifySignature } from "./verifySignature";
import { normalize } from "./normalize";
import { Connector } from "../_shared/connector.interface";

export const StripeConnector: Connector = {
    verifySignature,
    normalize
};
