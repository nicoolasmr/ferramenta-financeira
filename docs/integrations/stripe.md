# Stripe Integration Guide

## Overview
RevenueOS uses Stripe for two purposes:
1.  **SaaS Billing**: Subscribing Organization to RevenueOS plans.
2.  **Platform Integration**: Syncing client sales/payments into RevenueOS dashboards.

## Configuration
1.  Go to `https://dashboard.stripe.com/apikeys`.
2.  Get `Publishable Key` and `Secret Key`.
3.  Go to `https://dashboard.stripe.com/webhooks`.
4.  Add endpoint: `https://[YOUR_DOMAIN]/api/webhooks/stripe`.
5.  Select events:
    -   `checkout.session.completed`
    -   `customer.subscription.updated`
    -   `customer.subscription.deleted`
    -   `invoice.payment_succeeded` (for installments)
6.  Copy `Signing Secret` (whsec_...).

## RevenueOS Setup
1.  Navigate to `/app/integrations/stripe`.
2.  (Optional) Enter `Account ID` if using Connect.
3.  Save configuration.

## Testing
```bash
stripe trigger checkout.session.completed
```
Check `/app/integrations/stripe` logs tab.
