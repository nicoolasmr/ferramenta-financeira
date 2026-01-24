
# Ledger & Financial Truth

RevenueOS v2.2 uses a **Double-Entry Ledger** pattern to ensure absolute financial integrity.

## Core Concepts

### 1. Ledger Entries (`ledger_entries`)
Every financial movement is recorded as an immutable entry.
- **Credit**: Money coming in (Revenue, Liabilities)
- **Debit**: Money going out (Expenses, Assets)

### 2. Categories
| Category | Direction | Meaning | Trigger |
| :--- | :--- | :--- | :--- |
| `sale` | Credit | Revenue Recognized | Order Confirmed |
| `payment_fee` | Debit | Processing Cost | Payment Paid |
| `payout` | Debit | Transfer to Bank | Payout Paid |
| `refund` | Debit | Money Returned | Refund Processed |
| `chargeback` | Debit | Forced Return | Chargeback Received |

### 3. Idempotency
We use a **Content-Based Hash** to prevent duplicates:
`md5(org_id + source_type + source_id + category + amount + date)`

This ensures that even if we replay the pipeline 100 times, the ledger remains correct.
