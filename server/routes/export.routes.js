import express from 'express';
import { pool } from '../index.js';
import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// ==================== EXPORT ROUTES ====================

// Export to CSV (Admin/HR only) - Africa/Harare timezone
router.get('/csv', authenticateToken, checkPermission('export_data'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    console.log('📥 CSV Export Request:', { startDate, endDate });

    // Add time to date range to capture full day
    const start = startDate ? `${startDate} 00:00:00` : '2000-01-01 00:00:00';
    const end = endDate ? `${endDate} 23:59:59` : '2100-01-01 23:59:59';

    console.log('📅 Date range:', { start, end });

    // ✅ Convert all timestamps to Africa/Harare timezone
    const query = `
      SELECT 
        TO_CHAR(a.timestamp AT TIME ZONE 'Africa/Harare', 'YYYY-MM-DD') as date,
        u.name as employee,
        a.type as event_type,
        TO_CHAR(a.timestamp AT TIME ZONE 'Africa/Harare', 'HH24:MI:SS') as time,
        a.location,
        CASE WHEN a.edited THEN 'Yes' ELSE 'No' END as edited
      FROM attendance_logs a
      JOIN users u ON a.user_id = u.id
      WHERE (a.timestamp AT TIME ZONE 'Africa/Harare')::timestamp >= $1::timestamp 
        AND (a.timestamp AT TIME ZONE 'Africa/Harare')::timestamp <= $2::timestamp
      ORDER BY a.timestamp DESC
    `;

    const result = await pool.query(query, [start, end]);

    console.log(`📊 Query returned ${result.rows.length} rows`);

    if (result.rows.length === 0) {
      console.log('⚠️ No data found for export');
      // Return empty CSV with headers only
      const csvHeader = 'Date (GMT+2),Employee,Event Type,Time (GMT+2),Location,Edited\n';
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
      return res.send(csvHeader);
    }

    // Create CSV with timezone info in header
    const csvHeader = 'Date (GMT+2),Employee,Event Type,Time (GMT+2),Location,Edited\n';
    const csvRows = result.rows.map(row => 
      `${row.date},${row.employee},${row.event_type},${row.time},${row.location || 'N/A'},${row.edited}`
    ).join('\n');

    const csv = csvHeader + csvRows;

    console.log(`✅ CSV generated successfully (${csv.length} bytes)`);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${startDate || 'all'}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('❌ Export CSV error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;