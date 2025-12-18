-- ==========================================
-- MIGRATE EXISTING USERS TO EMPLOYEE PROFILES
-- Based on actual table structure
-- ==========================================

BEGIN;

-- ==========================================
-- STEP 1: Create employee profiles for existing users
-- ==========================================
INSERT INTO employee_profiles (
  user_id,
  employee_number,
  first_name,
  last_name,
  employment_status,
  employment_type,
  hire_date,
  personal_email,
  created_at,
  updated_at
)
SELECT 
  u.id,
  'EMP' || LPAD(u.id::text, 3, '0') as employee_number,
  SPLIT_PART(u.name, ' ', 1) as first_name,
  CASE 
    WHEN ARRAY_LENGTH(STRING_TO_ARRAY(u.name, ' '), 1) > 1 
    THEN SUBSTRING(u.name FROM POSITION(' ' IN u.name) + 1)
    ELSE ''
  END as last_name,
  'active' as employment_status,
  'full-time' as employment_type,
  COALESCE(u.created_at::date, CURRENT_DATE) as hire_date,
  u.email as personal_email,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM employee_profiles ep WHERE ep.user_id = u.id
);

-- ==========================================
-- STEP 2: Create compensation records
-- ==========================================
INSERT INTO employee_compensation (
  user_id,
  base_salary,
  salary_type,
  payment_frequency,
  created_at
)
SELECT 
  u.id,
  25000.00 as base_salary,
  'monthly' as salary_type,
  'monthly' as payment_frequency,
  CURRENT_TIMESTAMP
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM employee_compensation ec WHERE ec.user_id = u.id
);

-- ==========================================
-- STEP 3: Create leave balances for current year
-- ==========================================
DO $$
DECLARE
  current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT id FROM users 
    WHERE NOT EXISTS (
      SELECT 1 FROM employee_leave_balances elb 
      WHERE elb.user_id = users.id 
      AND elb.year = current_year
    )
  LOOP
    -- Annual leave
    INSERT INTO employee_leave_balances (
      user_id, leave_type, year, total_days, used_days, remaining_days
    ) VALUES (
      user_record.id, 'annual', current_year, 21, 0, 21
    );
    
    -- Sick leave
    INSERT INTO employee_leave_balances (
      user_id, leave_type, year, total_days, used_days, remaining_days
    ) VALUES (
      user_record.id, 'sick', current_year, 30, 0, 30
    );
    
    -- Unpaid leave
    INSERT INTO employee_leave_balances (
      user_id, leave_type, year, total_days, used_days, remaining_days
    ) VALUES (
      user_record.id, 'unpaid', current_year, 0, 0, 0
    );
  END LOOP;
END $$;

COMMIT;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Summary counts
SELECT 
  'Users' as table_name,
  COUNT(*) as count
FROM users
UNION ALL
SELECT 
  'Employee Profiles',
  COUNT(*)
FROM employee_profiles
UNION ALL
SELECT 
  'Employee Compensation',
  COUNT(*)
FROM employee_compensation
UNION ALL
SELECT 
  'Leave Balances',
  COUNT(*)
FROM employee_leave_balances;

-- Show all migrated employees
SELECT 
  ep.employee_number,
  ep.first_name || ' ' || ep.last_name as full_name,
  ep.personal_email as email,
  ep.employment_status,
  ep.employment_type,
  ep.hire_date,
  ec.base_salary,
  u.role
FROM employee_profiles ep
JOIN users u ON ep.user_id = u.id
LEFT JOIN employee_compensation ec ON ec.user_id = u.id
ORDER BY ep.employee_number;

-- Check leave balances
SELECT 
  u.name,
  elb.leave_type,
  elb.total_days,
  elb.remaining_days
FROM employee_leave_balances elb
JOIN users u ON elb.user_id = u.id
WHERE elb.year = EXTRACT(YEAR FROM CURRENT_DATE)
ORDER BY u.name, elb.leave_type;