# Hotmart Integration Guide

## Overview
Syncs "Sales" from Hotmart as "Orders" in RevenueOS.

## Configuration
1.  Log in to Hotmart Developers.
2.  Go to **Tools > Webhooks (API and Notifications)**.
3.  Create Config:
    -   **Name**: RevenueOS
    -   **URL**: `https://[YOUR_DOMAIN]/api/webhooks/hotmart`
    -   **Events**: "Purchase Complete", "Purchase Canceled", "Purchase Refunded".
4.  Copy the `Hottok` (Token) displayed on the setup screen.

## RevenueOS Setup
1.  Navigate to `/app/integrations/hotmart`.
2.  Enter the `Hottok`.
3.  Save.

## Payload Mapping
-   `transaction` -> `external_order_id`
-   `buyer.email` -> `customer_email`
-   `price.value` -> `amount_cents` (normalized)

## Reference
[Hotmart Webhook Docs](https://developers.hotmart.com/docs/en/2.0.0/webhook/purchase-webhook/)
