//-- ==================== API Service Layer ====================
// File: server/services/attendanceService.js

const pool = require('../config/database');

class AttendanceService {
  async recordAttendance(userId, type, location) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Check for duplicate
      const checkQuery = `
        SELECT id FROM attendance_logs 
        WHERE user_id = $1 
        AND DATE(timestamp) = CURRENT_DATE 
        AND type = $2
      `;
      const existing = await client.query(checkQuery, [userId, type]);

      if (existing.rows.length > 0) {
        throw new Error('Event already recorded today');
      }

      // Insert attendance
      const insertQuery = `
        INSERT INTO attendance_logs (user_id, type, location)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const result = await client.query(insertQuery, [
        userId,
        type,
        location ? JSON.stringify(location) : null
      ]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getAttendanceLogs(filters) {
    const { userId, startDate, endDate, limit = 1000 } = filters;
    
    let query = `
      SELECT 
        a.*,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role
      FROM attendance_logs a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (userId) {
      query += ` AND a.user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    if (startDate) {
      query += ` AND a.timestamp >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }

    if (endDate) {
      query += ` AND a.timestamp <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }

    query += ` ORDER BY a.timestamp DESC LIMIT $${paramCount}`;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
  }

  async updateAttendanceLog(logId, updates, editedBy) {
    const { type, timestamp } = updates;
    
    const query = `
      UPDATE attendance_logs
      SET 
        type = COALESCE($1, type),
        timestamp = COALESCE($2, timestamp),
        edited = true,
        edited_by = $3,
        edited_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;

    const result = await pool.query(query, [type, timestamp, editedBy, logId]);
    
    if (result.rows.length === 0) {
      throw new Error('Attendance log not found');
    }

    return result.rows[0];
  }

  async deleteAttendanceLog(logId) {
    const query = 'DELETE FROM attendance_logs WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [logId]);
    
    if (result.rows.length === 0) {
      throw new Error('Attendance log not found');
    }

    return result.rows[0];
  }

  async getAnalytics(startDate, endDate) {
    const analyticsQuery = `
      WITH attendance_stats AS (
        SELECT 
          COUNT(*) as total_events,
          COUNT(CASE WHEN type = 'sign-in' THEN 1 END) as sign_ins,
          COUNT(CASE 
            WHEN type = 'sign-in' 
            AND (EXTRACT(HOUR FROM timestamp) > 9 
                 OR (EXTRACT(HOUR FROM timestamp) = 9 AND EXTRACT(MINUTE FROM timestamp) > 15))
            THEN 1 
          END) as late_checkins
        FROM attendance_logs
        WHERE timestamp BETWEEN $1 AND $2
      )
      SELECT 
        total_events,
        late_checkins,
        CASE 
          WHEN sign_ins > 0 
          THEN ROUND((sign_ins - late_checkins)::NUMERIC / sign_ins * 100, 1)
          ELSE 0
        END as on_time_percentage
      FROM attendance_stats
    `;

    const roleQuery = `
      SELECT role, COUNT(*) as count
      FROM users
      WHERE is_active = true
      GROUP BY role
    `;

    const [analyticsResult, roleResult] = await Promise.all([
      pool.query(analyticsQuery, [startDate, endDate]),
      pool.query(roleQuery)
    ]);

    return {
      ...analyticsResult.rows[0],
      roleBreakdown: roleResult.rows
    };
  }
}

module.exports = new AttendanceService();