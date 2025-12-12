-- ==================== PASSWORD RESET & SIGNUP REQUESTS TABLES ====================
-- Run this SQL to add new functionality

-- Create password_reset_requests table
CREATE TABLE IF NOT EXISTS password_reset_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, completed
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  processed_by INTEGER REFERENCES users(id),
  notes TEXT
);

-- Create signup_requests table
CREATE TABLE IF NOT EXISTS signup_requests (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  requested_role VARCHAR(50) NOT NULL,
  department VARCHAR(100),
  reason TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  processed_by INTEGER REFERENCES users(id),
  notes TEXT
);

-- Create indexes
CREATE INDEX idx_password_reset_status ON password_reset_requests(status);
CREATE INDEX idx_password_reset_email ON password_reset_requests(email);
CREATE INDEX idx_signup_status ON signup_requests(status);
CREATE INDEX idx_signup_email ON signup_requests(email);

-- Verify tables created
SELECT 'Password reset requests table created' as status;
SELECT 'Signup requests table created' as status;

\d password_reset_requests;
\d signup_requests;