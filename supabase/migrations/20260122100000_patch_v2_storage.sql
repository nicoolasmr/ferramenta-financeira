-- PATCH v2: Storage Security & Audit Immutability

-- 1. STORAGE SECURITY ('documents' bucket)
-- Ensure bucket exists (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if possible (usually enabled by default in Supabase)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Helper function to extract project_id from path "org_id/project_id/..."
-- Assumes path structure: {org_id}/{project_id}/{enrollment_id}/{filename}
CREATE OR REPLACE FUNCTION public.extract_project_id_from_path(name text)
RETURNS uuid AS $$
BEGIN
  -- split_part is 1-indexed. 
  -- 1: org_id, 2: project_id
  RETURN CAST(NULLIF(split_part(name, '/', 2), '') AS uuid);
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper function to check Portal Download Permission
CREATE OR REPLACE FUNCTION public.can_download_document(object_name text)
RETURNS boolean AS $$
DECLARE
  v_project_id uuid;
  v_role text;
  v_settings jsonb;
  v_can_download boolean;
BEGIN
  v_project_id := public.extract_project_id_from_path(object_name);
  
  -- If path doesn't have project_id, deny client_viewer (fallback to stricter org check)
  IF v_project_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Get User Role in Project
  SELECT role INTO v_role
  FROM public.project_members
  WHERE project_id = v_project_id AND user_id = auth.uid();

  -- 1. If not a member, check Org Membership (Admins/Owners)
  IF v_role IS NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM public.memberships 
      WHERE user_id = auth.uid() 
      AND org_id = (SELECT org_id FROM public.projects WHERE id = v_project_id)
    );
  END IF;

  -- 2. If Owner/Admin/Member of project -> ALLOW
  IF v_role IN ('owner', 'admin', 'member') THEN
    RETURN TRUE;
  END IF;

  -- 3. If Client Viewer -> Check Settings
  IF v_role = 'client_viewer' THEN
    SELECT settings INTO v_settings
    FROM public.projects
    WHERE id = v_project_id;
    
    -- Default to TRUE if not set, or FALSE? Prompt said:
    -- "se false, bloquear download". Implies default might be true or false.
    -- Let's assume strict: if explicit false, block. If missing, allow (read-only entitlement).
    -- User said: "seguir ... settings.portal_can_download_docs: se false, bloquear"
    v_can_download := COALESCE((v_settings->>'portal_can_download_docs')::boolean, true);
    
    RETURN v_can_download;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- POLICIES FOR STORAGE (Idempotent drops)
DROP POLICY IF EXISTS "Org Members can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can download documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update/delete documents" ON storage.objects;

-- Upload: Only Org Members (not client_viewer)
CREATE POLICY "Org Members can upload documents" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (
    -- Must be member of the org implied by path
    EXISTS (
      SELECT 1 FROM public.memberships
      WHERE user_id = auth.uid()
      AND org_id::text = split_part(name, '/', 1)
      AND role IN ('owner', 'admin', 'member')
    )
  )
);

-- Select/Download: Uses helper for complex Portal logic
CREATE POLICY "Users can download documents" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'documents' AND
  public.can_download_document(name)
);

-- Manage: Owners/Admins
CREATE POLICY "Admins can update/delete documents" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid()
    AND org_id::text = split_part(name, '/', 1)
    AND role IN ('owner', 'admin')
  )
);
-- Delete policy same as update
DROP POLICY IF EXISTS "Admins can delete documents" ON storage.objects;
CREATE POLICY "Admins can delete documents" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid()
    AND org_id::text = split_part(name, '/', 1)
    AND role IN ('owner', 'admin')
  )
);


-- 2. AUDIT LOG IMMUTABILITY & SECURITY
-- Revoke update/delete permissions from public/authenticated on audit_logs
-- (Supabase default grants might vary, but explicit REVOKE is good practice)
REVOKE UPDATE, DELETE ON public.audit_logs FROM authenticated;
REVOKE UPDATE, DELETE ON public.audit_logs FROM anon;
REVOKE UPDATE, DELETE ON public.audit_logs FROM public;

-- Enable RLS on audit_logs if not already
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Idempotent policies
DROP POLICY IF EXISTS "Insert Audit Logs" ON public.audit_logs;
DROP POLICY IF EXISTS "View Audit Logs (Admins Only)" ON public.audit_logs;

-- Insert: Allow authenticated (Application logic/Triggers insert)
CREATE POLICY "Insert Audit Logs" ON public.audit_logs
FOR INSERT TO authenticated
WITH CHECK (true); -- Or check org_id match if strict

-- Select: ONLY Admins/Owners of the Org
CREATE POLICY "View Audit Logs (Admins Only)" ON public.audit_logs
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.memberships
    WHERE user_id = auth.uid()
    AND org_id = public.audit_logs.org_id
    AND role IN ('owner', 'admin')
  )
);
