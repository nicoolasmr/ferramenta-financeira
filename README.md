# 🚀 RevenueOS v2.0 (SaaS Edition)

> **The Financial Operating System for Modern SaaS.**
> Unified Billing, AI Analysis, and Multi-Provider Integrations in one platform.

![RevenueOS Banner](https://img.shields.io/badge/RevenueOS-SaaS_Core-blueviolet?style=for-the-badge&logo=rocket)
![Status](https://img.shields.io/badge/Status-100%25_Functional-success?style=for-the-badge)
![Security](https://img.shields.io/badge/Security-MFA_Protected-blue?style=for-the-badge)

---

## 🌟 Overview

**RevenueOS** is a complete, production-ready B2B SaaS platform designed to centralize and optimize financial operations for digital businesses (Course Creators, Agencies, SaaS).

1.  **Unify Revenue Streams**: Sync sales from **Stripe**, **Hotmart**, **Asaas**, **Eduzz**, **Kiwify**, and **Mercado Pago** into a single source of truth.
2.  **Automate Operations**: Advanced webhook management, real-time sync, and automated processing.
3.  **Leverage AI**: Integrated **IA Copilot** providing actionable insights on churn, revenue risks, and team performance.
4.  **Manage Projects**: Granular tracking for high-ticket sales, custom payment plans, and installment aging.

---

## ✨ Core Features (100% Functional)

### 🤖 **Intelligence & IA Copilot**
- **IA Copilot**: Real-time insights based on live database data. Automatically suggests actions to reduce churn or recover revenue.
- **Unified Analytics**: Global dashboard with real-time metrics across all connected gateways.

### 💳 **SaaS Billing & Plans**
- **Dynamic Subscription Hub**: Full implementation of Starter, Pro, and Enterprise plans.
- **Subscription Management**: Complete flow for upgrading, downgrading, and canceling plans.
- **Secure Payment Updates**: Built-in modal for updating payment methods.
- **Invoice Tracking**: Detailed billing history with downloadable receipts.

### 🔌 **Integration Gateway**
- **Multi-Gateway Support**: 6 pre-configured providers with secure credential management.
- **Connectivity Testing**: Built-in "Test Connection" engine for all integrated gateways.
- **Reliable Webhooks**: Tested webhook delivery system with secret rotation support.

### 🛡️ **Enterprise Security**
- **TOTP MFA**: Real-time QR code generation and 2FA verification.
- **Recovery Codes**: Secure backup code system for account recovery.
- **API Key Management**: Secure key generation with masking and show/hide security.
- **Audit Logs**: Comprehensive activity tracking with advanced filters (Action, Resource, User) and **CSV Export**.

---

## 🛠 Tech Stack

*   **Frontend**: Next.js 15 (App Router/Turbopack), React 19, TailwindCSS, Shadcn/UI.
*   **Backend**: Supabase (Postgres), server-side revalidation, and Typescript Server Actions.
*   **Security**: RLS Policies, MFA implementation, and Encrypted Credentials.
*   **Utilities**: `otplib` (MFA), `qrcode` (2FA), `recharts` (Analytics), `sonner` (Notifications).

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
    Copy `.env.example` to `.env` and configure:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    ```

4.  **Seeding Data**
    Populate the platform with initial plans:
    ```bash
    npx tsx scripts/seed-billing-plans.ts
    ```

5.  **Run Development Server**
    ```bash
    npm run dev
    ```

---

## 📚 Documentation

The technical and operational documentation is organized in the [`docs/`](./docs/) directory:

### Core Platform
- [**Architecture Guide**](./docs/ARCHITECTURE.md): System design, data flow, and stack details.
- [**Database Schema**](./docs/DB_SCHEMA.md): Entity relationship diagram and table descriptions.
- [**Security & Compliance**](./docs/SECURITY.md): RLS, MFA, and data protection policies.
- [**Routes & API**](./docs/ROUTES.md): Complete list of app routes and API endpoints.

### Operations & Intelligence
- [**AI Copilot**](./docs/AI_COPILOT.md): How the deterministic and GPT layers work.
- [**Operations Manual (OPS)**](./docs/OPS.md): Managing gateways, webhooks, and the DLQ.
- [**Payment Scheduling**](./docs/PAYMENTS_SCHEDULING.md): Logic for installments and re-negotiations.
- [**Runbook**](./docs/RUNBOOK.md): Troubleshooting common operational issues.

### Implementation History
- [**Task Tracker**](./docs/brain/task.md): Detailed 100% completion checklist.
- [**Final Walkthrough**](./docs/brain/walkthrough.md): Documented proofs of all functional modules.

---

> **RevenueOS** — 100% Building completed by Antigravity. 🚀
