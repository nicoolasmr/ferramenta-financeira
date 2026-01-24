
# Changelog

## v1.0.1 (2026-06-01) - The "Source of Truth" Update
**Focus**: Engineering Rigor, Data Integrity, and Observability.

### 🏗️ Architecture
- **Verified Stack**: Confirmed Next.js 16.1.4 and Node.js runtime for webhooks.
- **Webhook Flow**: Clarified Sync Normalization -> Async Application pattern to ensure "Fail Fast" behavior.

### 🔒 Data Integrity
- **Constraints**: Documented `UNIQUE(org_id, provider, idempotency_key)` on `external_events_raw`.
- **Invariants**: Defined strict rules for Ledger Uniqueness and Tenant Isolation.

### 🔌 Integrations
- **Provider Matrix**: Added valid capabilities table for Stripe, Hotmart, Asaas, Kiwify, etc.
- **Secrets**: Clarified separation between Dev Env Vars (`STRIPE_KEY`) and User Secrets (`webhook_key`).

### 📦 Documentation
- **Master Doc**: Promoted `REVENUEOS_MASTER_DOCUMENTATION.md` to SSOT.
- **Runbooks**: Documented failure scenarios (Signature Fail vs App Fail).

---

## v1.0.0 (2026-05-30) - Gold Release
- Initial SaaS Pack launch.
- Billing Engine, Dunning, Trust Center, and Onboarding Wizard.
