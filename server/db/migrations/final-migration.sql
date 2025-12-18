-- ==========================================
-- MIGRATE ALL REMAINING USERS TO EMPLOYEE PROFILES
-- ==========================================

BEGIN;

-- ==========================================
-- STEP 1: Create employee profiles for remaining users
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
)
ON CONFLICT (employee_number) DO NOTHING;

-- ==========================================
-- STEP 2: Create compensation records with ALL required fields
-- ==========================================
INSERT INTO employee_compensation (
  user_id,
  base_salary,
  salary_type,
  payment_frequency,
  currency,
  effective_from,
  is_current,
  created_at,
  updated_at
)
SELECT 
  u.id,
  25000.00 as base_salary,
  'monthly' as salary_type,
  'monthly' as payment_frequency,
  'ZAR' as currency,
  COALESCE(u.created_at::date, CURRENT_DATE) as effective_from,
  true as is_current,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM employee_compensation ec WHERE ec.user_id = u.id
);

COMMIT;

-- ==========================================
-- VERIFICATION
-- ==========================================
\echo ''
\echo '========================================'
\echo 'MIGRATION SUMMARY'
\echo '========================================'

SELECT 
  'Total Users' as metric,
  COUNT(*)::text as count
FROM users
UNION ALL
SELECT 
  'Employee Profiles',
  COUNT(*)::text
FROM employee_profiles
UNION ALL
SELECT 
  'Employee Compensation',
  COUNT(*)::text
FROM employee_compensation
UNION ALL
SELECT 
  'Users Missing Profiles',
  COUNT(*)::text
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM employee_profiles ep WHERE ep.user_id = u.id)
UNION ALL
SELECT 
  'Users Missing Compensation',
  COUNT(*)::text
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM employee_compensation ec WHERE ec.user_id = u.id);

\echo ''
\echo '========================================'
\echo 'ALL EMPLOYEES WITH PROFILES'
\echo '========================================'

SELECT 
  ep.employee_number,
  u.name,
  u.email,
  u.role,
  ep.employment_status,
  COALESCE(d.name, 'No Department') as department,
  COALESCE(jp.title, 'No Position') as position,
  ec.base_salary
FROM employee_profiles ep
JOIN users u ON u.id = ep.user_id
LEFT JOIN departments d ON d.id = ep.department_id
LEFT JOIN job_positions jp ON jp.id = ep.job_position_id
LEFT JOIN employee_compensation ec ON ec.user_id = ep.user_id
ORDER BY ep.employee_number;