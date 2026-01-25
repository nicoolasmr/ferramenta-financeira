
-- Migration: Generic Subscriptions
-- Purpose: Allow multiple providers (Asaas, Kiwify, etc.) in subscriptions table

ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS provider text,
ADD COLUMN IF NOT EXISTS external_id text;

-- Backfill defaults for existing stripe rows (if any)
UPDATE public.subscriptions 
SET provider = 'stripe', external_id = stripe_subscription_id 
WHERE provider IS NULL AND stripe_subscription_id IS NOT NULL;

-- Unique constraint for idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_provider_unique 
ON public.subscriptions (org_id, provider, external_id) 
WHERE external_id IS NOT NULL;
