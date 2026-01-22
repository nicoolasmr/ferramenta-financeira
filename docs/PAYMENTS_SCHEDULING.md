# Payment Scheduling Logic

This document details the configuration and logic used by the `Schedule Engine` to generate installments automatically.

## Overview

The system uses a configuration object (`schedule_rule` JSONB in `payment_plans`) to determine how installment dates are calculated.

## Rule Types

### 1. `fixed_day_of_month`
- **Description**: Installments fall on a specific day of the month (e.g., every 10th).
- **Parameters**:
  - `due_day`: (1-31). The target day.
  - `interval_months`: (default 1). Frequency.
  - `anchor`: Reference date (usually `entry_paid_at`).
- **Logic**:
  - Adds `i` months to the anchor date.
  - Sets the day to `due_day`.
  - **Fallback**: If the target month has fewer days than `due_day` (e.g., Feb 28 vs due_day 30), it defaults to the LAST day of that month.

### 2. `days_after_entry`
- **Description**: First installment is `N` days after the entry payment. Subsequent installments follow monthly.
- **Parameters**:
  - `days_after`: Number of days (e.g., 30).
  - `anchor`: `entry_paid_at`.
- **Logic**:
  - 1st Installment: `Anchor + days_after`.
  - Subsequent: Adds 1 month to the previous installment's date.

### 3. `custom_first_due`
- **Description**: User manually picks the first due date.
- **Parameters**:
  - `first_due_date`: Date object.
- **Logic**:
  - 1st Installment: `first_due_date`.
  - Subsequent: `first_due_date + i months`. Uses same day-of-month logic as `fixed_day_of_month`.

## Rounding Policy

The system calculates amounts in **cents**.
To ensure the total sum matches exactly:
- `Base Amount = floor(Total / Count)`
- `Remainder = Total - (Base * Count)`
- **All installments** get `Base Amount`.
- **Last installment** gets `Base Amount + Remainder`.

## Reference Implementation

See `src/lib/scheduling/engine.ts`.

## Overdue & Grace Period
- **Grace Days**: Configured in `payment_plans` (JSONB `schedule_rule`). Default is 0.
- **Logic**: An installment is overdue if `Today > Due Date + Grace Days` and status is not 'paid'.
- **Utility**: `calculateInstallmentStatus(installment, graceDays)` in `src/lib/scheduling/utils.ts`.

## Renegotiation
Renegotiation is handled non-destructively:
1.  **Mark Old**: Existing pending installments are marked as `renegotiated` (status).
2.  **Create New**: New installments are generated based on the new agreement.
3.  **Financials**: `renegotiated` items are excluded from "Open" headers to prevent double-counting.

