-- Migration: Secure Admin Configuration
-- Description: Moves hardcoded master admin emails to a configuration table for easier management and better security.

-- 1. Create Config Table
CREATE TABLE IF NOT EXISTS public.app_configs (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Seed Master Admin
INSERT INTO public.app_configs (key, value)
VALUES ('master_admin_emails', '["nicoolascf5@gmail.com"]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 3. Update RLS Bypass Function
-- Optimized to use the config table instead of hardcoded strings
CREATE OR REPLACE FUNCTION public.is_master_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.app_configs 
    WHERE key = 'master_admin_emails' 
    AND value ? (auth.jwt() ->> 'email')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable RLS on app_configs to prevent unauthorized access
ALTER TABLE public.app_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AppConfigs_Select_Master" ON public.app_configs FOR SELECT
USING (is_master_admin());
