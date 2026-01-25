-- JANITOR: Delete any organization created in the last 24 hours that has NO members
-- This cleans up failed onboarding attempts where the Org was created but the Membership failed.

DELETE FROM organizations
WHERE created_at > NOW() - INTERVAL '24 hours'
AND id NOT IN (SELECT DISTINCT org_id FROM memberships);

-- Also, forcing a cleanup of any organization named 'teste' just to be sure (if it has 0 members)
DELETE FROM organizations 
WHERE slug = 'teste' 
AND id NOT IN (SELECT DISTINCT org_id FROM memberships);
