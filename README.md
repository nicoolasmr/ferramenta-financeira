# 🚀 RevenueOS v2.0 (SaaS Edition)

> **The Financial Operating System for Modern SaaS.**
> Unified Billing, AI Analysis, and Multi-Provider Integrations in one platform.

![RevenueOS Banner](https://img.shields.io/badge/RevenueOS-SaaS_Core-blueviolet?style=for-the-badge&logo=rocket)
![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-Next.js_15_%7C_Supabase_%7C_Tailwind-blue?style=for-the-badge)

---

## 🌟 Overview

**RevenueOS** has evolved into a complete B2B SaaS platform. It enables digital businesses (Course Creators, Agencies, SaaS) to:

1.  **Unify Revenue Streams**: Sync sales from **Stripe**, **Hotmart**, and **Asaas** into a single dashboard.
2.  **Automate Operations**: Trigger webhooks, process enrollments, and manage subscriptions automatically.
3.  **Leverage AI**: Use the built-in **AI Analyst** to query financial health and predict cash flow.
4.  **Manage Projects**: Track high-ticket sales, installments, and churn per project.

---

## ✨ Key Modules

### 🤖 **AI & Intelligence**
*   **Global Command Center**: A "God Mode" view of total volume, received revenue, and overdue risk across all projects.
*   **AI Analyst** (`/app/projects/[id]/ai`): A conversational interface to ask "How is my churn this month?" or "Draft a payment reminder".
*   **Sales Wizard**: Chat-based bot to quickly register new manual sales/enrollments.

### � **SaaS Billing & Subscriptions**
*   **Native Stripe Integration**: Subscribe to RevenueOS plans (Starter, Pro, Agency) directly within the app.
*   **Usage Metering**: Track API calls, active students, and storage for metered billing.
*   **Entitlements Engine**: Robust feature gating (RBAC + Plan Limits) enforcing access control.

### 🔌 **Integration Gateway**
*   **Universal Webhook Receiver**: Single endpoint (`/api/webhooks/[provider]`) to ingest events from any provider.
*   **Sync Engine**: Normalizes data from Stripe, Hotmart, and Asaas into a canonical `external_events` format.
*   **Dead Letter Queue (DLQ)**: Visual interface (`/ops/dlq`) to inspect and replay failed events.

### 🏢 **Multi-Tenancy Core**
*   **Organizations**: Strict data isolation via Row-Level Security (RLS).
*   **Project Hub**: Granular management of Products, Orders, and Installments per project.
*   **Scheduling Engine**: Flexible payment scheduling (Fixed Date, Relative, Custom).

---

## 🛠 Tech Stack (v2.0)

*   **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS, Shadcn/UI.
*   **Backend**: Supabase (Postgres), Typescript Server Actions.
*   **Security**: RLS Policies, Supabase Auth, Encrypted Credentials (Vault).
*   **AI**: OpenAI API (Mocked for MVP) integrated into UI components.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 20+
*   Supabase Project

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/nicoolasmr/ferramenta-financeira.git
    cd ferramenta-financeira
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Copy `.env.example` to `.env.local` and configure:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
    STRIPE_SECRET_KEY=sk_test_...
    ```

4.  **Database Setup (SaaS Core)**
    Run the migrations in order:
    1.  `supabase/migrations/20260120120000_initial_schema.sql`
    2.  `supabase/migrations/20260120150000_projects_module.sql`
    3.  `supabase/migrations/20260125000000_saas_core.sql` (The big one!)

5.  **Run Development Server**
    ```bash
    npm run dev
    ```

---

## 📚 Documentation

*   [**SECURITY.md**](./SECURITY.md): Compliance, RLS, and Encryption details.
*   [**OPS.md**](./OPS.md): Operator manual for managing the generic integration gateway.
*   [**PAYMENTS_SCHEDULING.md**](./PAYMENTS_SCHEDULING.md): Logic behind installment generation.

---

> **RevenueOS** — Built by Antigravity.
