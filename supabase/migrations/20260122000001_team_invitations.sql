-- Create team invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(org_id, email)
);
-- Create index for token lookups
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token) WHERE accepted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_team_invitations_org_id ON team_invitations(org_id);

-- Ensure correct column name in team_invitations (idempotent rename)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='team_invitations' AND column_name='organization_id') THEN
        ALTER TABLE public.team_invitations RENAME COLUMN organization_id TO org_id;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_invitations
DROP POLICY IF EXISTS "Users can view invitations for their organizations" ON team_invitations;
CREATE POLICY "Users can view invitations for their organizations"
  ON team_invitations FOR SELECT
  USING (
    org_id IN (
      SELECT org_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners and admins can create invitations" ON team_invitations;
CREATE POLICY "Owners and admins can create invitations"
  ON team_invitations FOR INSERT
  WITH CHECK (
    org_id IN (
      SELECT org_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Owners and admins can delete invitations" ON team_invitations;
CREATE POLICY "Owners and admins can delete invitations"
  ON team_invitations FOR DELETE
  USING (
    org_id IN (
      SELECT org_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Function to accept invitation
CREATE OR REPLACE FUNCTION accept_team_invitation(invitation_token TEXT)
RETURNS JSONB AS $$
DECLARE
  invitation RECORD;
  new_member_id UUID;
BEGIN
  -- Find and validate invitation
  SELECT * INTO invitation
  FROM team_invitations
  WHERE token = invitation_token
    AND accepted_at IS NULL
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;

  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM organization_members
    WHERE org_id = invitation.org_id
    AND user_id = auth.uid()
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already a member');
  END IF;

  -- Add user as member
  INSERT INTO organization_members (org_id, user_id, role, invited_by)
  VALUES (invitation.org_id, auth.uid(), invitation.role, invitation.created_by)
  RETURNING id INTO new_member_id;

  -- Mark invitation as accepted
  UPDATE team_invitations
  SET accepted_at = NOW()
  WHERE id = invitation.id;

  RETURN jsonb_build_object(
    'success', true,
    'org_id', invitation.org_id,
    'member_id', new_member_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
