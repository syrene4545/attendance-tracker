import express from 'express';
import { pool } from '../index.js';
import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// ==================== ANALYTICS ROUTES ====================

// Get analytics (Admin/HR only)
router.get('/', authenticateToken, checkPermission('view_analytics'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Total events
    const totalEventsQuery = `
      SELECT COUNT(*) as total 
      FROM attendance_logs 
      WHERE timestamp >= $1 AND timestamp <= $2
    `;
    const totalEvents = await pool.query(totalEventsQuery, [startDate || '2000-01-01', endDate || '2100-01-01']);

    // Late check-ins (after 9:15 AM)
    const lateCheckinsQuery = `
      SELECT COUNT(*) as total 
      FROM attendance_logs 
      WHERE type = 'sign-in' 
        AND (
          EXTRACT(HOUR FROM timestamp) > 9 
          OR (EXTRACT(HOUR FROM timestamp) = 9 AND EXTRACT(MINUTE FROM timestamp) > 15)
        )
        AND timestamp >= $1 AND timestamp <= $2
    `;
    const lateCheckins = await pool.query(lateCheckinsQuery, [startDate || '2000-01-01', endDate || '2100-01-01']);

    // On-time percentage
    const signInsQuery = `
      SELECT COUNT(*) as total 
      FROM attendance_logs 
      WHERE type = 'sign-in'
        AND timestamp >= $1 AND timestamp <= $2
    `;
    const signIns = await pool.query(signInsQuery, [startDate || '2000-01-01', endDate || '2100-01-01']);
    const onTimePercentage = signIns.rows[0].total > 0 
      ? ((signIns.rows[0].total - lateCheckins.rows[0].total) / signIns.rows[0].total * 100).toFixed(1)
      : 0;

    // Role breakdown
    const roleBreakdownQuery = `
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `;
    const roleBreakdown = await pool.query(roleBreakdownQuery);

    res.json({
      totalEvents: parseInt(totalEvents.rows[0].total),
      lateCheckins: parseInt(lateCheckins.rows[0].total),
      onTimePercentage: parseFloat(onTimePercentage),
      roleBreakdown: roleBreakdown.rows,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
