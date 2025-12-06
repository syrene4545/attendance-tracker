--// ==================== Database Queries Helper ====================
--// File: db/queries.sql

-- Common Queries for Application

-- Get user with all details
-- Usage: SELECT * FROM get_user_details(user_id);
CREATE OR REPLACE FUNCTION get_user_details(p_user_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    email VARCHAR,
    name VARCHAR,
    role VARCHAR,
    department VARCHAR,
    total_attendance_events BIGINT,
    late_arrivals BIGINT,
    on_time_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.department,
        COUNT(a.id) as total_attendance_events,
        COUNT(CASE 
            WHEN a.type = 'sign-in' 
            AND (EXTRACT(HOUR FROM a.timestamp) > 9 
                 OR (EXTRACT(HOUR FROM a.timestamp) = 9 AND EXTRACT(MINUTE FROM a.timestamp) > 15))
            THEN 1 
        END) as late_arrivals,
        CASE 
            WHEN COUNT(CASE WHEN a.type = 'sign-in' THEN 1 END) > 0
            THEN ROUND(
                (COUNT(CASE WHEN a.type = 'sign-in' THEN 1 END) - 
                 COUNT(CASE 
                    WHEN a.type = 'sign-in' 
                    AND (EXTRACT(HOUR FROM a.timestamp) > 9 
                         OR (EXTRACT(HOUR FROM a.timestamp) = 9 AND EXTRACT(MINUTE FROM a.timestamp) > 15))
                    THEN 1 
                 END))::NUMERIC / 
                COUNT(CASE WHEN a.type = 'sign-in' THEN 1 END) * 100, 
                1
            )
            ELSE 0
        END as on_time_percentage
    FROM users u
    LEFT JOIN attendance_logs a ON u.id = a.user_id
    WHERE u.id = p_user_id
    GROUP BY u.id, u.email, u.name, u.role, u.department;
END;
$$ LANGUAGE plpgsql;

-- Get department statistics
-- Usage: SELECT * FROM get_department_stats('Pharmacy');
CREATE OR REPLACE FUNCTION get_department_stats(p_department VARCHAR)
RETURNS TABLE (
    department VARCHAR,
    total_employees BIGINT,
    total_attendance_today BIGINT,
    attendance_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.department,
        COUNT(DISTINCT u.id) as total_employees,
        COUNT(DISTINCT CASE 
            WHEN DATE(a.timestamp) = CURRENT_DATE 
            THEN a.user_id 
        END) as total_attendance_today,
        CASE 
            WHEN COUNT(DISTINCT u.id) > 0
            THEN ROUND(
                COUNT(DISTINCT CASE 
                    WHEN DATE(a.timestamp) = CURRENT_DATE 
                    THEN a.user_id 
                END)::NUMERIC / 
                COUNT(DISTINCT u.id) * 100, 
                1
            )
            ELSE 0
        END as attendance_rate
    FROM users u
    LEFT JOIN attendance_logs a ON u.id = a.user_id
    WHERE u.department = p_department AND u.is_active = true
    GROUP BY u.department;
END;
$$ LANGUAGE plpgsql;