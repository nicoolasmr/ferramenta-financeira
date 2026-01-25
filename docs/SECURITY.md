# Security Policy

## 1. Data Protection
-   **RLS (Row Level Security)**: Enabled on ALL tables. Isolation by `org_id` is mandatory.
-   **Encryption**: Sensitive credentials (API Keys) are stored in `integrations.config_encrypted` using AES-256-GCM.
-   **PII**: Customer data is masked in the Portal view.

## 2. Authentication
-   Supabase Auth (JWT) is the source of truth.
-   MFA should be enabled for Admin accounts.
-   Invite links expire in 7 days (default) and enforce server-side `created_by` validation.

## 3. Access Control (RBAC)
-   **Owner**: Full access, Billing management, Org deletion.
-   **Admin**: Full access, Team management.
-   **Member**: Read/Write projects, cannot change Org settings.
-   **Viewer**: Read-only.

## 4. Operational Security
-   **SSRF Protection**: Webhook egress (testing) is restricted to allowed domains or strictly validated.
-   **ID Generation**: `crypto.randomUUID()` used for all secure tokens and IDs.
-   **Audit Logs**: Configuration changes generate immutable audit trails.

## 5. Reporting Vulnerabilities
Contact: security@revenueos.com
