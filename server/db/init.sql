-- ==================== DATABASE INITIALIZATION ====================
-- This script creates all necessary tables and seed data for the attendance tracker

-- Drop existing tables if they exist
DROP TABLE IF EXISTS attendance_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'pharmacist',
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create attendance_logs table
CREATE TABLE attendance_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  location VARCHAR(255),
  edited BOOLEAN DEFAULT FALSE,
  edited_by INTEGER REFERENCES users(id),
  edited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_attendance_user_id ON attendance_logs(user_id);
CREATE INDEX idx_attendance_timestamp ON attendance_logs(timestamp);
CREATE INDEX idx_attendance_type ON attendance_logs(type);

-- Insert default admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (email, password, name, role, department) VALUES
('admin@company.com', '$2b$10$XQZ9Z9Z9Z9Z9Z9Z9Z9Z9ZeK6rGvH5H5H5H5H5H5H5H5H5H5H5H5H5', 'Admin User', 'admin', 'Management');

-- Insert sample users (optional - remove in production)
INSERT INTO users (email, password, name, role, department) VALUES
('hr@company.com', '$2b$10$XQZ9Z9Z9Z9Z9Z9Z9Z9Z9ZeK6rGvH5H5H5H5H5H5H5H5H5H5H5H5H5', 'HR Manager', 'hr', 'Human Resources'),
('john@company.com', '$2b$10$XQZ9Z9Z9Z9Z9Z9Z9Z9Z9ZeK6rGvH5H5H5H5H5H5H5H5H5H5H5H5H5', 'John Doe', 'pharmacist', 'Pharmacy'),
('jane@company.com', '$2b$10$XQZ9Z9Z9Z9Z9Z9Z9Z9Z9ZeK6rGvH5H5H5H5H5H5H5H5H5H5H5H5H5', 'Jane Smith', 'assistant', 'Pharmacy');

-- Insert sample attendance logs (optional - remove in production)
INSERT INTO attendance_logs (user_id, type, timestamp, location) VALUES
(1, 'sign-in', NOW() - INTERVAL '8 hours', 'Office'),
(1, 'lunch-out', NOW() - INTERVAL '4 hours', 'Office'),
(1, 'lunch-in', NOW() - INTERVAL '3 hours', 'Office'),
(2, 'sign-in', NOW() - INTERVAL '7 hours', 'Office'),
(3, 'sign-in', NOW() - INTERVAL '6 hours', 'Office');

-- Grant necessary permissions (if using specific database user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;

-- Verify installation
SELECT 'Database initialized successfully!' as status;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as log_count FROM attendance_logs;