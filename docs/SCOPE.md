# Scope Boundaries

To prevent "Feature Creep" and ensure the Anti-Fragile nature of the SaaS, we explicitly define what is IN and OUT of scope.

## 1. Core Integrations
**IN SCOPE:**
- Ingesting Webhooks from Stripe, Hotmart, Asaas.
- Normalizing to `Order`, `Payment`, `Customer`.
- Idempotency and basic replayability.

**OUT OF SCOPE:**
- Bi-directional sync / Write-back to providers (e.g., updating Stripe customer metadata from our UI).
- Managing Provider settings (Tax, Inventory) from our UI.
- Handling "subscription updates" complex logic (upgrades/downgrades) *within* our database logic. We treat them as events.

## 2. Exports & Reporting
**IN SCOPE:**
- CSV Exports of raw lists (Payments, Customers).
- Simple aggregate views (Total MRR, Daily Sales).

**OUT OF SCOPE:**
- Custom Report Builder / BI Tooling inside the app.
- PDF Generation (Invoices are handled by the Provider).
- Scheduled Email Reports.

## 3. Operations
**IN SCOPE:**
- View Webhooks, Replay Webhooks.
- View Logs of "Anomalies".
- Impersonation for Support.

**OUT OF SCOPE:**
- Complete "Admin Panel" for editing user data arbitrarily (Use Supabase Dashboard for hotfixes if needed, preserve audit trail).
- Advanced "Workflow Automation" (Zapier-like features).

## 4. AI Features
**IN SCOPE:**
- "Chat with your Data" based on SQL Views.
- Simple textual insights.

**OUT OF SCOPE:**
- AI taking actions (Creating Refunds, Sending Emails) without explicit user confirmation step.
- Training custom models on user data.
