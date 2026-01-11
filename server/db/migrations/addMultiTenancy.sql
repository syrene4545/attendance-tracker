-- ==================== MULTI-TENANCY MIGRATION ====================

-- 1. Create companies table (if not exists)
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL,
  domain VARCHAR(255) UNIQUE,
  registration_number VARCHAR(100),
  tax_number VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'South Africa',
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#4F46E5',
  secondary_color VARCHAR(7) DEFAULT '#7C3AED',
  subscription_plan VARCHAR(50) DEFAULT 'trial',
  max_employees INTEGER DEFAULT 10,
  subscription_start_date DATE,
  subscription_end_date DATE,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- 2. Add company_id to all your tables
DO $$
BEGIN
  -- Core tables
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='company_id') THEN
    ALTER TABLE users ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='departments' AND column_name='company_id') THEN
    ALTER TABLE departments ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='job_positions' AND column_name='company_id') THEN
    ALTER TABLE job_positions ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee_profiles' AND column_name='company_id') THEN
    ALTER TABLE employee_profiles ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  -- Attendance
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='attendance_logs' AND column_name='company_id') THEN
    ALTER TABLE attendance_logs ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='daily_attendance_summary' AND column_name='company_id') THEN
    ALTER TABLE daily_attendance_summary ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='monthly_statistics' AND column_name='company_id') THEN
    ALTER TABLE monthly_statistics ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='late_arrivals' AND column_name='company_id') THEN
    ALTER TABLE late_arrivals ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  -- Leave
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leave_requests' AND column_name='company_id') THEN
    ALTER TABLE leave_requests ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee_leave_balances' AND column_name='company_id') THEN
    ALTER TABLE employee_leave_balances ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  -- Assessments
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessments' AND column_name='company_id') THEN
    ALTER TABLE assessments ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessment_questions' AND column_name='company_id') THEN
    ALTER TABLE assessment_questions ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessment_attempts' AND column_name='company_id') THEN
    ALTER TABLE assessment_attempts ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='assessment_answers' AND column_name='company_id') THEN
    ALTER TABLE assessment_answers ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_certifications' AND column_name='company_id') THEN
    ALTER TABLE user_certifications ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='badges' AND column_name='company_id') THEN
    ALTER TABLE badges ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_badges' AND column_name='company_id') THEN
    ALTER TABLE user_badges ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  -- Payroll
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee_allowances' AND column_name='company_id') THEN
    ALTER TABLE employee_allowances ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee_compensation' AND column_name='company_id') THEN
    ALTER TABLE employee_compensation ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee_deductions' AND column_name='company_id') THEN
    ALTER TABLE employee_deductions ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payroll_items' AND column_name='company_id') THEN
    ALTER TABLE payroll_items ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payroll_runs' AND column_name='company_id') THEN
    ALTER TABLE payroll_runs ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  -- Other
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employee_documents' AND column_name='company_id') THEN
    ALTER TABLE employee_documents ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='performance_reviews' AND column_name='company_id') THEN
    ALTER TABLE performance_reviews ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shifts' AND column_name='company_id') THEN
    ALTER TABLE shifts ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_shifts' AND column_name='company_id') THEN
    ALTER TABLE user_shifts ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='company_id') THEN
    ALTER TABLE notifications ADD COLUMN company_id INTEGER REFERENCES companies(id);
  END IF;
END $$;

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_departments_company_id ON departments(company_id);
CREATE INDEX IF NOT EXISTS idx_job_positions_company_id ON job_positions(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_company_id ON employee_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_company_id ON attendance_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_company_id ON leave_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_leave_balances_company_id ON employee_leave_balances(company_id);
CREATE INDEX IF NOT EXISTS idx_assessments_company_id ON assessments(company_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_company_id ON assessment_attempts(company_id);
CREATE INDEX IF NOT EXISTS idx_user_certifications_company_id ON user_certifications(company_id);
CREATE INDEX IF NOT EXISTS idx_companies_subdomain ON companies(subdomain);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);

-- 4. Supporting tables
CREATE TABLE IF NOT EXISTS company_invitations (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'assistant',
  token VARCHAR(255) UNIQUE NOT NULL,
  invited_by INTEGER REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, email)
);

CREATE TABLE IF NOT EXISTS company_settings (
  id SERIAL PRIMARY KEY,
  company_id INTEGER UNIQUE NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  work_start_time TIME DEFAULT '08:00:00',
  work_end_time TIME DEFAULT '17:00:00',
  timezone VARCHAR(100) DEFAULT 'Africa/Johannesburg',
  annual_leave_days INTEGER DEFAULT 21,
  sick_leave_days INTEGER DEFAULT 30,
  late_threshold_minutes INTEGER DEFAULT 15,
  early_leave_threshold_minutes INTEGER DEFAULT 15,
  require_clock_out BOOLEAN DEFAULT true,
  enable_email_notifications BOOLEAN DEFAULT true,
  enable_sms_notifications BOOLEAN DEFAULT false,
  features JSONB DEFAULT '{"attendance": true, "leave": true, "payroll": true, "assessments": true}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS company_audit_log (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_company_id ON company_audit_log(company_id);

-- Success message
SELECT 'Multi-tenancy schema migration complete!' as status;