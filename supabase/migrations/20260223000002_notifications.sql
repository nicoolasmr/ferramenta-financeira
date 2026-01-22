-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Optional: Specific user targeting
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  link TEXT, -- Optional: Link to relevant resource
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_org_id ON public.notifications(org_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON public.notifications(read_at) WHERE read_at IS NULL;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view notifications for their org" ON public.notifications;
CREATE POLICY "Users can view notifications for their org"
  ON public.notifications FOR SELECT
  USING (
    org_id IN (SELECT get_my_org_ids())
    OR (user_id = auth.uid())
    OR is_master_admin()
  );

DROP POLICY IF EXISTS "Users can mark their own org notifications as read" ON public.notifications;
CREATE POLICY "Users can mark their own org notifications as read"
  ON public.notifications FOR UPDATE
  USING (
    org_id IN (SELECT get_my_org_ids())
    OR (user_id = auth.uid())
    OR is_master_admin()
  )
  WITH CHECK (read_at IS NOT NULL);

-- Master admin bypass for all operations
DROP POLICY IF EXISTS "Master admin manage notifications" ON public.notifications;
CREATE POLICY "Master admin manage notifications"
  ON public.notifications FOR ALL
  USING (is_master_admin());
