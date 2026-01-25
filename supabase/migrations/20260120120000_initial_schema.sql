-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Users (Profile table linked to auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 3. Memberships (Linking Users to Orgs)
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(org_id, user_id)
);

-- 4. Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'standard',
    price_cents INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    document TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    source TEXT DEFAULT 'manual',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    source TEXT DEFAULT 'manual',
    external_id TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, canceled, refunded, chargeback
    currency TEXT DEFAULT 'BRL',
    gross_amount_cents INTEGER NOT NULL DEFAULT 0,
    net_amount_cents INTEGER NOT NULL DEFAULT 0,
    fees_cents INTEGER NOT NULL DEFAULT 0,
    tax_cents INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    purchase_datetime TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    qty INTEGER NOT NULL DEFAULT 1,
    unit_price_cents INTEGER NOT NULL DEFAULT 0,
    discount_cents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 8. Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    method TEXT NOT NULL, -- credit_card, pix, boleto
    gateway TEXT NOT NULL,
    status TEXT NOT NULL,
    installments INTEGER DEFAULT 1,
    amount_cents INTEGER NOT NULL,
    external_id TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 9. Refunds
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    amount_cents INTEGER NOT NULL,
    reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 10. Payouts (Settlements)
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    source TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,
    external_id TEXT,
    payout_datetime TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 11. Integrations
CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'inactive',
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(org_id, provider)
);

-- 12. Sync Runs
CREATE TABLE IF NOT EXISTS sync_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL, -- running, success, failed
    stats JSONB DEFAULT '{}'::jsonb,
    error_message TEXT
);

-- 13. Webhook Inbox
CREATE TABLE IF NOT EXISTS webhook_inbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    provider TEXT NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending',
    payload JSONB NOT NULL,
    error_message TEXT
);

-- 14. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    before JSONB,
    after JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Payment Events
CREATE TABLE IF NOT EXISTS payment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);


-- Indexes
CREATE INDEX IF NOT EXISTS idx_memberships_org_user ON memberships(org_id, user_id);
CREATE INDEX IF NOT EXISTS idx_customers_org ON customers(org_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_orders_org ON orders(org_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_org ON payments(org_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(org_id);


-- Row Level Security (RLS)

-- Helper function to check membership
CREATE OR REPLACE FUNCTION get_user_role(org_id UUID)
RETURNS TEXT AS $$
SELECT role FROM memberships
WHERE memberships.org_id = $1
AND memberships.user_id = auth.uid()
LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if user is in org
CREATE OR REPLACE FUNCTION is_org_member(p_org_id UUID)
RETURNS BOOLEAN AS $$
SELECT EXISTS (
  SELECT 1 FROM memberships
  WHERE memberships.org_id = $1
  AND memberships.user_id = auth.uid()
);
$$ LANGUAGE sql SECURITY DEFINER;


-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;


-- POLICIES

-- Organizations
-- Users can see organizations they belong to
DROP POLICY IF EXISTS "Users can view own organizations" ON organizations;
CREATE POLICY "Users can view own organizations" ON organizations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM memberships
    WHERE memberships.org_id = organizations.id
    AND memberships.user_id = auth.uid()
  )
);
-- Only users can create organizations (logic handled usually by app/functions, but allow insert for authenticated)
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
CREATE POLICY "Authenticated users can create organizations" ON organizations
FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- Users
-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = id);
-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = id);

-- Memberships
-- Users can view their own membership
DROP POLICY IF EXISTS "Users can view own memberships" ON memberships;
CREATE POLICY "Users can view own memberships" ON memberships
FOR SELECT USING (user_id = auth.uid());

-- Members can view memberships of their org (using subquery to avoid recursion)
DROP POLICY IF EXISTS "Members can view org memberships" ON memberships;
CREATE POLICY "Members can view org memberships" ON memberships
FOR SELECT USING (
  org_id IN (
    SELECT m.org_id FROM memberships m WHERE m.user_id = auth.uid()
  )
);

-- Products
DROP POLICY IF EXISTS "Org members can view products" ON products;
CREATE POLICY "Org members can view products" ON products FOR SELECT USING (is_org_member(org_id));
DROP POLICY IF EXISTS "Org admins/owners can manage products" ON products;
CREATE POLICY "Org admins/owners can manage products" ON products FOR ALL USING (get_user_role(org_id) IN ('owner', 'admin'));

-- Customers
DROP POLICY IF EXISTS "Org members can view customers" ON customers;
CREATE POLICY "Org members can view customers" ON customers FOR SELECT USING (is_org_member(org_id));
DROP POLICY IF EXISTS "Org members can manage customers" ON customers;
CREATE POLICY "Org members can manage customers" ON customers FOR ALL USING (get_user_role(org_id) IN ('owner', 'admin', 'member'));

-- Orders
DROP POLICY IF EXISTS "Org members can view orders" ON orders;
CREATE POLICY "Org members can view orders" ON orders FOR SELECT USING (is_org_member(org_id));
DROP POLICY IF EXISTS "Org members can manage orders" ON orders;
CREATE POLICY "Org members can manage orders" ON orders FOR ALL USING (get_user_role(org_id) IN ('owner', 'admin', 'member'));

-- Order Items
DROP POLICY IF EXISTS "Org members can view order items" ON order_items;
CREATE POLICY "Org members can view order items" ON order_items FOR SELECT USING (is_org_member(org_id));

-- Payments
DROP POLICY IF EXISTS "Org members can view payments" ON payments;
CREATE POLICY "Org members can view payments" ON payments FOR SELECT USING (is_org_member(org_id));

-- Refunds
DROP POLICY IF EXISTS "Org members can view refunds" ON refunds;
CREATE POLICY "Org members can view refunds" ON refunds FOR SELECT USING (is_org_member(org_id));

-- Payouts
DROP POLICY IF EXISTS "Org owners/admins can view payouts" ON payouts;
CREATE POLICY "Org owners/admins can view payouts" ON payouts FOR SELECT USING (get_user_role(org_id) IN ('owner', 'admin'));

-- Integrations
DROP POLICY IF EXISTS "Org owners/admins can view integrations" ON integrations;
CREATE POLICY "Org owners/admins can view integrations" ON integrations FOR SELECT USING (get_user_role(org_id) IN ('owner', 'admin'));
DROP POLICY IF EXISTS "Org owners/admins can manage integrations" ON integrations;
CREATE POLICY "Org owners/admins can manage integrations" ON integrations FOR ALL USING (get_user_role(org_id) IN ('owner', 'admin'));

-- Audit Logs
DROP POLICY IF EXISTS "Org owners/admins can view logs" ON audit_logs;
CREATE POLICY "Org owners/admins can view logs" ON audit_logs FOR SELECT USING (get_user_role(org_id) IN ('owner', 'admin'));

-- Sync Runs & Webhooks
DROP POLICY IF EXISTS "Org owners/admins can view ops" ON sync_runs;
CREATE POLICY "Org owners/admins can view ops" ON sync_runs FOR SELECT USING (get_user_role(org_id) IN ('owner', 'admin'));
DROP POLICY IF EXISTS "Org owners/admins can view webhooks" ON webhook_inbox;
CREATE POLICY "Org owners/admins can view webhooks" ON webhook_inbox FOR SELECT USING (get_user_role(org_id) IN ('owner', 'admin'));

