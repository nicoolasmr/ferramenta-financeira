# Integrations Pipeline

## Overview
RevenueOS processes financial events through a rigid 3-stage pipeline: **Ingest → Normalize → Apply**.

```mermaid
graph LR
    Webhook[Provider Webhook] -->|Raw Payload| Ingest[DB: external_events_raw]
    Ingest -->|Job: normalize_event| Worker
    Worker -->|SDK: normalize()| Canonical[Canonical Event]
    Canonical -->|Job: apply_event| Ledger[DB: orders/payments]
    Manual[User Input] -->|Server Action| Ledger
```

## 1. Ingestion (Raw)
- **Endpoint**: `/api/webhooks/[provider]/[org_id]`
- **Validation**: Signature verification (`verifyWebhook` in SDK).
- **Storage**: JSONB in `external_events_raw`.
- **Status**: `pending`.

## 2. Normalization
- **Trigger**: Worker picks up `pending` events.
- **Action**: Maps provider-specific payloads to `NormalizedEvent` (RevenueOS Standard Schema).
- **Output**: List of canonical events (e.g. `sales.order.paid`, `disputes.opened`).
- **Idempotency**: `external_event_id` prevents duplicates.

## 3. Application (Ledger)
- **Action**: Updates business tables (`orders`, `payments`, `refunds`).
- **Logic**:
    - Creates/Updates entities based on canonical types.
    - Handles logic like "Refund implies Payment status update".
    - Records audit trail.

## Supported Providers
See [Provider Matrix](PROVIDER_MATRIX.md) for detailed capability support (Webhooks, Backfill, etc).

## Atomic Bulk Import
We support atomic backfills via the `sync_provider` job type.
- **Trigger**: Server Action `triggerBackfillAction`.
- **Scope**: Single provider, single Org.
- **Logic**: The connector's `triggerBackfill` method handles pagination and batch insertion of jobs.
