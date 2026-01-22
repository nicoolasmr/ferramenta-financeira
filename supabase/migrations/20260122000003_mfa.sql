-- Create MFA secrets table
CREATE TABLE IF NOT EXISTS user_mfa_secrets (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT[], -- Array of recovery codes (hashed)
  enabled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create organization security settings
CREATE TABLE IF NOT EXISTS organization_security_settings (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  enforce_mfa BOOLEAN DEFAULT FALSE,
  mfa_grace_period_days INT DEFAULT 7,
  session_timeout_minutes INT DEFAULT 480, -- 8 hours
  ip_whitelist INET[],
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_mfa_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_security_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_mfa_secrets
DROP POLICY IF EXISTS "Users can manage their own MFA" ON user_mfa_secrets;
CREATE POLICY "Users can manage their own MFA"
  ON user_mfa_secrets FOR ALL
  USING (user_id = auth.uid());

-- RLS Policies for organization_security_settings
DROP POLICY IF EXISTS "Users can view security settings of their organizations" ON organization_security_settings;
CREATE POLICY "Users can view security settings of their organizations"
  ON organization_security_settings FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners can update security settings" ON organization_security_settings;
CREATE POLICY "Owners can update security settings"
  ON organization_security_settings FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
    )
  );

-- Function to generate backup codes
CREATE OR REPLACE FUNCTION generate_mfa_backup_codes()
RETURNS TEXT[] AS $$
DECLARE
  codes TEXT[];
  i INT;
  code TEXT;
BEGIN
  codes := ARRAY[]::TEXT[];
  
  FOR i IN 1..10 LOOP
    code := encode(gen_random_bytes(6), 'hex');
    codes := array_append(codes, encode(digest(code, 'sha256'), 'hex'));
  END LOOP;
  
  RETURN codes;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_user_mfa_secrets_updated_at ON user_mfa_secrets;
CREATE TRIGGER update_user_mfa_secrets_updated_at
  BEFORE UPDATE ON user_mfa_secrets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
