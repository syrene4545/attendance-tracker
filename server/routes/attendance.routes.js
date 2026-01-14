// server/routes/attendance.routes.js

import express from 'express';
import { pool } from '../index.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';
import { body, validationResult, query } from 'express-validator';
import { extractTenant, verifyTenantAccess } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// ✅ Apply authentication and tenant extraction to ALL routes
router.use(protect);           // 1️⃣ Authenticate user
router.use(extractTenant);     // 2️⃣ Extract tenant context
router.use(verifyTenantAccess); // 3️⃣ Verify tenant access

// Helper: format DB row to frontend-friendly object
const formatLog = (logRow) => {
  const location = logRow.location ? (() => {
    try {
      return typeof logRow.location === 'string' ? JSON.parse(logRow.location) : logRow.location;
    } catch (e) {
      return null;
    }
  })() : null;

  return {
    id: logRow.id,
    userId: logRow.user_id,
    userName: logRow.user_name || null,
    userEmail: logRow.user_email || null,
    type: logRow.type,
    timestamp: logRow.timestamp,
    date: logRow.timestamp ? new Date(logRow.timestamp).toISOString().split('T')[0] : null,
    location,
    edited: logRow.edited || false,
    editedBy: logRow.edited_by || null,
    editedAt: logRow.edited_at || null
  };
};

