# Caixa Real — Reconciliation Guide

The "Caixa Real" feature ensures that every dollar reported by your payment gateway actually hit your bank account.

## Matching Algorithm
Our deterministic engine uses a prioritized approach:
1. **Direct Match**: Exact Net Amount + Date (±24h). Confidence: 100%.
2. **Tolerance Match**: Net Amount within 0.5% tolerance (for variable fees) + Date proximity. Confidence: 90%.
3. **Score Match**: Description parsing (keyword: "Stripe", "Asaas") + Date proximity. Confidence: 50-80%.

## Manual Matching
Users can manually match a payout to a bank transaction. 
Every manual match is recorded in `audit_logs` for compliance.

## The "Delta"
The most important metric. 
`Delta = Sum(Expected Payouts) - Sum(Matched Bank Credits)`
If Delta != 0, there is a mismatch between the gateway and the bank.
