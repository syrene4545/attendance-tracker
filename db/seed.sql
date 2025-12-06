-- db/seed.sql
-- Seed data for development and testing

-- ==================== INSERT DEPARTMENTS ====================
INSERT INTO departments (name, description) VALUES
('Management', 'Executive and administrative management'),
('Human Resources', 'HR and personnel management'),
('Pharmacy', 'Main pharmacy operations'),
('Sales', 'Customer service and sales'),
('IT', 'Information technology and systems');

-- ==================== INSERT SHIFTS ====================
INSERT INTO shifts (name, start_time, end_time, grace_period_minutes) VALUES
('Morning Shift', '08:00:00', '16:00:00', 15),
('Day Shift', '09:00:00', '17:00:00', 15),
('Evening Shift', '14:00:00', '22:00:00', 15),
('Night Shift', '22:00:00', '06:00:00', 15);

-- ==================== INSERT USERS ====================
-- Password for all demo users: "password123"
-- Hashed with bcrypt (10 rounds)
INSERT INTO users (email, password_hash, name, role, department, is_active) VALUES
-- Admin users
('admin@company.com', '$2a$10$rKvqPWj3NQJ5yNx0uK1bVupZqZh3C/xGQxV8PqAYZCKK7wNGHGqZm', 'Admin User', 'admin', 'Management', true),
('director@company.com', '$2a$10$rKvqPWj3NQJ5yNx0uK1bVupZqZh3C/xGQxV8PqAYZCKK7wNGHGqZm', 'Jane Director', 'admin', 'Management', true),

-- HR users
('hr@company.com', '$2a$10$rKvqPWj3NQJ5yNx0uK1bVupZqZh3C/xGQxV8PqAYZCKK7wNGHGqZm', 'Sarah HR', 'hr', 'Human Resources', true),
('hr2@company.com', '$2a$10$rKvqPWj3NQJ5yNx0uK1bVupZqZh3C/xGQxV8PqAYZCKK7wNGHGqZm', 'Mike HR', 'hr', 'Human Resources', true),

-- Pharmacists
('john@company.com', '$2a$10$rKvqPWj3NQJ5yNx0uK1bVupZqZh3C/xGQxV8PqAYZCKK7wNGHGqZm', 'John Doe', 'pharmacist', 'Pharmacy', true),
('mary@company.com', '$2a$10$rKvqPWj3NQJ5yNx0uK1bVupZqZh3C/xGQxV8PqAYZCKK7wNGHGqZm', 'Mary Johnson', 'pharmacist', 'Pharmacy', true),
('robert@company.com', '$2a$10$rKvqPWj3NQJ5yNx0uK1bVupZqZh3C/xGQxV8PqAYZCKK7wNGHGqZm', 'Robert Williams', 'pharmacist', 'Pharmacy', true),

-- Assistants
('jane@company.com', '$2a$10$rKvqPWj3NQJ5yNx0uK1bVupZqZh3C/xGQxV8PqAYZCKK7wNGHGqZm', 'Jane Smith', 'assistant', 'Pharmacy', true),
('alice@company.com', '$2a$10$rKvqPWj3NQJ5yNx0uK1bVupZqZh3C/xGQxV8PqAYZCKK7wNGHGqZm', 'Alice Brown', 'assistant', 'Pharmacy', true),
('bob@company.com', '$2a$10$rKvqPWj3NQJ5yNx0uK1bVupZqZh3C/xGQxV8PqAYZCKK7wNGHGqZm', 'Bob Davis', 'assistant', 'Sales', true),
('emma@company.com', '$2a$10$rKvqPWj3NQJ5yNx0uK1bVupZqZh3C/xGQxV8PqAYZCKK7wNGHGqZm', 'Emma Wilson', 'assistant', 'Sales', true);

-- ==================== ASSIGN SHIFTS TO USERS ====================
-- Most employees work Day Shift (9-5) Monday to Friday
INSERT INTO user_shifts (user_id, shift_id, day_of_week, effective_from) 
SELECT u.id, 2, d.day, CURRENT_DATE - INTERVAL '6 months'
FROM users u
CROSS JOIN (VALUES (1), (2), (3), (4), (5)) AS d(day)
WHERE u.role IN ('pharmacist', 'assistant');

-- ==================== INSERT SAMPLE ATTENDANCE LOGS ====================
-- Last 30 days of attendance for realistic data

-- Generate attendance for the last 30 days
DO $$
DECLARE
    user_record RECORD;
    day_offset INTEGER;
    sign_in_time TIMESTAMP;
    lunch_out_time TIMESTAMP;
    lunch_in_time TIMESTAMP;
    sign_out_time TIMESTAMP;
    is_late BOOLEAN;
