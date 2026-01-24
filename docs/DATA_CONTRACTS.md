# RevenueOS Canonical Data Contracts

To ensure a robust "Data Truth Layer", all external data is mapped to these canonical types before entering the Domain Layer.

## Core Principles
1. **Money**: Always integers in cents (e.g., `R$ 10,00` -> `1000`).
2. **Time**: ISO 8601 UTC Strings (`2024-01-01T12:00:00Z`).
3. **Identity**: All records linked to `org_id` and optionally `project_id`.

## Status Mapping Guidelines

Each provider has its own language. We translate it to ours.

### 1. Order Status (`CanonicalOrder`)

| Canonical | Stripe | Hotmart | Asaas | Kiwify |
| :--- | :--- | :--- | :--- | :--- |
| `created` | `requires_payment_method` | `STARTED` | `PENDING` | `waiting_payment` |
| `confirmed` | `succeeded` / `paid` | `APPROVED` / `COMPLETED` | `RECEIVED` / `CONFIRMED` | `paid` |
| `canceled` | `canceled` | `CANCELED` | `CANCELLED` | `refused` |
| `refunded` | `refunded` | `REFUNDED` | `REFUNDED` | `refunded` |
| `chargeback` | - | `CHARGEBACK` | `CHARGEBACK` | `chargeback` |
| `disputed` | `dispute.created` | `DISPUTE` | - | `dispute` |

### 2. Payment Status (`CanonicalPayment`)

| Canonical | Description |
| :--- | :--- |
| `pending` | Payment initiated but not yet settled (e.g. Boleto printed). |
| `paid` | Money captured and confirmed. |
| `failed` | Transaction declined/refused. |
| `refunded` | Full refund processed. |
| `chargeback` | Forced reversal by bank. |

### 3. Payout Status (`CanonicalPayout`)

| Canonical | Description |
| :--- | :--- |
| `pending` | Scheduled or processing. |
| `paid` | Money sent to bank account (Settled). |
| `failed` | Transfer rejected. |

## Data Flow

`RAW (Webhook)` -> `Normalization (SDK)` -> `Canonical Event` -> `Domain Table Upsert`

### Example: Stripe Normalization

**Raw**:
```json
{
  "id": "evt_123",
  "type": "charge.succeeded",
  "data": {
    "object": {
      "amount": 2000,
      "currency": "brl",
      "payout": "po_123"
    }
  }
}
```

**Canonical**:
```ts
{
  domain_type: "payment",
  data: {
    amount_cents: 2000,
    currency: "BRL",
    status: "paid",
    net_cents: 1950 // after fee calculation
  }
}
```
