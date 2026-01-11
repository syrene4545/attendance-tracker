// import express from 'express';
// import { pool } from '../index.js';
// import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';

// const router = express.Router();

// // ==================== ANALYTICS ROUTES ====================

// // Get analytics (Admin/HR only)
// router.get('/', authenticateToken, checkPermission('view_analytics'), async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     // Total events
//     const totalEventsQuery = `
//       SELECT COUNT(*) as total 
//       FROM attendance_logs 
//       WHERE timestamp >= $1 AND timestamp <= $2
//     `;
//     const totalEvents = await pool.query(totalEventsQuery, [startDate || '2000-01-01', endDate || '2100-01-01']);

//     // Late check-ins (after 9:15 AM)
//     const lateCheckinsQuery = `
//       SELECT COUNT(*) as total 
//       FROM attendance_logs 
//       WHERE type = 'sign-in' 
//         AND (
//           EXTRACT(HOUR FROM timestamp) > 9 
//           OR (EXTRACT(HOUR FROM timestamp) = 9 AND EXTRACT(MINUTE FROM timestamp) > 15)
//         )
//         AND timestamp >= $1 AND timestamp <= $2
//     `;
//     const lateCheckins = await pool.query(lateCheckinsQuery, [startDate || '2000-01-01', endDate || '2100-01-01']);

//     // On-time percentage
//     const signInsQuery = `
//       SELECT COUNT(*) as total 
//       FROM attendance_logs 
//       WHERE type = 'sign-in'
//         AND timestamp >= $1 AND timestamp <= $2
//     `;
//     const signIns = await pool.query(signInsQuery, [startDate || '2000-01-01', endDate || '2100-01-01']);
//     const onTimePercentage = signIns.rows[0].total > 0 
//       ? ((signIns.rows[0].total - lateCheckins.rows[0].total) / signIns.rows[0].total * 100).toFixed(1)
//       : 0;

//     // Role breakdown
//     const roleBreakdownQuery = `
//       SELECT role, COUNT(*) as count 
//       FROM users 
//       GROUP BY role
//     `;
//     const roleBreakdown = await pool.query(roleBreakdownQuery);

//     res.json({
//       totalEvents: parseInt(totalEvents.rows[0].total),
//       lateCheckins: parseInt(lateCheckins.rows[0].total),
//       onTimePercentage: parseFloat(onTimePercentage),
//       roleBreakdown: roleBreakdown.rows,
//     });
//   } catch (error) {
//     console.error('Get analytics error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// export default router;

import express from 'express';
import { pool } from '../index.js';
import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';
import { verifyTenantAccess } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// ✅ Apply tenant middleware to all routes
router.use(authenticateToken);
router.use(verifyTenantAccess);

// ==================== ANALYTICS ROUTES ====================

