
# Consistency Engine

The Consistency Engine prevents "data rot" by actively hunting for logical gaps.

## Detectors (v2.2)

### 1. `payment_without_order`
- **Logic**: Scanning `payments` where `order_id` is NULL or invalid.
- **Why**: Money received but no product delivered?
- **Action**: Link manually via Ops.

### 2. `payout_unmatched`
- **Logic**: Gateway says "I paid you", but Bank view shows 0 received.
- **Why**: Cash Gap (Dinheiro sumiu?).
- **Action**: Check Belvo connection or banking dates.

## Ops Dashboard
Visit `/ops/consistency` to view and resolve open anomalies.
