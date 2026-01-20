# RevenueOS

RevenueOS is a high-performance financial operating system for businesses, designed to manage Sales, Payments, and Customer profiles with a focus on data visualization and multi-tenancy.

## Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **UI**: shadcn/ui (Radix Primitives)
- **Backend**: Supabase (Postgres, Auth, RLS)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## Prerequisites

- Node.js 18+
- Docker (for local development or containerized deployment)
- Supabase Project (or local Supabase instance)

## Setup

1.  **Clone the repository**
    ```bash
    git clone <repo-url>
    cd revenue-os
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Copy `.env.example` to `.env.local` and fill in your Supabase credentials.
    ```bash
    cp .env.example .env.local
    ```
    
    Required variables:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    ```

4.  **Database Migration**
    Run the SQL migration in `supabase/migrations/20260120120000_initial_schema.sql` via Supabase SQL Editor or CLI.

5.  **Seed Data** (Optional)
    Generate mock data for testing.
    ```bash
    # Prints SQL inserts to console, pipe to file or execute
    npx tsx scripts/seed.ts > seed.sql
    ```

6.  **Run Development Server**
    ```bash
    npm run dev
    ```

## Documentation

- [Architecture](./ARCHITECTURE.md)
- [Database Schema](./DB_SCHEMA.md)
- [Routes](./ROUTES.md)
- [Security](./SECURITY.md)
- [Operations](./OPS.md)
