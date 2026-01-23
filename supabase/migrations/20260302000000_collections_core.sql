-- Migration: WhatsApp Collections & Recovery Core
-- Sprint 2 - RevenueOS v2.1

-- 1. Contact Consent
CREATE TABLE IF NOT EXISTS public.contact_consent (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email')),
    status TEXT NOT NULL CHECK (status IN ('opted_in', 'opted_out')) DEFAULT 'opted_in',
    source TEXT, -- checkout, form, manual
    consented_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(org_id, customer_id, channel)
);

-- RLS for contact_consent
ALTER TABLE public.contact_consent ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view contact consent in their org" ON public.contact_consent
FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));

-- 2. Message Templates
CREATE TABLE IF NOT EXISTS public.message_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email')),
    key TEXT NOT NULL, -- e.g., 'friendly_reminder_1'
    language TEXT DEFAULT 'pt_BR',
    content TEXT NOT NULL,
    provider_template_id TEXT, -- WhatsApp template name in Meta
    status TEXT NOT NULL CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(org_id, key, language)
);

-- RLS for message_templates
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view templates in their org" ON public.message_templates
FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));

-- 3. Message Logs
CREATE TABLE IF NOT EXISTS public.message_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    channel TEXT NOT NULL,
    template_key TEXT,
    payload JSONB NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('queued', 'sent', 'delivered', 'read', 'failed')) DEFAULT 'queued',
    provider_message_id TEXT,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- RLS for message_logs
ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view message logs in their org" ON public.message_logs
FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));

-- 4. Collections Cases (Kanban)
CREATE TABLE IF NOT EXISTS public.collections_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    installment_id UUID REFERENCES public.installments(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('open', 'in_negotiation', 'promised', 'paid', 'closed')) DEFAULT 'open',
    priority_score INTEGER DEFAULT 0,
    next_action_at TIMESTAMP WITH TIME ZONE,
    assigned_to_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- RLS for collections_cases
ALTER TABLE public.collections_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view collections cases in their org" ON public.collections_cases
FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));

-- 5. Payment Promises
CREATE TABLE IF NOT EXISTS public.payment_promises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    installment_id UUID REFERENCES public.installments(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
    promised_date DATE NOT NULL,
    promised_amount_cents BIGINT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'kept', 'broken', 'cancelled')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- RLS for payment_promises
ALTER TABLE public.payment_promises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view payment promises in their org" ON public.payment_promises
FOR SELECT TO authenticated USING (org_id IN (SELECT get_my_org_ids()));
