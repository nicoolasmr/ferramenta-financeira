# 🚀 RevenueOS

> **A Complete Financial Operating System for Digital Businesses.**
> Manage Payments, Projects, Enrollments, and Financial Health in one place.

![RevenueOS Banner](https://img.shields.io/badge/RevenueOS-v1.2-blueviolet?style=for-the-badge&logo=rocket)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Supabase%20%7C%20Tailwind-blue?style=for-the-badge)

---

## 🌟 Overview

**RevenueOS** is a specialized financial tool designed for service-based businesses, mentorships, and high-ticket sales. It goes beyond simple payment tracking by integrating **Project Management**, **Enrollment Cycles**, and **Automated Financial Intelligence**.

It solves the chaos of spreadsheets by providing a single source of truth for:
*   **Sales & Receivables**: Ensure every cent sold is collected.
*   **Student/Client Lifecycles**: Track onboarding, active status, and churn.
*   **Financial Health**: Real-time dashboards with "Sold vs. Received" and "Overdue" metrics.

---

## ✨ Key Features

### 🏢 **Multi-Tenancy & Security**
*   **Organization-Based**: Complete isolation of data per organization.
*   **RBAC (Role-Based Access Control)**: Granular roles (`Owner`, `Admin`, `Member`, `Client Viewer`).
*   **RLS (Row Level Security)**: Enterprise-grade security enforced at the database layer.

### 💰 **Smart Payments & Scheduling**
*   **Flexible Plans**: Support for complex structures (Entry + Installments).
*   **Automated Scheduling**: Engines for `Fixed Day`, `Days After Entry`, and custom dates.
*   **Overdue Logic**: Deterministic statuses with configurable grace periods.
*   **Renegotiation**: Non-destructive flows to refinance overdue payments without losing data history.

### 🎓 **Projects & Enrollments**
*   **Cycle Management**: Track Start/End dates, Contracts, and Onboarding status.
*   **Financial Profile**: Per-student financial summary (Total, Paid, Open, At Risk).
*   **Client Portal**: Secure, read-only dashboard for clients to view their own progress and financial standing (with PII masking).

### 📊 **Observability**
*   **Audit Logging**: Traceable history for sensitive actions (Renegotiations, Payments).
*   **Financial Views**: Server-side SQL views for fast, consistent reporting.

---

## 🛠 Tech Stack

Built with a modern, performant, and type-safe stack:

*   **Frontend**: [Next.js 15](https://nextjs.org/) (App Directory), [React 19](https://react.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/)
*   **Backend / DB**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Realtime)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Forms**: React Hook Form + Zod

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 20+
*   npm / yarn / pnpm
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
    Copy `.env.example` to `.env.local` and fill in your keys:
    ```bash
    cp .env.example .env.local
    ```
    Required keys:
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   `SUPABASE_SERVICE_ROLE_KEY` (for admin scripts only)

4.  **Database Setup**
    Run the migrations in your Supabase SQL Editor in this order:
    1.  `supabase/migrations/20260120120000_initial_schema.sql` (Core)
    2.  `supabase/migrations/20260120150000_projects_module.sql` (Projects)
    3.  `supabase/migrations/20260121000000_patch_security.sql` (Security & Fixes)

5.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📚 Documentation

Detailed documentation is available in the project root:

*   [**SECURITY.md**](./SECURITY.md): RBAC, RLS, and Portal Security.
*   [**OPS.md**](./OPS.md): Daily operations, webhooks, and manual procedures.
*   [**PAYMENTS_SCHEDULING.md**](./PAYMENTS_SCHEDULING.md): Deep dive into the installment calculation engine.
*   [**DB_SCHEMA.md**](./DB_SCHEMA.md): Database diagrams and relationship details.

---

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

> **RevenueOS** — Empowering Financial Clarity.
