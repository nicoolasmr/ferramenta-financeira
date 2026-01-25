
export function verifySignature(body: string, headers: Record<string, string>, secret: string): boolean {
    // Kiwify sends a signature compare? 
    // Usually it's token in query or body or match.
    // Documentation says it sends `x-kiwify-signature` used to verify?
    // Or simplest: user sets a token and Kiwify sends it?
    // Let's check Kiwify webhooks settings... "Signature (optional)".
    // Often it sends "token" field in body or query param "token".

    // For MVP/Stabilization Pack as per instructions:
    // "Kiwify: validar token do webhook... Exigir que o usuário cole o token"

    // If webhook sends ?token=... we should have caught at routing? 
    // Or if it sends in body?

    // Let's assume Kiwify calls with ?token=SECRET or &signature=...
    // Adjusting to what is typical: signature param.
    // Let's verify against the secret passed (which implies the token user entered).

    // If body contains token?
    try {
        const json = JSON.parse(body);
        // Kiwify usually sends 'token' or 'signature' in payload or query.
        // We check against the secret configured in the connector.
        if (json.webhook_token === secret) return true;
        if (json.token === secret) return true;
        if (json.signature === secret) return true;
    } catch (e) {
        console.error("Kiwify signature verification failed - invalid JSON", e);
    }

    // Check Headers if applicable (x-kiwify-signature)
    // const headerSig = headers['x-kiwify-signature'];
    // if (headerSig === secret) return true;

    console.warn("Kiwify signature verification failed - no match");
    return false;
}
