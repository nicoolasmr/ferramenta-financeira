# Integration Compliance Audit

This document details the compliance status of our webhook integrations against official provider documentation.

## Executive Summary
| Provider | Status | Verified Method | Local Implementation | Compliance |
|----------|--------|-----------------|----------------------|------------|
| **Stripe** | ✅ Secure | `Stripe-Signature` (HMAC-SHA256) | Uses official SDK `constructEvent` | **100% Compliant** |
| **Asaas** | ✅ Secure | `asaas-access-token` Header | Checks `req.headers['asaas-access-token']` | **100% Compliant** |
| **Hotmart**| ⚠️ Legacy | `X-Hotmart-Hottok` (Token) | Checks `hottok` in Header/Body | **Functional (Legacy)** |
| **Kiwify** | ⚠️ Weak | Token in payload/query | Checks `payload.signature` or `payload.token` | **Best Effort** (Docs unclear) |

## Detailed Analysis

### 1. Stripe (Global Standard)
*   **Official Spec:** Stripe requires verifying the `Stripe-Signature` header using the webhook signing secret.
*   **Our Code (`src/connectors/stripe/verifySignature.ts`):**
    ```typescript
    stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    ```
*   **Verdict:** Implementation is secure and follows best practices.

### 2. Asaas (Brazil)
*   **Official Spec:** Asaas sends a unique token in the `asaas-access-token` header.
*   **Our Code (`src/connectors/asaas/verifySignature.ts`):**
    ```typescript
    const token = req.headers.get("asaas-access-token");
    if (token === process.env.ASAAS_WEBHOOK_TOKEN) return { isValid: true };
    ```
*   **Verdict:** Correctly implements the documentation standard.

### 3. Hotmart (Legacy vs New)
*   **Official Spec:** Historically, Hotmart used a `hottok` field in the body or `X-Hotmart-Hottok` header. Newer "Hotmart Developers" documentation mentions OAuth but webhook security often remains on the `hottok` for simplicity in many integrations.
*   **Our Code (`src/connectors/hotmart/verifySignature.ts`):**
    *   Checks `req.headers.get("hottok")`
    *   Checks `req.headers.get("x-hotmart-hottok")`
    *   Fallback: Checks `body.hottok`
*   **Verdict:** Functional. Hotmart is moving towards KeyCloak/OAuth for API, but for webhooks, the `hottok` remains the standard verification method for the legacy/current webhook platform (`Webhook 1.0/2.0`). **Action:** Keep as is.

### 4. Kiwify (Documentation Gap)
*   **Official Spec:** Public documentation for Kiwify Webhooks does not explicitly detail an HMAC signature header (like `X-Kiwify-Signature`). Most integrations rely on a `token` or `signature` field sent within the JSON payload or query parameters.
*   **Our Code (`src/connectors/kiwify/verifySignature.ts`):**
    ```typescript
    if (json.signature === secret) return true;
    if (json.token === secret) return true;
    ```
*   **Verdict:** This is a "Best Effort" implementation. Without a standardized header from Kiwify, comparing the payload token against a stored secret is the only available method. **Action:** Monitor for Kiwify API updates 2025+.

## Recommendations
1.  **Stripe:** No changes needed.
2.  **Asaas:** Ensure `ASAAS_WEBHOOK_TOKEN` is set in Vercel to a UUIDv4 (not a simple password).
3.  **Hotmart:** Ensure `HOTMART_HOTTOK` is exact.
4.  **Kiwify:** If Kiwify releases a `v2` webhook with HMAC, we must upgrade immediately.