// ==================== RECORD ATTENDANCE ====================
router.post(
  '/',
  body('type').isString().trim().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }

      const { type } = req.body;
      const rawLocation = req.body.location || null;
      const userId = req.user.id;
      const companyId = req.companyId;

      const allowedTypes = ['sign-in', 'lunch-out', 'lunch-in', 'sign-out', 'break-start', 'break-end'];
      if (!allowedTypes.includes(type)) {
        return res.status(400).json({ error: `Invalid event type. Allowed: ${allowedTypes.join(', ')}` });
      }

      // Check for duplicates with company filter
      const today = new Date().toISOString().split('T')[0];
      const dupCheck = await pool.query(
        `SELECT 1 FROM attendance_logs 
         WHERE user_id = $1 
           AND company_id = $2
           AND DATE(timestamp AT TIME ZONE 'Africa/Harare') = $3
           AND type = $4
         LIMIT 1`,
        [userId, companyId, today, type]
      );

      if (dupCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Event already recorded today' });
      }

      let locationToStore = null;
      if (rawLocation) {
        try {
          locationToStore = typeof rawLocation === 'string' ? JSON.stringify(JSON.parse(rawLocation)) : JSON.stringify(rawLocation);
        } catch (err) {
          locationToStore = null;
        }
      }

      // Insert with company_id
      const insertResult = await pool.query(
        `INSERT INTO attendance_logs (user_id, company_id, type, timestamp, location, edited)
         VALUES ($1, $2, $3, timezone('Africa/Harare', NOW()), $4, false)
         RETURNING id`,
        [userId, companyId, type, locationToStore]
      );

      const createdId = insertResult.rows[0].id;
      
      // Fetch with company filter
      const refreshed = await pool.query(
        `SELECT 
           a.id,
           a.user_id,
           a.type,
           a.timestamp AT TIME ZONE 'Africa/Harare' as timestamp,
           a.location,
           a.edited,
           a.edited_by,
           a.edited_at AT TIME ZONE 'Africa/Harare' as edited_at,
           u.name as user_name,
           u.email as user_email
         FROM attendance_logs a
         JOIN users u ON a.user_id = u.id
         WHERE a.id = $1 AND a.company_id = $2`,
        [createdId, companyId]
      );

      const formatted = formatLog(refreshed.rows[0]);
      return res.status(201).json({ log: formatted });
    } catch (error) {
      console.error('Record attendance error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ==================== GET ATTENDANCE LOGS ====================
router.get(
  '/',
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid date filters', details: errors.array() });
      }

      const { startDate, endDate, userId } = req.query;
      const companyId = req.companyId;
      
      let queryText = `
        SELECT 
          a.id,
          a.user_id,
          a.type,
          a.timestamp AT TIME ZONE 'Africa/Harare' as timestamp,
          a.location,
          a.edited,
          a.edited_by,
          a.edited_at AT TIME ZONE 'Africa/Harare' as edited_at,
          u.name as user_name,
          u.email as user_email
        FROM attendance_logs a
        JOIN users u ON a.user_id = u.id
        WHERE a.company_id = $1
      `;
      const params = [companyId];
      let idx = 2;

      // Check if user has view_all permission (admin/hr)
      const canViewAll = ['admin', 'hr'].includes(req.user.role);

      if (!canViewAll) {
        // Non-admin/hr can only view their own logs
        queryText += ` AND a.user_id = $${idx}`;
        params.push(req.user.id);
        idx++;
      } else if (userId) {
        // Admin/HR can filter by specific user
        queryText += ` AND a.user_id = $${idx}`;
        params.push(userId);
        idx++;
      }

      if (startDate) {
        queryText += ` AND (a.timestamp AT TIME ZONE 'Africa/Harare')::date >= $${idx}::date`;
        params.push(startDate);
        idx++;
      }

      if (endDate) {
        queryText += ` AND (a.timestamp AT TIME ZONE 'Africa/Harare')::date <= $${idx}::date`;
        params.push(endDate);
        idx++;
      }

      queryText += ` ORDER BY a.timestamp DESC LIMIT 5000`;

      const result = await pool.query(queryText, params);
      const formatted = result.rows.map(formatLog);
      return res.json({ logs: formatted });
    } catch (error) {
      console.error('Get attendance error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ==================== GET MY ATTENDANCE LOGS ====================
router.get('/me', async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.companyId;

    const result = await pool.query(
      `SELECT 
         a.id,
         a.user_id,
         a.type,
         a.timestamp AT TIME ZONE 'Africa/Harare' as timestamp,
         a.location,
         a.edited,
         a.edited_by,
         a.edited_at AT TIME ZONE 'Africa/Harare' as edited_at,
         u.name as user_name,
         u.email as user_email
       FROM attendance_logs a
       JOIN users u ON a.user_id = u.id
       WHERE a.user_id = $1 AND a.company_id = $2
       ORDER BY a.timestamp DESC`,
      [userId, companyId]
    );

    const formatted = result.rows.map(formatLog);
    return res.json({ logs: formatted });
  } catch (error) {
    console.error('Get my attendance error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== WEEKLY SUMMARY ====================
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.companyId;

    const result = await pool.query(
      `SELECT 
         a.id,
         a.user_id,
         a.type,
         a.timestamp AT TIME ZONE 'Africa/Harare' as timestamp,
         u.name as user_name
       FROM attendance_logs a
       JOIN users u ON a.user_id = u.id
       WHERE a.user_id = $1 
         AND a.company_id = $2
         AND (a.timestamp AT TIME ZONE 'Africa/Harare')::date >= date_trunc('week', (now() AT TIME ZONE 'Africa/Harare')::date)::date
       ORDER BY a.timestamp ASC`,
      [userId, companyId]
    );

    const logs = result.rows.map(formatLog);
    const daysThisWeek = new Set(logs.map(l => l.date)).size;
    const signIns = logs.filter(l => l.type === 'sign-in');
    const lateSignIns = signIns.filter(l => {
      const t = new Date(l.timestamp);
      return t.getHours() > 9 || (t.getHours() === 9 && t.getMinutes() > 15);
    });
    const onTimeRate = signIns.length > 0 ? (((signIns.length - lateSignIns.length) / signIns.length) * 100).toFixed(1) : 0;

    let totalHours = 0;
    const grouped = {};
    logs.forEach(l => {
      grouped[l.date] = grouped[l.date] || [];
      grouped[l.date].push(l);
    });
    Object.values(grouped).forEach(dayLogs => {
      const si = dayLogs.find(x => x.type === 'sign-in');
      const so = dayLogs.find(x => x.type === 'sign-out');
      if (si && so) {
        const hours = (new Date(so.timestamp) - new Date(si.timestamp)) / (1000 * 60 * 60);
        if (!Number.isNaN(hours) && isFinite(hours)) totalHours += hours;
      }
    });

    return res.json({
      daysThisWeek,
      onTimeRate,
      totalHours: totalHours.toFixed(1)
    });
  } catch (error) {
    console.error('Weekly summary error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== MONTHLY SUMMARY ====================
router.get('/summary/month', async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.companyId;

    const result = await pool.query(
      `SELECT 
         a.id,
         a.user_id,
         a.type,
         a.timestamp AT TIME ZONE 'Africa/Harare' as timestamp,
         u.name as user_name
       FROM attendance_logs a
       JOIN users u ON a.user_id = u.id
       WHERE a.user_id = $1 
         AND a.company_id = $2
         AND (a.timestamp AT TIME ZONE 'Africa/Harare')::date >= date_trunc('month', (now() AT TIME ZONE 'Africa/Harare')::date)::date
       ORDER BY a.timestamp ASC`,
      [userId, companyId]
    );

    const logs = result.rows.map(formatLog);
    const daysThisMonth = new Set(logs.map(l => l.date)).size;
    const signIns = logs.filter(l => l.type === 'sign-in');
    const lateSignIns = signIns.filter(l => {
      const t = new Date(l.timestamp);
      return t.getHours() > 9 || (t.getHours() === 9 && t.getMinutes() > 15);
    });
    const onTimeRate = signIns.length > 0 ? (((signIns.length - lateSignIns.length) / signIns.length) * 100).toFixed(1) : 0;

    let totalHours = 0;
    const grouped = {};
    logs.forEach(l => {
      grouped[l.date] = grouped[l.date] || [];
      grouped[l.date].push(l);
    });
    Object.values(grouped).forEach(dayLogs => {
      const si = dayLogs.find(x => x.type === 'sign-in');
      const so = dayLogs.find(x => x.type === 'sign-out');
      if (si && so) {
        const hours = (new Date(so.timestamp) - new Date(si.timestamp)) / (1000 * 60 * 60);
        if (!Number.isNaN(hours) && isFinite(hours)) totalHours += hours;
      }
    });

    return res.json({
      daysThisMonth,
      onTimeRate,
      totalHours: totalHours.toFixed(1)
    });
  } catch (error) {
    console.error('Monthly summary error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== UPDATE ATTENDANCE LOG ====================
router.put(
  '/:id',
  checkPermission('manage_attendance'),
  body('type').optional().isString(),
  body('timestamp').optional().isISO8601(),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { type, timestamp, location } = req.body;
      const companyId = req.companyId;

      const updates = [];
      const params = [];
      let idx = 1;

      if (type) {
        updates.push(`type = $${idx}`);
        params.push(type);
        idx++;
      }

      if (timestamp) {
        updates.push(`timestamp = ($${idx}::timestamp AT TIME ZONE 'Africa/Harare')`);
        params.push(timestamp);
        idx++;
      }

      if (typeof location !== 'undefined') {
        let locToStore = null;
        if (location) {
          try {
            locToStore = typeof location === 'string' ? JSON.stringify(JSON.parse(location)) : JSON.stringify(location);
          } catch (e) {
            locToStore = null;
          }
        }
        updates.push(`location = $${idx}`);
        params.push(locToStore);
        idx++;
      }

      updates.push(`edited = true`);
      updates.push(`edited_by = $${idx}`);
      params.push(req.user.id);
      idx++;
      updates.push(`edited_at = timezone('Africa/Harare', NOW())`);

      if (updates.length === 3) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      params.push(id);
      params.push(companyId);

      const sql = `
        UPDATE attendance_logs
        SET ${updates.join(', ')}
        WHERE id = $${idx} AND company_id = $${idx + 1}
        RETURNING id
      `;

      const result = await pool.query(sql, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Log not found' });
      }

      // Fetch updated record with company filter
      const refreshed = await pool.query(
        `SELECT 
           a.id,
           a.user_id,
           a.type,
           a.timestamp AT TIME ZONE 'Africa/Harare' as timestamp,
           a.location,
           a.edited,
           a.edited_by,
           a.edited_at AT TIME ZONE 'Africa/Harare' as edited_at,
           u.name as user_name,
           u.email as user_email
         FROM attendance_logs a
         JOIN users u ON a.user_id = u.id
         WHERE a.id = $1 AND a.company_id = $2`,
        [result.rows[0].id, companyId]
      );

      const formatted = formatLog(refreshed.rows[0]);
      return res.json({ log: formatted });
    } catch (error) {
      console.error('Update attendance error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ==================== DELETE ATTENDANCE LOG ====================
router.delete('/:id', checkPermission('manage_attendance'), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;
    
    const result = await pool.query(
      `DELETE FROM attendance_logs 
       WHERE id = $1 AND company_id = $2 
       RETURNING *`,
      [id, companyId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }
    
    return res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;