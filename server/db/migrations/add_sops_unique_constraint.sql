-- ==================== ADD UNIQUE CONSTRAINT FOR SOP TITLES ====================
-- Purpose: Ensure idempotent seeding and prevent duplicate SOPs per company
-- Safe: Uses IF NOT EXISTS, won't fail if already exists

BEGIN;

-- Add unique constraint on (company_id, lowercase title)
-- This prevents race conditions and ensures true idempotency
CREATE UNIQUE INDEX IF NOT EXISTS uniq_sops_company_title
ON sops (company_id, LOWER(title));

-- Verify the index was created
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'sops'
  AND indexname = 'uniq_sops_company_title';

COMMIT;