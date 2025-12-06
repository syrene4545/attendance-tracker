

-- Enable UUID extension
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== USERS TABLE ====================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'hr', 'pharmacist', 'assistant')),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ==================== ATTENDANCE LOGS TABLE ====================
CREATE TABLE attendance_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('sign-in', 'lunch-out', 'lunch-in', 'sign-out')),
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    location JSONB,
    edited BOOLEAN DEFAULT false,
    edited_by INTEGER REFERENCES users(id),
    edited_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_attendance_user_id ON attendance_logs(user_id);
CREATE INDEX idx_attendance_type ON attendance_logs(type);
CREATE INDEX idx_attendance_timestamp ON attendance_logs(timestamp);
CREATE INDEX idx_attendance_date ON attendance_logs(DATE(timestamp));

-- Composite index for common queries
CREATE INDEX idx_attendance_user_date ON attendance_logs(user_id, DATE(timestamp));

-- ==================== DEPARTMENTS TABLE ====================
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    manager_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== SHIFTS TABLE ====================
CREATE TABLE shifts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    grace_period_minutes INTEGER DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== USER SHIFTS TABLE ====================
CREATE TABLE user_shifts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shift_id INTEGER NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, day_of_week, effective_from)
);

-- ==================== LEAVE REQUESTS TABLE ====================
CREATE TABLE leave_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('sick', 'vacation', 'personal', 'other')),
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leave_requests_user_id ON leave_requests(user_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);

-- ==================== AUDIT LOG TABLE ====================
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- ==================== NOTIFICATIONS TABLE ====================
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ==================== TRIGGERS ====================

