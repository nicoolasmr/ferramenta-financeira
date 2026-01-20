# Operations & Observability

## Webhooks
We store all inbound webhooks to ensure traceablity.
- **Table**: `webhook_inbox`
- **Flow**:
    1.  Receive HTTP POST.
    2.  Store raw payload immediately (Status: `pending`).
    3.  Process async or sync.
    4.  Update status to `processed` or `failed`.

## Sync Runs
For polling-based integrations or nightly jobs.
- **Table**: `sync_runs`
- **Metrics**: Start time, end time, items processed, error messages.

## Audit Logs
Immutable record of "who did what".
- **Structure**: `actor (user_id)`, `action` (verb), `target` (entity/id), `state_change` (before/after json).

## Reconciliation
Process to ensure data integrity between:
1.  **Internal Orders** (What we sold)
2.  **Payment Gateway** (What was captured)
3.  **Bank Payouts** (What was deposited)

Views will be created to highlight discrepancies (e.g., Order Paid but no Payment record).
