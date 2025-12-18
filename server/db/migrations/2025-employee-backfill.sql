-- Create employee profiles for existing users who don't have one
INSERT INTO employee_profiles (
  user_id,
  employee_number,
  first_name,
  last_name,
  email,
  employment_status,
  employment_type,
  hire_date,
  created_at,
  updated_at
)
SELECT 
  u.id,
  'EMP' || LPAD(u.id::text, 3, '0') as employee_number, -- EMP001, EMP002, etc.
  SPLIT_PART(u.name, ' ', 1) as first_name,              -- First word of name
  CASE 
    WHEN ARRAY_LENGTH(STRING_TO_ARRAY(u.name, ' '), 1) > 1 
    THEN SUBSTRING(u.name FROM POSITION(' ' IN u.name) + 1)
    ELSE ''
  END as last_name,                                       -- Rest of name
  u.email,
  'active' as employment_status,
  'full-time' as employment_type,
  COALESCE(u.created_at, CURRENT_TIMESTAMP) as hire_date,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM employee_profiles ep WHERE ep.user_id = u.id
);

-- Also create compensation records
INSERT INTO employee_compensation (
  user_id,
  base_salary,
  salary_type,
  payment_frequency,
  effective_date,
  created_at
)
SELECT 
  u.id,
  25000.00 as base_salary, -- Default salary
  'monthly',
  'monthly',
  CURRENT_DATE,
  CURRENT_TIMESTAMP
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM employee_compensation ec WHERE ec.user_id = u.id
);

-- Create leave balances
INSERT INTO employee_leave_balances (
  user_id,
  leave_type,
  year,
  total_days,
  used_days,
  remaining_days
)
SELECT 
  u.id,
  leave_type,
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  total_days,
  0,
  total_days
FROM users u
CROSS JOIN (
  VALUES 
    ('annual', 21),
    ('sick', 30),
    ('unpaid', 0)
) AS lt(leave_type, total_days)
WHERE NOT EXISTS (
  SELECT 1 FROM employee_leave_balances elb 
  WHERE elb.user_id = u.id 
  AND elb.year = EXTRACT(YEAR FROM CURRENT_DATE)
);