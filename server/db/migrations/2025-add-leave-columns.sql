-- ==========================================
-- Add Missing Columns to leave_requests
-- ==========================================

BEGIN;

-- Add number_of_days column
ALTER TABLE leave_requests 
ADD COLUMN IF NOT EXISTS number_of_days numeric(5,2);

-- Calculate for existing records (exclude weekends)
UPDATE leave_requests 
SET number_of_days = (
  SELECT COUNT(*)
  FROM generate_series(start_date, end_date, '1 day'::interval) AS d
  WHERE EXTRACT(DOW FROM d) NOT IN (0, 6)
)
WHERE number_of_days IS NULL;

-- Make it NOT NULL
ALTER TABLE leave_requests 
ALTER COLUMN number_of_days SET NOT NULL;

-- Add other missing columns
ALTER TABLE leave_requests 
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS emergency_contact varchar(255),
ADD COLUMN IF NOT EXISTS emergency_phone varchar(50),
ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT CURRENT_TIMESTAMP;

-- Update constraints
ALTER TABLE leave_requests 
DROP CONSTRAINT IF EXISTS leave_requests_leave_type_check;

ALTER TABLE leave_requests 
ADD CONSTRAINT leave_requests_leave_type_check 
CHECK (leave_type IN ('annual', 'sick', 'unpaid', 'study', 'maternity', 'paternity', 'vacation', 'personal', 'other'));

ALTER TABLE leave_requests 
DROP CONSTRAINT IF EXISTS leave_requests_status_check;

ALTER TABLE leave_requests 
ADD CONSTRAINT leave_requests_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));

COMMIT;

-- Verify
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'leave_requests'
ORDER BY ordinal_position;