BEGIN
    -- Loop through all active users
    FOR user_record IN SELECT id, role FROM users WHERE is_active = true AND role IN ('pharmacist', 'assistant') LOOP
        -- Loop through last 30 days
        FOR day_offset IN 0..29 LOOP
            -- Skip weekends (Saturday = 6, Sunday = 0)
            IF EXTRACT(DOW FROM CURRENT_DATE - day_offset) NOT IN (0, 6) THEN
                -- Randomly determine if late (10% chance)
                is_late := random() < 0.1;
                
                -- Sign-in time (8:50 - 9:15 if on time, 9:16 - 9:45 if late)
                IF is_late THEN
                    sign_in_time := (CURRENT_DATE - day_offset) + TIME '09:16:00' + (random() * INTERVAL '29 minutes');
                ELSE
                    sign_in_time := (CURRENT_DATE - day_offset) + TIME '08:50:00' + (random() * INTERVAL '25 minutes');
                END IF;
                
                -- Lunch out (12:00 - 13:00)
                lunch_out_time := (CURRENT_DATE - day_offset) + TIME '12:00:00' + (random() * INTERVAL '60 minutes');
                
                -- Lunch in (30-60 minutes after lunch out)
                lunch_in_time := lunch_out_time + INTERVAL '30 minutes' + (random() * INTERVAL '30 minutes');
                
                -- Sign out (16:45 - 17:15)
                sign_out_time := (CURRENT_DATE - day_offset) + TIME '16:45:00' + (random() * INTERVAL '30 minutes');
                
                -- Insert attendance records (90% chance of complete day, 10% missing some events)
                IF random() > 0.1 THEN
                    -- Sign in
                    INSERT INTO attendance_logs (user_id, type, timestamp, location)
                    VALUES (user_record.id, 'sign-in', sign_in_time, 
                            '{"lat": "-26.195246", "lng": "28.034088"}'::jsonb);
                    
                    -- Lunch out (95% of the time)
                    IF random() > 0.05 THEN
                        INSERT INTO attendance_logs (user_id, type, timestamp, location)
                        VALUES (user_record.id, 'lunch-out', lunch_out_time, 
                                '{"lat": "-26.195300", "lng": "28.034100"}'::jsonb);
                    END IF;
                    
                    -- Lunch in (90% of the time if lunch out exists)
                    IF random() > 0.1 THEN
                        INSERT INTO attendance_logs (user_id, type, timestamp, location)
                        VALUES (user_record.id, 'lunch-in', lunch_in_time, 
                                '{"lat": "-26.195280", "lng": "28.034095"}'::jsonb);
                    END IF;
                    
                    -- Sign out (95% of the time)
                    IF random() > 0.05 THEN
                        INSERT INTO attendance_logs (user_id, type, timestamp, location)
                        VALUES (user_record.id, 'sign-out', sign_out_time, 
                                '{"lat": "-26.195260", "lng": "28.034090"}'::jsonb);
                    END IF;
                END IF;
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- ==================== INSERT SAMPLE LEAVE REQUESTS ====================
INSERT INTO leave_requests (user_id, start_date, end_date, leave_type, reason, status, approved_by) VALUES
(5, CURRENT_DATE + 7, CURRENT_DATE + 9, 'vacation', 'Family vacation', 'approved', 3),
(6, CURRENT_DATE + 14, CURRENT_DATE + 14, 'sick', 'Medical appointment', 'approved', 3),
(8, CURRENT_DATE + 21, CURRENT_DATE + 25, 'vacation', 'Annual leave', 'pending', NULL),
(9, CURRENT_DATE - 3, CURRENT_DATE - 3, 'sick', 'Not feeling well', 'approved', 3),
(10, CURRENT_DATE + 30, CURRENT_DATE + 32, 'personal', 'Personal matters', 'pending', NULL);

-- ==================== INSERT SAMPLE NOTIFICATIONS ====================
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(5, 'Leave Request Approved', 'Your vacation request for Nov 24-26 has been approved.', 'success', true),
(6, 'Late Check-in Alert', 'You checked in late today at 9:35 AM.', 'warning', false),
(8, 'Leave Request Pending', 'Your leave request is awaiting approval.', 'info', false),
(9, 'Missed Lunch Sign-out', 'You forgot to sign out for lunch yesterday.', 'warning', true),
(10, 'System Maintenance', 'The system will undergo maintenance this weekend.', 'info', false);

-- ==================== UPDATE SOME ATTENDANCE LOGS AS EDITED ====================
-- Simulate some manual corrections by HR
UPDATE attendance_logs 
SET edited = true, 
    edited_by = 3, 
    edited_at = CURRENT_TIMESTAMP,
    notes = 'Time corrected by HR'
WHERE id IN (
    SELECT id FROM attendance_logs 
    WHERE type = 'sign-in' 
    ORDER BY RANDOM() 
    LIMIT 5
);

-- ==================== VERIFY DATA ====================
-- Display summary
SELECT 
    'Users' as table_name, 
    COUNT(*) as record_count 
FROM users
UNION ALL
SELECT 
    'Attendance Logs', 
    COUNT(*) 
FROM attendance_logs
UNION ALL
SELECT 
    'Departments', 
    COUNT(*) 
FROM departments
UNION ALL
SELECT 
    'Shifts', 
    COUNT(*) 
FROM shifts
UNION ALL
SELECT 
    'Leave Requests', 
    COUNT(*) 
FROM leave_requests
UNION ALL
SELECT 
    'Notifications', 
    COUNT(*) 
FROM notifications;

-- Display role distribution
SELECT 
    role, 
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 1) as percentage
FROM users
GROUP BY role
ORDER BY count DESC;

-- Display attendance summary for last 7 days
SELECT 
    DATE(timestamp) as date,
    COUNT(*) as total_events,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(CASE WHEN type = 'sign-in' THEN 1 END) as sign_ins,
    COUNT(CASE WHEN type = 'sign-out' THEN 1 END) as sign_outs
FROM attendance_logs
WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Display late arrivals in last 7 days
SELECT 
    u.name,
    COUNT(*) as late_count
FROM late_arrivals la
JOIN users u ON la.user_id = u.id
WHERE la.date >= CURRENT_DATE - 7
GROUP BY u.name
ORDER BY late_count DESC
LIMIT 5;