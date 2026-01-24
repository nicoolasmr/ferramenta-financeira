
# Provider Capabilities Matrix (v1.0.1)

| Provider | Auth Method | Webhook Sig | Subscriptions | Refunds | Installments | Split/Commissions | Minimal Fields |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Stripe** | API Key (Secret) | ✅ HMAC (`stripe-signature`) | ✅ Native | ✅ Full | ✅ Native | ✅ Connect | `id`, `amount`, `currency`, `status` |
| **Hotmart** | Hottok (Header) | ✅ Token (`x-hotmart-hottok`) | ✅ Recurrence | ✅ Partial | ✅ Native | ✅ Affiliates | `transaction`, `price`, `status` |
| **Asaas** | API Key | ✅ Token (`authToken`) | ✅ Native | ✅ Full | ✅ Native | ❌ | `id`, `value`, `status` |
| **Kiwify** | Basic Auth | ✅ Token in Body | ✅ Recurrence | ✅ Full | ✅ Native | ✅ Co-production | `order_id`, `commissions` |
| **Lastlink** | Header Token | ❌ (IP Check recom.) | ✅ Recurrence | ⚠️ Manual | ❌ | ✅ | `id`, `amount` |
| **Eduzz** | API Key | ✅ Basic Auth | ✅ Recurrence | ✅ Full | ✅ Native | ✅ | `trans_cod`, `value` |
| **Mercado Pago** | OAuth / Key | ✅ HMAC (`x-signature`) | ✅ Native | ✅ Full | ✅ Native | ❌ | `id`, `transaction_amount` |

## Integration Guide

### Generic Integration Steps
1.  **Select Provider**: Go to `/app/integrations/catalog`.
2.  **Generate Key**: Click "Connect". System generates a unique `webhook_key`.
3.  **Configure Provider**:
    - Copy the **Webhook URL**: `https://.../api/webhooks/[provider]?key=[webhook_key]`
    - Paste into the Provider's settings panel.
    - Copy the Provider's **Secret/Token** (if applicable).
    - Paste into RevenueOS "Secrets" modal.
4.  **Verify**: Click "Test Connection" to fire a ping event.
