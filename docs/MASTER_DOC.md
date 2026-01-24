
# RevenueOS Master Documentation (v1.0.1-SSOT)

**Date**: 2026-06-01
**Classification**: ENGINEERING MASTER RECORD
**Repo**: `antigravity-ferramenta-financeira`
**Version**: v1.0.1

---

## 🏗️ 1. High-Level Architecture

RevenueOS is a **Vertical SaaS for Revenue Operations**. It acts as a financial ledger that ingests data from multiple sources (Stripe, Hotmart, etc.), normalizes it, and provides financial services (Billing, Dunning, Reconciliation) on top.

### 1.1 Tech Stack (Verified)
- **Frontend**: Next.js 16.1.4 (App Router, Server Components).
- **Backend**: Next.js API Routes (Node.js Runtime).
- **Database**: Supabase (PostgreSQL 16) + Realtime.
- **Queue**: Postgres-based `jobs_queue` (Worker pattern).
- **Auth**: Supabase Auth (SSR).
- **Styling**: TailwindCSS + Shadcn/UI.

### 1.2 System Context Diagram

```mermaid
graph TD
    User[End User] -->|HTTPS| CDN[Vercel Edge]
    CDN -->|Next.js| App[App Server]
    
    subgraph "External Providers"
        Stripe
        Hotmart
        Asaas
    end
    
    Stripe -->|Webhook| API[ Ingestion API ]
    API -->|INSERT| RawDB[(external_events_raw)]
    API -->|Normalize (Sync)| Norm[NormalizedEvent]
    
    subgraph "Async Worker Layer"
        Worker[Queue Worker]
        Norm -->|Enqueue| Queue[(jobs_queue)]
        Worker -->|POLL| Queue
        Worker -->|UPSERT| Ledger[(payments/orders)]
        Worker -->|INCREMENT| Billing[(usage_events)]
    end
    
    App -->|READ| Ledger
    App -->|READ| Billing
```

---

## 🔒 2. Data Integrity Contract (Invariants)

These constraints are enforced by the Database Engine, not just the Application.

1.  **Idempotency**: `(org_id, provider, idempotency_key)` is UNIQUE in `external_events_raw`. Replaying a webhook 50 times results in 1 row.
2.  **ledger uniqueness**: `(org_id, provider, provider_object_id)` is UNIQUE in `payments` and `orders`.
3.  **Tenant Isolation**: Every `INSERT` and `SELECT` is guarded by RLS ensuring `org_id` matches the User's JWT claim.
4.  **Immutable Raw**: Rows in `external_events_raw` are NEVER updated, only `status` changes. The `payload` is write-once.
5.  **Retention**: Stale events (>90 days) are archived, but Ledger entries (`payments`) persist indefinitely unless hard-deleted by Admin.

---

## 🔌 3. Webhook Runtime Rules

### 3.1 Runtime Environment
- **Runtime**: `Node.js` (NOT Edge). Required for crypto compatibility and buffer handling.
- **Endpoint**: `POST /api/webhooks/[provider]?key=...`
- **Body**: Must be read as `text()` first for signature verification, then `JSON.parse()`.

### 3.2 Ingestion Flow
1.  **Verify**: Validate `stripe-signature` or `x-hotmart-hottok`. Fail 401 if invalid.
2.  **Raw Save**: `INSERT INTO external_events_raw`.
3.  **Normalize (Sync)**: Convert vendor JSON -> `NormalizedEvent[]`.
    *   *Why Sync?* To fail fast if the payload is malformed.
4.  **Enqueue (Async)**: `INSERT INTO jobs_queue (job_type: 'apply_event', payload: event)`.
5.  **Ack**: Return `200 OK`.

### 3.3 Failure Handling
- **Signature Fail**: Return 400/401. Provider retries.
- **Normalization Fail**: Log error, Return 200 (to stop Provider retries), save raw event with `status='failed'`.
- **Application Fail**: Job goes to `jobs_queue` with `status='failed'`. Worker retries 3x with exponential backoff.

---

## 🆔 4. Identity & Lineage

### 4.1 Traceability (`trace_id`)
Every internal write (Ledger, Logs) carries a `trace_id`.
- **Format**: `evt_<ulid>` (generated at ingestion).
- **Lineage**:
    `Webhook (Stripe)` -> `Raw Event (evt_123)` -> `Payment (pay_456, trace_id=evt_123)` -> `Dunning Log (log_789, trace_id=evt_123)`

### 4.2 External References (`external_refs`)
How we link a "Stripe Customer" to a "Hotmart Buyer":
```typescript
external_refs: [
  { kind: 'email', external_id: 'john@doe.com' },
  { kind: 'cpf', external_id: '123.456.789-00' },
  { kind: 'stripe_customer', external_id: 'cus_999' }
]
```
The `IdentityResolution` module (future) uses this vector to merge profiles.

---

## 🗄️ 5. Database Schema (Source of Truth)

### 5.1 Core Ledger (`payments`, `orders`)
```sql
CREATE TABLE public.payments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    provider_id text NOT NULL, /* e.g. ch_3N5... */
    amount_cents bigint NOT NULL,
    status text CHECK (status IN ('paid', 'pending', 'failed', 'refunded')),
    UNIQUE (project_id, provider_id) /* Enforced Idempotency */
);
```

### 5.2 Raw Layer (`external_events_raw`)
```sql
CREATE TABLE external_events_raw (
    id uuid PK,
    provider text,
    payload jsonb, 
    idempotency_key text,
    UNIQUE(org_id, provider, idempotency_key)
);
```

---

## 🔍 6. Observability & SLOs

### 6.1 Service Level Objectives (SLOs)
| Metric | Target | Measured By |
| :--- | :--- | :--- |
| **Ingestion Latency** | < 500ms | Webhook Response Time (Vercel) |
| **End-to-End Freshness** | < 30s | `now() - payments.created_at` |
| **Data Integrity** | 100% | `count(raw) == count(normalized)` |

### 6.2 Key Metrics (Ops Dashboard)
- **Queue Depth**: `SELECT count(*) FROM jobs_queue WHERE status = 'pending'`
- **Error Rate**: `% of jobs_queue WHERE status = 'failed'`
- **Replay Count**: Number of raw events re-processed manually.

---

## 🚀 7. Provider Setup: User vs Developer

### 7.1 Developer (Env Vars)
Managed in Vercel.
- `NEXT_PUBLIC_STRIPE_KEY`: Public key for elements.
- `STRIPE_WEBHOOK_SECRET`: Secret for signature verification.
- `HOTMART_TOKEN`: Verification token.

### 7.2 User (Dashboard)
Managed in `/app/projects/[id]/integrations`.
- The user generates a **Webhook Key** in our UI.
- The user copies the **Endpoint URL** (`https://api.revenueos.com/api/webhooks/stripe?key=...`).
- The user pastes this URL into *their* Stripe Dashboard.

---

## 🛡️ 8. Security (RLS)

| Table | Role | Permission | Logic |
| :--- | :--- | :--- | :--- |
| `external_events_raw` | `service_role` | ALL | Worker/API only. |
| `external_events_raw` | `authenticated` | SELECT | Org Admin (strictly scoped). |
| `dunning_rules` | `authenticated` | ALL | Org Member. |

**System Status**: 🟢 v1.0.1 CERTIFIED.
