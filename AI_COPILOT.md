# AI Copilot Manual

The RevenueOS Copilot (`/app/copilot`) is your intelligent financial assistant.

## Features

### 1. Chat Wizard
Create sales and enrollments via natural language.
- **Example**: "Novo mentorado João Silva valor 10000 em 10x"
- **Process**: 
   1. AI extracts data (Draft).
   2. Shows Preview Card.
   3. User Confirms -> Creates Enrollment + Plan + Installments.
- **Security**: Validates inputs, creates customer if missing, logs `source: ai_chat`.

### 2. Bulk Import
Import thousands of enrollments via CSV.
- **Format**: `name, email, total_amount, installments`
- **Validation**: Checks email format, min amounts, valid installment counts (1-36).
- **Execution**: Batch processing with success/fail report.

### 3. Simulator
Forecast cash flow scenarios.
- **Input**: Default Rate (%) and Average Delay (Days).
- **Output**: Projected Realizable Revenue vs Baseline.
- **Use Case**: Stress test your cash flow for the next 30 days.

### 4. Collections
Manage overdue payments efficiently.
- **Aging buckets**: 1-30d, 31-60d, 60d+.
- **Scripts**: Copy pre-approved WhatsApp messages for each severity level.
- **Guardrail**: No automated sending; human review required.

## Technical Details
- **Provider**: Mock Mode (Heuristic-based) by default. Ready for OpenAI integration.
- **Consistency**: All metrics come from atomic data (`installments` table).
- **Safety**: Client Viewers are blocked from this module.
