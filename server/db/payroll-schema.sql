-- ==================== PAYROLL SYSTEM DATABASE SCHEMA ====================
-- Full employee management and organization structure for payroll

-- ==================== ORGANIZATION STRUCTURE ====================

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) UNIQUE,
  description TEXT,
  parent_department_id INTEGER REFERENCES departments(id),
  manager_id INTEGER REFERENCES users(id),
  cost_center VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job positions/titles table
CREATE TABLE IF NOT EXISTS job_positions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE,
  department_id INTEGER REFERENCES departments(id),
  job_grade VARCHAR(20),
  description TEXT,
  responsibilities TEXT,
  qualifications TEXT,
  salary_range_min DECIMAL(10,2),
  salary_range_max DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== EMPLOYEE INFORMATION ====================

-- Extended employee profiles (extends users table)
CREATE TABLE IF NOT EXISTS employee_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Personal Information
  employee_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  marital_status VARCHAR(20),
  nationality VARCHAR(50),
  
  -- Contact Information
  personal_email VARCHAR(255),
  phone_number VARCHAR(20),
  mobile_number VARCHAR(20),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(50),
  
  -- Address Information
  street_address TEXT,
  city VARCHAR(100),
  state_province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  
  -- Employment Information
  job_position_id INTEGER REFERENCES job_positions(id),
  department_id INTEGER REFERENCES departments(id),
  reports_to_id INTEGER REFERENCES users(id),
  employment_type VARCHAR(50), -- full-time, part-time, contract, intern
  employment_status VARCHAR(50), -- active, on-leave, suspended, terminated
  hire_date DATE NOT NULL,
  probation_end_date DATE,
  confirmation_date DATE,
  termination_date DATE,
  termination_reason TEXT,
  
  -- Work Schedule
  work_location VARCHAR(100),
  shift_type VARCHAR(50), -- day, night, rotating
  work_hours_per_week DECIMAL(5,2) DEFAULT 40.00,
  
  -- Documents
  id_number VARCHAR(50),
  passport_number VARCHAR(50),
  tax_number VARCHAR(50),
  social_security_number VARCHAR(50),
  
  -- System fields
  profile_photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== PAYROLL CONFIGURATION ====================

-- Employee compensation table
CREATE TABLE IF NOT EXISTS employee_compensation (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  
  -- Salary Information
  salary_type VARCHAR(50), -- hourly, monthly, annual
  base_salary DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'ZAR',
  payment_frequency VARCHAR(50), -- weekly, bi-weekly, monthly
  payment_method VARCHAR(50), -- bank-transfer, cash, cheque
  
  -- Bank Details
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(50),
  bank_branch_code VARCHAR(20),
  bank_account_type VARCHAR(50),
  
  -- Effective dates
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_current BOOLEAN DEFAULT true,
  
  -- Audit
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Allowances and benefits
CREATE TABLE IF NOT EXISTS employee_allowances (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  allowance_type VARCHAR(100) NOT NULL, -- housing, transport, medical, meal, etc.
  amount DECIMAL(10,2) NOT NULL,
  is_taxable BOOLEAN DEFAULT true,
  is_recurring BOOLEAN DEFAULT true,
  frequency VARCHAR(50), -- monthly, quarterly, annual
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deductions
CREATE TABLE IF NOT EXISTS employee_deductions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  deduction_type VARCHAR(100) NOT NULL, -- tax, pension, medical-aid, loan, etc.
  amount DECIMAL(10,2),
  percentage DECIMAL(5,2),
  is_percentage BOOLEAN DEFAULT false,
  is_mandatory BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT true,
  frequency VARCHAR(50),
  effective_from DATE NOT NULL,
  effective_to DATE,
  remaining_installments INTEGER,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leave balances
CREATE TABLE IF NOT EXISTS employee_leave_balances (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL, -- annual, sick, maternity, unpaid
  total_days DECIMAL(5,2) NOT NULL,
  used_days DECIMAL(5,2) DEFAULT 0,
  remaining_days DECIMAL(5,2) NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, leave_type, year)
);

-- Leave requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days DECIMAL(5,2) NOT NULL,
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, cancelled
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== PERFORMANCE & DOCUMENTS ====================

-- Performance reviews
CREATE TABLE IF NOT EXISTS performance_reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reviewer_id INTEGER REFERENCES users(id),
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  overall_rating DECIMAL(3,2), -- e.g., 4.5 out of 5
  strengths TEXT,
  areas_for_improvement TEXT,
  goals TEXT,
  comments TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- draft, completed, acknowledged
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee documents
CREATE TABLE IF NOT EXISTS employee_documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- contract, id-copy, certificate, etc.
  document_name VARCHAR(255) NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiry_date DATE,
  uploaded_by INTEGER REFERENCES users(id),
  notes TEXT
);