-- Update updated_at timestamp on users table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit log trigger for attendance_logs
CREATE OR REPLACE FUNCTION log_attendance_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values)
        VALUES (NEW.edited_by, 'UPDATE', 'attendance_logs', NEW.id, 
                row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log (user_id, action, table_name, record_id, old_values)
        VALUES (NULL, 'DELETE', 'attendance_logs', OLD.id, row_to_json(OLD)::jsonb);
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER attendance_audit_trigger
AFTER UPDATE OR DELETE ON attendance_logs
    FOR EACH ROW EXECUTE FUNCTION log_attendance_changes();

-- ==================== VIEWS ====================

-- Daily attendance summary view
CREATE OR REPLACE VIEW daily_attendance_summary AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.role,
    u.department,
    DATE(a.timestamp) as date,
    COUNT(CASE WHEN a.type = 'sign-in' THEN 1 END) as sign_ins,
    COUNT(CASE WHEN a.type = 'lunch-out' THEN 1 END) as lunch_outs,
    COUNT(CASE WHEN a.type = 'lunch-in' THEN 1 END) as lunch_ins,
    COUNT(CASE WHEN a.type = 'sign-out' THEN 1 END) as sign_outs,
    MIN(CASE WHEN a.type = 'sign-in' THEN a.timestamp END) as first_sign_in,
    MAX(CASE WHEN a.type = 'sign-out' THEN a.timestamp END) as last_sign_out
FROM users u
LEFT JOIN attendance_logs a ON u.id = a.user_id
WHERE u.is_active = true
GROUP BY u.id, u.name, u.role, u.department, DATE(a.timestamp);

-- Late arrivals view
CREATE OR REPLACE VIEW late_arrivals AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.role,
    DATE(a.timestamp) as date,
    a.timestamp as sign_in_time,
    EXTRACT(HOUR FROM a.timestamp) as hour,
    EXTRACT(MINUTE FROM a.timestamp) as minute
FROM attendance_logs a
JOIN users u ON a.user_id = u.id
WHERE a.type = 'sign-in'
    AND (EXTRACT(HOUR FROM a.timestamp) > 9 
         OR (EXTRACT(HOUR FROM a.timestamp) = 9 AND EXTRACT(MINUTE FROM a.timestamp) > 15))
ORDER BY a.timestamp DESC;

-- Monthly statistics view
CREATE OR REPLACE VIEW monthly_statistics AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.role,
    EXTRACT(YEAR FROM a.timestamp) as year,
    EXTRACT(MONTH FROM a.timestamp) as month,
    COUNT(*) as total_events,
    COUNT(CASE WHEN a.type = 'sign-in' THEN 1 END) as total_sign_ins,
    COUNT(CASE WHEN a.edited = true THEN 1 END) as edited_events,
    COUNT(CASE WHEN a.type = 'sign-in' 
               AND (EXTRACT(HOUR FROM a.timestamp) > 9 
                    OR (EXTRACT(HOUR FROM a.timestamp) = 9 AND EXTRACT(MINUTE FROM a.timestamp) > 15))
          THEN 1 END) as late_arrivals
FROM attendance_logs a
JOIN users u ON a.user_id = u.id
GROUP BY u.id, u.name, u.role, EXTRACT(YEAR FROM a.timestamp), EXTRACT(MONTH FROM a.timestamp);

-- ==================== FUNCTIONS ====================

-- Function to get user attendance for a date range
CREATE OR REPLACE FUNCTION get_user_attendance(
    p_user_id INTEGER,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    date DATE,
    sign_in_time TIMESTAMP,
    lunch_out_time TIMESTAMP,
    lunch_in_time TIMESTAMP,
    sign_out_time TIMESTAMP,
    total_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(a.timestamp) as date,
        MIN(CASE WHEN a.type = 'sign-in' THEN a.timestamp END) as sign_in_time,
        MIN(CASE WHEN a.type = 'lunch-out' THEN a.timestamp END) as lunch_out_time,
        MIN(CASE WHEN a.type = 'lunch-in' THEN a.timestamp END) as lunch_in_time,
        MAX(CASE WHEN a.type = 'sign-out' THEN a.timestamp END) as sign_out_time,
        EXTRACT(EPOCH FROM (
            MAX(CASE WHEN a.type = 'sign-out' THEN a.timestamp END) - 
            MIN(CASE WHEN a.type = 'sign-in' THEN a.timestamp END)
        )) / 3600 as total_hours
    FROM attendance_logs a
    WHERE a.user_id = p_user_id
        AND DATE(a.timestamp) BETWEEN p_start_date AND p_end_date
    GROUP BY DATE(a.timestamp)
    ORDER BY DATE(a.timestamp) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is currently signed in
CREATE OR REPLACE FUNCTION is_user_signed_in(p_user_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    last_sign_in TIMESTAMP;
    last_sign_out TIMESTAMP;
BEGIN
    SELECT MAX(timestamp) INTO last_sign_in
    FROM attendance_logs
    WHERE user_id = p_user_id 
        AND type = 'sign-in'
        AND DATE(timestamp) = CURRENT_DATE;
    
    SELECT MAX(timestamp) INTO last_sign_out
    FROM attendance_logs
    WHERE user_id = p_user_id 
        AND type = 'sign-out'
        AND DATE(timestamp) = CURRENT_DATE;
    
    RETURN (last_sign_in IS NOT NULL AND (last_sign_out IS NULL OR last_sign_in > last_sign_out));
END;
$$ LANGUAGE plpgsql;

-- ==================== COMMENTS ====================

COMMENT ON TABLE users IS 'Stores user account information and roles';
COMMENT ON TABLE attendance_logs IS 'Records all attendance events (sign-in, lunch, sign-out)';
COMMENT ON TABLE departments IS 'Organization departments';
COMMENT ON TABLE shifts IS 'Work shift definitions';
COMMENT ON TABLE user_shifts IS 'Assigns shifts to users by day of week';
COMMENT ON TABLE leave_requests IS 'Employee leave/vacation requests';
COMMENT ON TABLE audit_log IS 'Tracks all changes to sensitive data';
COMMENT ON TABLE notifications IS 'User notifications for missed punches, approvals, etc.';

COMMENT ON COLUMN attendance_logs.location IS 'GPS coordinates stored as JSON {lat, lng}';
COMMENT ON COLUMN attendance_logs.edited IS 'Indicates if this record was modified after creation';
COMMENT ON COLUMN users.is_active IS 'Soft delete flag for users';