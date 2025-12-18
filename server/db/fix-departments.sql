-- ==================== FIX DEPARTMENTS TABLE ====================

-- Add missing columns
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS code VARCHAR(20),
ADD COLUMN IF NOT EXISTS parent_department_id INTEGER,
ADD COLUMN IF NOT EXISTS cost_center VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add unique constraint on code
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'departments_code_key'
    ) THEN
        ALTER TABLE departments ADD CONSTRAINT departments_code_key UNIQUE (code);
    END IF;
END $$;

-- Add foreign key for parent_department_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'departments_parent_department_id_fkey'
    ) THEN
        ALTER TABLE departments 
        ADD CONSTRAINT departments_parent_department_id_fkey 
        FOREIGN KEY (parent_department_id) REFERENCES departments(id);
    END IF;
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_departments_parent ON departments(parent_department_id);

-- Update existing rows
UPDATE departments SET is_active = true WHERE is_active IS NULL;
UPDATE departments SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;

-- Add department codes for existing departments
UPDATE departments SET code = 'MGMT' WHERE name = 'Management' AND code IS NULL;
UPDATE departments SET code = 'HR' WHERE name = 'Human Resources' AND code IS NULL;
UPDATE departments SET code = 'PHARM' WHERE name = 'Pharmacy' AND code IS NULL;
UPDATE departments SET code = 'SALES' WHERE name = 'Sales' AND code IS NULL;
UPDATE departments SET code = 'IT' WHERE name = 'IT' AND code IS NULL;

-- Verify
SELECT * FROM departments;
\d departments

-- Success
SELECT 'Departments table updated successfully!' as status;