
-- DUNNING ENGINE SCHEMA

-- 1. TEMPLATES (Email/WhatsApp scripts)
CREATE TABLE IF NOT EXISTS public.dunning_templates (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    type text NOT NULL CHECK (type IN ('email', 'whatsapp', 'sms')),
    name text NOT NULL,
    subject text, -- For email
    body_content text NOT NULL, -- Liquid syntax supported
    is_default boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    
    CONSTRAINT dunning_templates_pkey PRIMARY KEY (id),
    CONSTRAINT dunning_templates_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);

-- 2. RULES (The "Régua de Cobrança")
CREATE TABLE IF NOT EXISTS public.dunning_rules (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    days_after_due int NOT NULL, -- e.g. 1, 3, 7 (Can be negative for pre-dunning)
    channel text NOT NULL CHECK (channel IN ('email', 'whatsapp', 'sms')),
    template_id uuid NOT NULL,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    
    CONSTRAINT dunning_rules_pkey PRIMARY KEY (id),
    CONSTRAINT dunning_rules_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id),
    CONSTRAINT dunning_rules_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.dunning_templates(id),
    CONSTRAINT dunning_rules_unique_trigger UNIQUE (project_id, days_after_due, channel)
);

-- 3. LOGS (Audit & Idempotency)
-- Tracks "We sent Template X to Customer Y for Payment Z on Date W"
CREATE TABLE IF NOT EXISTS public.dunning_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    rule_id uuid, -- Optional, if manual run
    payment_id uuid, -- The debt
    customer_id text, -- or email
    channel text NOT NULL,
    status text NOT NULL DEFAULT 'sent', -- sent, failed, delivered, read
    provider_message_id text,
    sent_at timestamptz DEFAULT now(),
    
    CONSTRAINT dunning_logs_pkey PRIMARY KEY (id),
    CONSTRAINT dunning_logs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);

-- RLS
ALTER TABLE public.dunning_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dunning_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dunning_logs ENABLE ROW LEVEL SECURITY;

-- Standard Project policies (simplified for brevity, assume "Project Member" check logic)
CREATE POLICY "Project members can manage dunning" ON public.dunning_rules
    FOR ALL USING (
        exists (
            select 1 from projects p
            join organization_members om on p.org_id = om.org_id
            where p.id = dunning_rules.project_id
            and om.user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can manage templates" ON public.dunning_templates
    FOR ALL USING (
        exists (
            select 1 from projects p
            join organization_members om on p.org_id = om.org_id
            where p.id = dunning_templates.project_id
            and om.user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can view logs" ON public.dunning_logs
    FOR SELECT USING (
        exists (
            select 1 from projects p
            join organization_members om on p.org_id = om.org_id
            where p.id = dunning_logs.project_id
            and om.user_id = auth.uid()
        )
    );
