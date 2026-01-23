# Belvo Integration (Open Finance)

RevenueOS uses Belvo to aggregate bank accounts and transactions, providing the "Caixa Real" (Cash Reality) layer.

## Credentials Setup

1.  Log in to the [Belvo Dashboard](https://dashboard.belvo.com/).
2.  Go to the **Settings** or **API Keys** section.
3.  Copy your `Secret ID` and `Secret Password`.
4.  Add them to your `.env` file (or Vercel environment variables):
    *   `BELVO_SECRET_ID`
    *   `BELVO_SECRET_PASSWORD`
    *   `BELVO_BASE_URL` (Use Sandbox URL for testing)

## Webhook Configuration

Belvo sends data updates via webhooks. You must configure one in the Belvo Dashboard:

1.  Navigate to the **Webhooks** section.
2.  Add a new webhook:
    *   **URL**: `https://<your-domain>/api/webhooks/belvo/data`
    *   **Events**: `DATA_WEBHOOK`
3.  (Optional) Set a `BELVO_WEBHOOK_TOKEN` in your env vars if you want to validate incoming requests.

## Environments

- **Sandbox**: Monthly reset, use for development.
- **Production**: Requires explicit request for access and agreement with Belvo.

## Data Schema (Deterministic)

We follow the anti-fragile pattern:
1.  **RAW**: Exact JSON received from Belvo recorded in `bank_transactions_raw`.
2.  **NORMALIZED**: Cleaned and hashed data in `bank_transactions_normalized`.
3.  **APPLIED**: Connected to projects and used in financial views.
