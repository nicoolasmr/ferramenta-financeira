# RevenueOS Copilot (Deterministic + Optional GPT)

The Co-Pilot is the "Brain" of RevenueOS. Unlike generic chatbots, it is **Deterministic First**: it relies on SQL Views and a hard-coded Rules Engine to generate insights, scores, and actions. 

> [!NOTE]
> GPT is **optional** and used only as a "Renderer" to summarize data into natural language. It never makes decisions or modifies data.

## 1. Architecture

### A. Database Layer (The Truth)
- `insights`: Stores analysis results.
- `actions_queue`: Stores prioritized tasks.
- **SQL Views**:
    - `portfolio_financials_view`: Aggregated Org data.
    - `project_financials_view`: Project-specific health.
    - `receivables_aging_view`: Overdue debts by bucket (30/60/90).
    - `integration_freshness_view`: Status of external connections.

### B. Engine Layer (The Logic)
Located in `src/lib/copilot/`.
1.  **Scorer (`scoring.ts`)**: Calculates Health Score (0-100) based on Freshness, Overdue Rate, and Data Gaps.
2.  **Rules (`rules.ts`)**: Generates Insights (e.g., "High Delinquency", "Stale Data").
3.  **Planner (`planner.ts`)**: Maps insights to `actions_queue` (e.g., "Send WhatsApp", "Run Sync").
4.  **Scheduler**: Triggered via Cron (`/api/cron/copilot-daily`) or Manual Button.

### C. UI Layer (The Interface)
- **Portfolio Dashboard (`/app/copilot`)**: High-level view for executives.
- **Project Copilot (`/app/projects/[id]/copilot`)**: Deep dive for managers.
- **Wizard Chat (`/app/copilot/wizard`)**: No-LLM, state-machine based chat for data entry.

---

## 2. Configuration

### Enabling GPT (Optional)
To enable natural language summaries:
1.  Set `OPENAI_API_KEY` in `.env`.
2.  Set `COPILOT_GPT_ENABLED=true`.

If disabled, the system uses **Deterministic Templates** (e.g., "Score is 45. Critical Risk.").

---

## 3. Operational Guide

### Recalculating Analysis
- Click "Recalculate Analysis" on the Copilot Dashboard.
- Or call `POST /api/cron/copilot-daily` with `Authorization: Bearer <CRON_SECRET>`.

### Troubleshooting "Stale Data"
- If the Copilot says "Data feeds are slow (-10)":
  1.  Go to `/ops/webhooks`.
  2.  Check for failed webhooks.
  3.  Run a manual Sync.

### Wizard Logic
The "Deal Wizard" reduces friction for adding sales. It skips the complex administrative forms and asks 5 simple questions.
- It creates `installments` and `enrollments` directly.
- It is faster than manual entry.
