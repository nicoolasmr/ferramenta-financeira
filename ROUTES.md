# Application Routes

## Public / Auth
- `/login`: User sign in.
- `/signup`: User registration.
- `/forgot-password`: Password recovery.

## App (Private, Tenant Scoped)
- `/app/dashboard`: Main overview.
    - KPIs: Gross/Net Revenue, Charges, Refunds.
- `/app/sales`: List of orders.
- `/app/sales/[orderId]`: Order details.
- `/app/customers`: List of customers.
- `/app/customers/[customerId]`: Customer detailed profile.
- `/app/payments`: List of transactions.
- `/app/reports`: Detailed reports (Revenue, Cohorts).

## Projects Module
- `/app/projects`: List of all projects.
- `/app/projects/[projectId]/dashboard`: Project-specific dashboard (Financials, At Risk, etc.).
- `/app/projects/[projectId]/enrollments`: List of enrolled customers in the project.
- `/app/enrollments/[enrollmentId]`: Detailed student profile (Cycle, Diagnosis, Financial Plan).

## Client Portal
- `/portal/projects/[projectId]`: Read-only view for external clients (investors/partners).

## Ops (Admin/Owner Only)
- `/ops/overview`: System health.
- `/ops/integrations`: Managing third-party providers.
- `/ops/webhooks`: Inbound webhook logs.
- `/ops/sync-runs`: History of data synchronization jobs.
- `/ops/audit-logs`: Security audit trail.
- `/ops/reconciliation`: Tools for matching orders to payments.
