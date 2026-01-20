# Stripe Integration

## Configuração

1. Acesse o dashboard do Stripe (Developer > Keys).
2. Obtenha **Publishable Key** e **Secret Key**.
3. Configure o **Webhook Endpoint**:
   - URL: `https://seu-dominio.com/api/webhooks/stripe`
   - Eventos necessários:
     - `checkout.session.completed` (Vendas)
     - `charge.refunded` (Reembolsos)
     - `charge.dispute.created` (Chargebacks)

## Como testar (Sandbox)
1. Use o Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
2. Trigger um evento:
   ```bash
   stripe trigger checkout.session.completed
   ```

## Logs
Verifique os logs de recebimento em `/ops` ou na tabela `external_events`.
