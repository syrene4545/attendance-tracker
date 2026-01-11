// server/routes/passwordReset.routes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../index.js';
import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';
import { verifyTenantAccess } from '../middleware/tenantMiddleware.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// ==================== PASSWORD RESET ROUTES ====================

// Request password reset (public - no auth required)
router.post(
  '/request',
  body('email').isEmail().normalizeEmail(),
  body('companyId').optional().isInt(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid email address' });
      }

      const { email, companyId } = req.body;

      console.log('🔵 Password reset request for:', email, 'Company:', companyId);

      // ✅ Check if user exists (filter by company if provided)
      let query = 'SELECT id, email, name, company_id FROM users WHERE email = $1';
      const params = [email];
      
      if (companyId) {
        query += ' AND company_id = $2';
        params.push(companyId);
      }

      const userResult = await pool.query(query, params);

      console.log('📊 User found:', userResult.rows.length);

      if (userResult.rows.length === 0) {
        console.log('⚠️ User not found');
        // Don't reveal if email exists or not (security)
        return res.json({ 
          message: 'If an account exists with this email, a reset request has been created.' 
        });
      }

      // ✅ If multiple users with same email across companies, require company_id
      if (userResult.rows.length > 1 && !companyId) {
        return res.status(400).json({ 
          error: 'Multiple accounts found with this email. Please contact your administrator.',
          requiresCompanyId: true
        });
      }

      const user = userResult.rows[0];

      console.log('👤 Creating reset request for user:', user.id, 'Company:', user.company_id);

      // ✅ Check if there's already a pending request (same company)
      const existingRequest = await pool.query(
        `SELECT id FROM password_reset_requests 
         WHERE user_id = $1 AND status = 'pending' AND company_id = $2`,
        [user.id, user.company_id]
      );

      if (existingRequest.rows.length > 0) {
        return res.json({ 
          message: 'A password reset request is already pending for this account.' 
        });
      }

      // ✅ Create reset request with company_id
      const result = await pool.query(
        `INSERT INTO password_reset_requests (user_id, email, status, company_id) 
        VALUES ($1, $2, 'pending', $3)
        RETURNING id`,
        [user.id, email, user.company_id]
      );

      console.log('✅ Reset request created with ID:', result.rows[0].id);

      res.json({ 
        message: 'Password reset request submitted successfully. An administrator will process your request.' 
      });
    } catch (error) {
      console.error('❌ Password reset request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get all password reset requests (Admin/HR only)
router.get(
  '/requests',
  authenticateToken,
  verifyTenantAccess,
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const companyId = req.companyId;
      
      console.log('🔵 Fetching password reset requests for company:', companyId);
      
      // ✅ Filter by company - NO employee_profiles reference
      const result = await pool.query(
        `SELECT 
           pr.id,
           pr.user_id as "userId",
           pr.email,
           pr.status,
           pr.requested_at as "requestedAt",
           pr.processed_at as "processedAt",
           pr.processed_by as "processedBy",
           pr.notes,
           u.name as "userName",
           u.role as "userRole",
           d.name as "department",
           admin.name as "processedByName"
         FROM password_reset_requests pr
         JOIN users u ON pr.user_id = u.id AND u.company_id = $1
         LEFT JOIN departments d ON u.department_id = d.id AND d.company_id = $1
         LEFT JOIN users admin ON pr.processed_by = admin.id AND admin.company_id = $1
         WHERE pr.company_id = $1
         ORDER BY 
           CASE WHEN pr.status = 'pending' THEN 0 ELSE 1 END,
           pr.requested_at DESC`,
        [companyId]
      );

      console.log('📊 Found', result.rows.length, 'password reset requests');

      res.json({ requests: result.rows });
    } catch (error) {
      console.error('❌ Get password reset requests error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get single password reset request (Admin/HR only)
router.get(
  '/requests/:id',
  authenticateToken,
  verifyTenantAccess,
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.companyId;
      
      // ✅ Filter by company - NO employee_profiles reference
      const result = await pool.query(
        `SELECT 
           pr.id,
           pr.user_id as "userId",
           pr.email,
           pr.status,
           pr.requested_at as "requestedAt",
           pr.processed_at as "processedAt",
           pr.processed_by as "processedBy",
           pr.notes,
           u.name as "userName",
           u.email as "userEmail",
           u.role as "userRole",
           u.employee_number as "employeeNumber",
           d.name as "departmentName",
           admin.name as "processedByName"
         FROM password_reset_requests pr
         JOIN users u ON pr.user_id = u.id AND u.company_id = $2
         LEFT JOIN departments d ON u.department_id = d.id AND d.company_id = $2
         LEFT JOIN users admin ON pr.processed_by = admin.id AND admin.company_id = $2
         WHERE pr.id = $1 AND pr.company_id = $2`,
        [id, companyId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Reset request not found' });
      }

      res.json({ request: result.rows[0] });
    } catch (error) {
      console.error('❌ Get password reset request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Approve password reset request (Admin/HR only)
router.post(
  '/approve/:id',
  authenticateToken,
  verifyTenantAccess,
  checkPermission('manage_users'),
  body('newPassword').isLength({ min: 6 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const { id } = req.params;
      const companyId = req.companyId;
      const { newPassword, notes } = req.body;

      console.log('🔵 Approving password reset:', id, 'Company:', companyId);

      // ✅ Get the reset request (verify company)
      const requestResult = await pool.query(
        `SELECT user_id, status FROM password_reset_requests 
         WHERE id = $1 AND company_id = $2`,
        [id, companyId]
      );

      if (requestResult.rows.length === 0) {
        return res.status(404).json({ error: 'Reset request not found' });
      }

      const request = requestResult.rows[0];

      if (request.status !== 'pending') {
        return res.status(400).json({ error: 'This request has already been processed' });
      }

      // ✅ Verify user belongs to same company
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND company_id = $2',
        [request.user_id, companyId]
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'User not found in company' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Begin transaction
      await pool.query('BEGIN');

      try {
        // ✅ Update user's password (verify company)
        await pool.query(
          'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 AND company_id = $3',
          [hashedPassword, request.user_id, companyId]
        );

        // ✅ Update request status (verify company)
        await pool.query(
          `UPDATE password_reset_requests 
           SET status = 'completed', 
               processed_at = NOW(), 
               processed_by = $1,
               notes = $2
           WHERE id = $3 AND company_id = $4`,
          [req.user.id, notes || 'Password reset completed', id, companyId]
        );

        await pool.query('COMMIT');

        console.log('✅ Password reset approved for request:', id);

        res.json({ message: 'Password reset completed successfully' });
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('❌ Approve password reset error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Reject password reset request (Admin/HR only)
router.post(
  '/reject/:id',
  authenticateToken,
  verifyTenantAccess,
  checkPermission('manage_users'),
  body('notes').optional().trim(),
  async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.companyId;
      const { notes } = req.body;

      console.log('🔵 Rejecting password reset:', id);

      // ✅ Filter by company
      const result = await pool.query(
        `UPDATE password_reset_requests 
         SET status = 'rejected', 
             processed_at = NOW(), 
             processed_by = $1,
             notes = $2
         WHERE id = $3 AND status = 'pending' AND company_id = $4
         RETURNING id`,
        [req.user.id, notes || 'Request rejected', id, companyId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Request not found or already processed' });
      }

      console.log('✅ Password reset rejected for request:', id);

      res.json({ message: 'Password reset request rejected' });
    } catch (error) {
      console.error('❌ Reject password reset error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get password reset statistics (Admin/HR only)
router.get(
  '/stats',
  authenticateToken,
  verifyTenantAccess,
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const companyId = req.companyId;
      const { year } = req.query;
      const currentYear = year || new Date().getFullYear();

      // ✅ Get statistics (scoped to company)
      const stats = await pool.query(
        `SELECT 
          COUNT(*) FILTER (WHERE status = 'pending') as "pendingCount",
          COUNT(*) FILTER (WHERE status = 'completed') as "completedCount",
          COUNT(*) FILTER (WHERE status = 'rejected') as "rejectedCount",
          COUNT(*) as "totalCount",
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM requested_at) = $2) as "yearCount"
        FROM password_reset_requests
        WHERE company_id = $1`,
        [companyId, currentYear]
      );

      // ✅ Get monthly breakdown (scoped to company)
      const monthly = await pool.query(
        `SELECT 
          TO_CHAR(requested_at, 'YYYY-MM') as month,
          COUNT(*) as count,
          COUNT(*) FILTER (WHERE status = 'completed') as completed,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected
        FROM password_reset_requests
        WHERE company_id = $1 
          AND EXTRACT(YEAR FROM requested_at) = $2
        GROUP BY TO_CHAR(requested_at, 'YYYY-MM')
        ORDER BY month DESC`,
        [companyId, currentYear]
      );

      res.json({
        statistics: stats.rows[0],
        monthlyBreakdown: monthly.rows,
        year: currentYear
      });
    } catch (error) {
      console.error('❌ Get password reset stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Cancel own password reset request (authenticated user)
router.post(
  '/cancel/:id',
  authenticateToken,
  verifyTenantAccess,
  async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.companyId;
      const userId = req.user.id;

      // ✅ Cancel only own request in same company
      const result = await pool.query(
        `UPDATE password_reset_requests
         SET status = 'cancelled',
             notes = 'Cancelled by user',
             processed_at = NOW()
         WHERE id = $1 
           AND user_id = $2 
           AND status = 'pending' 
           AND company_id = $3
         RETURNING id`,
        [id, userId, companyId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          error: 'Request not found or cannot be cancelled' 
        });
      }

      console.log('✅ Password reset cancelled by user:', userId);

      res.json({ message: 'Password reset request cancelled successfully' });
    } catch (error) {
      console.error('❌ Cancel password reset error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;