// Get analytics (Admin/HR only)
router.get('/', checkPermission('view_analytics'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const companyId = req.companyId; // ✅ Get from tenant middleware

    console.log(`📊 Fetching analytics for company_id: ${companyId}`);

    // Set default date range if not provided
    const start = startDate || '2000-01-01';
    const end = endDate || '2100-01-01';

    // ✅ Total events (filtered by company)
    const totalEventsQuery = `
      SELECT COUNT(*) as total 
      FROM attendance_logs 
      WHERE company_id = $1
        AND timestamp >= $2 
        AND timestamp <= $3
    `;
    const totalEvents = await pool.query(totalEventsQuery, [companyId, start, end]);

    // ✅ Late check-ins (after 9:15 AM) - filtered by company
    const lateCheckinsQuery = `
      SELECT COUNT(*) as total 
      FROM attendance_logs 
      WHERE company_id = $1
        AND type = 'sign-in' 
        AND (
          EXTRACT(HOUR FROM timestamp AT TIME ZONE 'Africa/Harare') > 9 
          OR (
            EXTRACT(HOUR FROM timestamp AT TIME ZONE 'Africa/Harare') = 9 
            AND EXTRACT(MINUTE FROM timestamp AT TIME ZONE 'Africa/Harare') > 15
          )
        )
        AND timestamp >= $2 
        AND timestamp <= $3
    `;
    const lateCheckins = await pool.query(lateCheckinsQuery, [companyId, start, end]);

    // ✅ Total sign-ins (filtered by company)
    const signInsQuery = `
      SELECT COUNT(*) as total 
      FROM attendance_logs 
      WHERE company_id = $1
        AND type = 'sign-in'
        AND timestamp >= $2 
        AND timestamp <= $3
    `;
    const signIns = await pool.query(signInsQuery, [companyId, start, end]);

    // Calculate on-time percentage
    const totalSignIns = parseInt(signIns.rows[0].total);
    const totalLate = parseInt(lateCheckins.rows[0].total);
    const onTimePercentage = totalSignIns > 0 
      ? ((totalSignIns - totalLate) / totalSignIns * 100).toFixed(1)
      : 0;

    // ✅ Role breakdown (filtered by company)
    const roleBreakdownQuery = `
      SELECT role, COUNT(*) as count 
      FROM users 
      WHERE company_id = $1
      GROUP BY role
      ORDER BY count DESC
    `;
    const roleBreakdown = await pool.query(roleBreakdownQuery, [companyId]);

    // ✅ Additional analytics - Active employees
    const activeEmployeesQuery = `
      SELECT COUNT(DISTINCT user_id) as count
      FROM attendance_logs
      WHERE company_id = $1
        AND timestamp >= $2
        AND timestamp <= $3
    `;
    const activeEmployees = await pool.query(activeEmployeesQuery, [companyId, start, end]);

    // ✅ Average daily attendance
    const avgDailyAttendanceQuery = `
      SELECT 
        DATE(timestamp AT TIME ZONE 'Africa/Harare') as date,
        COUNT(DISTINCT user_id) as unique_users
      FROM attendance_logs
      WHERE company_id = $1
        AND type = 'sign-in'
        AND timestamp >= $2
        AND timestamp <= $3
      GROUP BY DATE(timestamp AT TIME ZONE 'Africa/Harare')
    `;
    const dailyAttendance = await pool.query(avgDailyAttendanceQuery, [companyId, start, end]);
    
    const avgDailyUsers = dailyAttendance.rows.length > 0
      ? (dailyAttendance.rows.reduce((sum, row) => sum + parseInt(row.unique_users), 0) / dailyAttendance.rows.length).toFixed(1)
      : 0;

    console.log(`✅ Analytics: ${totalEvents.rows[0].total} events, ${totalLate} late, ${onTimePercentage}% on-time`);

    res.json({
      totalEvents: parseInt(totalEvents.rows[0].total),
      lateCheckins: totalLate,
      onTimePercentage: parseFloat(onTimePercentage),
      totalSignIns: totalSignIns,
      activeEmployees: parseInt(activeEmployees.rows[0].count),
      avgDailyAttendance: parseFloat(avgDailyUsers),
      roleBreakdown: roleBreakdown.rows.map(row => ({
        role: row.role,
        count: parseInt(row.count)
      })),
      dateRange: {
        start,
        end
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ATTENDANCE TRENDS ====================
router.get('/trends', checkPermission('view_analytics'), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const companyId = req.companyId;

    // ✅ Get daily attendance trends (filtered by company)
    const trendsQuery = `
      SELECT 
        DATE(timestamp AT TIME ZONE 'Africa/Harare') as date,
        COUNT(*) FILTER (WHERE type = 'sign-in') as sign_ins,
        COUNT(*) FILTER (WHERE type = 'sign-out') as sign_outs,
        COUNT(DISTINCT user_id) as unique_users
      FROM attendance_logs
      WHERE company_id = $1
        AND timestamp >= NOW() - INTERVAL '${parseInt(days)} days'
      GROUP BY DATE(timestamp AT TIME ZONE 'Africa/Harare')
      ORDER BY date DESC
      LIMIT $2
    `;
    
    const trends = await pool.query(trendsQuery, [companyId, parseInt(days)]);

    res.json({
      trends: trends.rows.map(row => ({
        date: row.date,
        signIns: parseInt(row.sign_ins),
        signOuts: parseInt(row.sign_outs),
        uniqueUsers: parseInt(row.unique_users)
      }))
    });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== EMPLOYEE PERFORMANCE ====================
router.get('/performance', checkPermission('view_analytics'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const companyId = req.companyId;

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    // ✅ Get employee performance metrics (filtered by company)
    const performanceQuery = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        COUNT(*) FILTER (WHERE a.type = 'sign-in') as total_sign_ins,
        COUNT(*) FILTER (
          WHERE a.type = 'sign-in' 
          AND (
            EXTRACT(HOUR FROM a.timestamp AT TIME ZONE 'Africa/Harare') > 9 
            OR (
              EXTRACT(HOUR FROM a.timestamp AT TIME ZONE 'Africa/Harare') = 9 
              AND EXTRACT(MINUTE FROM a.timestamp AT TIME ZONE 'Africa/Harare') > 15
            )
          )
        ) as late_arrivals,
        COUNT(DISTINCT DATE(a.timestamp AT TIME ZONE 'Africa/Harare')) as days_attended
      FROM users u
      LEFT JOIN attendance_logs a ON u.id = a.user_id 
        AND a.timestamp >= $2 
        AND a.timestamp <= $3
        AND a.company_id = $1
      WHERE u.company_id = $1
      GROUP BY u.id, u.name, u.email, u.role
      ORDER BY days_attended DESC
    `;

    const performance = await pool.query(performanceQuery, [companyId, start, end]);

    res.json({
      performance: performance.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        totalSignIns: parseInt(row.total_sign_ins),
        lateArrivals: parseInt(row.late_arrivals),
        daysAttended: parseInt(row.days_attended),
        onTimeRate: row.total_sign_ins > 0 
          ? (((row.total_sign_ins - row.late_arrivals) / row.total_sign_ins) * 100).toFixed(1)
          : 0
      })),
      dateRange: { start, end }
    });
  } catch (error) {
    console.error('Get performance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;