# Asaas Integration Guide

## Overview
Syncs Boletos/Pix issuances and payments. Useful for "Installments Calendar".

## Configuration
1.  Go to **Minha Conta > Integração**.
2.  Generate API Key (if needed for API access).
3.  Go to **Webhooks**.
4.  Set URL: `https://[YOUR_DOMAIN]/api/webhooks/asaas`.
5.  Events:
    -   `PAYMENT_RECEIVED`
    -   `PAYMENT_OVERDUE`
    -   `PAYMENT_CONFIRMED`

## RevenueOS Setup
1.  Navigate to `/app/integrations/asaas`.
2.  Enter API Key.
3.  Save.

## Reference
[Asaas Webhook Docs](https://docs.asaas.com/docs/webhook-para-cobrancas)
