
# RevenueOS (ferramenta-financeira)

**Vertical SaaS for Revenue Operations** - The financial brain for modern businesses.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://vercel.com)
[![Version](https://img.shields.io/badge/version-v1.0.1-blue)](docs/CHANGELOG.md)
[![Docs](https://img.shields.io/badge/docs-SSOT-orange)](docs/MASTER_DOC.md)

---

## 📚 Documentation
The engineering team maintains a strict **Source of Truth**. Please consult these documents before contributing:

- **[Master Documentation](docs/MASTER_DOC.md)**: Architecture, Schema, Invariants, and API Spec. (Start Here)
- **[Provider Matrix](docs/PROVIDER_MATRIX.md)**: Capabilities and setup for Stripe, Hotmart, Asaas, etc.
- **[Ops Runbook](docs/OPS_RUNBOOK.md)**: Incident response and maintenance.
- **[Release Checklist](docs/RELEASE_CHECKLIST.md)**: Deployment safety checks.
- **[Changelog](docs/CHANGELOG.md)**: Version history.

---

## 🚀 Quick Start (Dev)

1.  **Clone & Install**:
    ```bash
    git clone repo
    npm install
    ```

2.  **Environment**:
    Copy `.env.example` to `.env.local` and populate:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_STRIPE_KEY`

3.  **Run**:
    ```bash
    npm run dev
    # Opens http://localhost:3000
    ```

4.  **Codegen (Supabase)**:
    ```bash
    npm run supabase:types
    ```

---

## 🧪 Testing
We enforce a **Contract First** approach for Integrations.
```bash
npm run test           # Run all tests
npm run test:contracts # Verify Provider SDK compliance
```

---

## 📦 Deployment
Deployed on **Vercel** + **Supabase**.
Pushing to `main` triggers a production build.
See `docs/RELEASE_CHECKLIST.md` before merging.
