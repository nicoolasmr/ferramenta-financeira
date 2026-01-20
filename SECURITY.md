# Security Model

## RBAC (Role-Based Access Control)
Roles are defined in the `memberships` table.

| Role | Permissions |
| :--- | :--- |
| **Owner** | Full access to organization. Can manage billing, members, and critical settings. |
| **Admin** | Can manage resources (Orders, Customers), integrations, and view sensitive data. Cannot delete the org. |
| **Member** | Standard access. Can view and edit day-to-day records. |
| **Viewer** | Read-only access. |

## RLS (Row Level Security)
Database policies are the primary defense mechanism.

### Standard Policy
```sql
CREATE POLICY "Users can view data for their orgs" ON table_name
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM memberships WHERE org_id = table_name.org_id
  )
);
```

### Critical Tables
- `orders`
- `customers`
- `payments`
- `payouts`

## Audit Logging
Sensitive actions are recorded in `audit_logs` via database triggers or application logic.
- **Triggered events**:
    - Update Order status.
    - Refund creation.
    - Integration config change.
    - User removal.

## Portal Security
The Client Portal (`/portal`) is strictly isolated from the main App (`/app`).
- **PII Masking**: If `projects.settings.mask_pii` is set to `true`, customer names and emails are redacted in the portal view to protect privacy.

## Storage Security
The `documents` bucket follows strict path ownership: `{org_id}/{project_id}/{enrollment_id}/{filename}`.
- **Upload**: Restricted to Org Members. Client Viewers cannot upload.
- **Download**:
    - Org Members: Allowed.
    - Client Viewers: Allowed ONLY if `projects.settings.portal_can_download_docs` is NOT false.
- **Policies**: Implemented in `20260122000000_patch_v2_storage.sql` using a security definer function.

## Audit Log Integrity
- **Immutability**: `UPDATE` and `DELETE` operations are revoked at the database level.
- **Access**: Only `Owner` and `Admin` roles can `SELECT` from `audit_logs`. Portal users (Client Viewers) have zero access to logs.


