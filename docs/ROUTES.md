
# RevenueOS Route Inventory

## Public Routes
| Path | Description | Access |
| :--- | :--- | :--- |
| `/` | Landing Page | Public |
| `/pricing` | Pricing Page | Public |
| `/blog` | Blog & updates | Public |
| `/help` | Help Center | Public |
| `/login` | Authentication | Public (Guest) |
| `/signup` | Registration | Public (Guest) |

## App Routes (`/app`) - Requires Auth
| Path | Description | Access |
| :--- | :--- | :--- |
| `/app` | Dashboard (Portfolio Health) | Auth + Org Member |
| `/app/projects` | Project List | Auth + Org Member |
| `/app/projects/new` | Create Project | Auth + Org Member |
| `/app/projects/[id]` | Project Hub (Overview) | Auth + Org Member |
| `/app/projects/[id]/sales` | Sales Reports | Auth + Org Member |
| `/app/projects/[id]/payments` | Payments & Installments | Auth + Org Member |
| `/app/projects/[id]/receivables` | Aging & Collections | Auth + Org Member |
| `/app/projects/[id]/reconciliation` | Reconciliation Views | Auth + Org Member |
| `/app/projects/[id]/cash-real` | Bank vs Gateway | Auth + Org Member |
| `/app/projects/[id]/copilot` | AI Insights | Auth + Org Member |
| `/app/projects/[id]/risk` | Risk & Chargebacks | Auth + Org Member |
| `/app/projects/[id]/integrations` | Connect Providers | Auth + Org Member |
| `/app/settings` | Org Settings | Auth + Owner/Admin |
| `/app/settings/billing` | Billing & Plans | Auth + Owner/Admin |
| `/app/settings/team` | Team Management | Auth + Owner/Admin |

## Portal Routes (`/portal`) - Read Only Client
| Path | Description | Access |
| :--- | :--- | :--- |
| `/portal/projects/[id]` | Client View (Read-Only) | Auth + Viewer Policy |

## Ops Routes (`/ops`) - Internal Admin
| Path | Description | Access |
| :--- | :--- | :--- |
| `/ops` | Ops Overview | Auth + Internal Role |
| `/ops/webhooks` | Webhook Logs & Replay | Auth + Internal Role |
| `/ops/consistency` | Anomaly Management | Auth + Internal Role |
| `/ops/lineage` | Data Lineage Tool | Auth + Internal Role |
| `/ops/support` | Impersonation (ToDo) | Auth + Internal Role |

## API Routes
| Path | Method | Description | Access |
| :--- | :--- | :--- | :--- |
| `/api/webhooks/[provider]` | POST | Provider Ingest | Signature Verification |
| `/api/cron/consistency` | POST | Run Detectors | CRON_SECRET |
| `/api/cron/worker` | POST | Process Job Queue | CRON_SECRET |
