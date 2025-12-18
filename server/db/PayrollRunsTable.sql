-- ==================== CREATE PAYROLL TABLES ====================

-- Payroll Runs Table
CREATE TABLE IF NOT EXISTS payroll_runs (
  id SERIAL PRIMARY KEY,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  total_employees INTEGER DEFAULT 0,
  total_gross_pay DECIMAL(12,2) DEFAULT 0,
  total_deductions DECIMAL(12,2) DEFAULT 0,
  total_net_pay DECIMAL(12,2) DEFAULT 0,
  processed_by INTEGER REFERENCES users(id),
  processed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(month, year)
);

-- Payroll Items Table (individual employee payslips)
CREATE TABLE IF NOT EXISTS payroll_items (
  id SERIAL PRIMARY KEY,
  payroll_run_id INTEGER REFERENCES payroll_runs(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  employee_number VARCHAR(50),
  employee_name VARCHAR(255),
  department VARCHAR(255),
  base_salary DECIMAL(10,2),
  allowances DECIMAL(10,2),
  gross_pay DECIMAL(10,2),
  paye DECIMAL(10,2),
  uif DECIMAL(10,2),
  other_deductions DECIMAL(10,2),
  total_deductions DECIMAL(10,2),
  net_pay DECIMAL(10,2),
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_date DATE,
  payment_reference VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payroll_runs_period ON payroll_runs(year, month);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_status ON payroll_runs(status);
CREATE INDEX IF NOT EXISTS idx_payroll_items_run ON payroll_items(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_user ON payroll_items(user_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_status ON payroll_items(payment_status);

-- Verify tables created
SELECT 'Payroll tables created successfully!' as status;

-- List all tables
\dt

-- Check payroll_runs structure
\d payroll_runs

-- Check payroll_items structure
\d payroll_items