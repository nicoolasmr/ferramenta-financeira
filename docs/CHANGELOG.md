
# Changelog

## v1.0.2 (2026-06-05) - Enhanced Sales & Senior Audit
**Focus**: Manual Sales Robustness, CRM Flexibility, and Data Integrity.

### 🌟 Features
- **Project Products**: Created "Add Product" dialog directly in Project Details. Linked products to projects (`project_id`).
- **Enhanced Manual Sales**: Expanded form with CRM fields (Niche, Status, Cycle, Situation, etc.).
- **Client Metadata**: CRM fields are now stored in a JSONB `metadata` column for future-proofing.

### 🛡️ Senior Audit & Fixes
- **Critical Fix**: Resolved "Metadata Overwrite" bug in `createManualSale` (now uses Deep Merge).
- **Validation**: Implemented Zod schemas for strict Manual Sale validation.
- **UX**: Added `react-currency-input-field` for BRL masking and auto-reset on form success.

### 🔧 Tech Deb
- **Clean Up**: Removed diagnostic logs and unused imports.
- **Type Safety**: Improved type definitions for manual sale form data.

---

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
