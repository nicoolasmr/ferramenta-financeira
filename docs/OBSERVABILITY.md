
# Observability Standards

## 1. Traceability
- **Request ID**: Every HTTP request receives a `x-request-id` header (UUID).
- **Trace ID**: Every async flow (Webhook -> Job -> Ledger) is linked by a `trace_id`.
  - Format: `provider_event_id` or `uuid`.

## 2. Sentry (Error Tracking)
- **DSN**: Set `NEXT_PUBLIC_SENTRY_DSN` in env.
- **Scrubbing**: We strictly scrub PII (emails, CPFs, phones, secrets).
- **Release**: All events are tagged with `git_commit` or `version`.

## 3. Logs
- Use `console.error` / `console.log` with structured JSON when possible.
- Always include `requestId` and `orgId` in context.

## 4. How to Debug
1.  Go to Supabase `audit_logs` or `jobs_queue` tables.
2.  Filter by `trace_id` or `request_id`.
3.  Cross-reference with Sentry Issues.
