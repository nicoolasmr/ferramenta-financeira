
-- Migration: Add project_id to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_products_project ON products(project_id);