-- ==================== INDEXES ====================

CREATE INDEX idx_employee_profiles_user_id ON employee_profiles(user_id);
CREATE INDEX idx_employee_profiles_employee_number ON employee_profiles(employee_number);
CREATE INDEX idx_employee_profiles_department ON employee_profiles(department_id);
CREATE INDEX idx_employee_profiles_position ON employee_profiles(job_position_id);
CREATE INDEX idx_employee_profiles_reports_to ON employee_profiles(reports_to_id);
CREATE INDEX idx_employee_profiles_status ON employee_profiles(employment_status);

CREATE INDEX idx_employee_compensation_user_id ON employee_compensation(user_id);
CREATE INDEX idx_employee_compensation_current ON employee_compensation(is_current);

CREATE INDEX idx_employee_allowances_user_id ON employee_allowances(user_id);
CREATE INDEX idx_employee_deductions_user_id ON employee_deductions(user_id);
CREATE INDEX idx_leave_balances_user_year ON employee_leave_balances(user_id, year);
CREATE INDEX idx_leave_requests_user_status ON leave_requests(user_id, status);

CREATE INDEX idx_departments_parent ON departments(parent_department_id);
CREATE INDEX idx_departments_manager ON departments(manager_id);
CREATE INDEX idx_job_positions_department ON job_positions(department_id);

-- ==================== TRIGGERS ====================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_positions_updated_at BEFORE UPDATE ON job_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_profiles_updated_at BEFORE UPDATE ON employee_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_compensation_updated_at BEFORE UPDATE ON employee_compensation
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== INITIAL DATA ====================

-- Insert default departments
INSERT INTO departments (name, code, description, cost_center) VALUES
('Pharmacy', 'PHARM', 'Main pharmacy operations', 'CC001'),
('Administration', 'ADMIN', 'Administrative and support functions', 'CC002'),
('Human Resources', 'HR', 'HR and employee management', 'CC003'),
('Finance', 'FIN', 'Finance and accounting', 'CC004')
ON CONFLICT (name) DO NOTHING;

-- Insert default job positions
INSERT INTO job_positions (title, code, job_grade, salary_range_min, salary_range_max) VALUES
('Pharmacist Manager', 'PM01', 'M1', 45000, 65000),
('Senior Pharmacist', 'SP01', 'P3', 35000, 50000),
('Pharmacist', 'P01', 'P2', 25000, 40000),
('Pharmacy Assistant', 'PA01', 'P1', 15000, 25000),
('HR Manager', 'HRM01', 'M1', 40000, 60000),
('Administrator', 'ADM01', 'A1', 18000, 30000)
ON CONFLICT (code) DO NOTHING;

-- Verify tables created
SELECT 'Departments table created' as status;
SELECT 'Job positions table created' as status;
SELECT 'Employee profiles table created' as status;
SELECT 'Compensation table created' as status;
SELECT 'Allowances table created' as status;
SELECT 'Deductions table created' as status;
SELECT 'Leave balances table created' as status;
SELECT 'Leave requests table created' as status;
SELECT 'Performance reviews table created' as status;
SELECT 'Employee documents table created' as status;