# Open Finance Moat — Overview

RevenueOS v2.1 introduces Open Finance connectivity to enable the "Caixa Real" feature.

## Architecture

### MVP: Aggregator Mode
We use a standard interface `BankProviderAdapter` to talk to Open Finance aggregators (like Belvo or Pluggy). This allows us to scale quickly without building specific bank connectors for every institution.

### Roadmap: Direct OFB
In the future, we will implement direct connections to the Open Finance Brasil endpoints for designated institutions.

## Data Pipeline
1. **Consent**: User authorizes read access to bank accounts and transactions.
2. **Ingestion**: Raw transaction data is pulled into `bank_transactions_raw`.
3. **Normalization**: Data is cleaned and mapped to `bank_transactions_normalized`.
4. **Matching**: Our deterministic engine matches specific payout events (from Stripe/Hotmart) to bank credits.
