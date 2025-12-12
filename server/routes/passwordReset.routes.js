// server/routes/passwordReset.routes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../index.js';
import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// ==================== PASSWORD RESET ROUTES ====================

// Request password reset (public - no auth required)
router.post(
  '/request',
  body('email').isEmail().normalizeEmail(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid email address' });
      }

      const { email } = req.body;

      console.log('🔵 Password reset request for:', email); // ✅ Add this

      // Check if user exists
      const userResult = await pool.query(
        'SELECT id, email, name FROM users WHERE email = $1',
        [email]
      );

      console.log('📊 User found:', userResult.rows.length); // ✅ Add this

      if (userResult.rows.length === 0) {
        console.log('⚠️ User not found'); // ✅ Add this
        // Don't reveal if email exists or not (security)
        return res.json({ 
          message: 'If an account exists with this email, a reset request has been created.' 
        });
      }

      const user = userResult.rows[0];

      console.log('👤 Creating reset request for user:', user.id); // ✅ Add this

      // Check if there's already a pending request
      const existingRequest = await pool.query(
        `SELECT id FROM password_reset_requests 
         WHERE user_id = $1 AND status = 'pending'`,
        [user.id]
      );

      if (existingRequest.rows.length > 0) {
        return res.json({ 
          message: 'A password reset request is already pending for this account.' 
        });
      }

      // Create reset request

      // Create reset request
      const result = await pool.query(
        `INSERT INTO password_reset_requests (user_id, email, status) 
        VALUES ($1, $2, 'pending')
        RETURNING id`,
        [user.id, email]
      );

      
      // await pool.query(
      //   `INSERT INTO password_reset_requests (user_id, email, status) 
      //    VALUES ($1, $2, 'pending')`,
      //   [user.id, email]
      // );

      console.log('✅ Reset request created with ID:', result.rows[0].id); // ✅ Add this

      res.json({ 
        message: 'Password reset request submitted successfully. An administrator will process your request.' 
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get all password reset requests (Admin/HR only)
router.get(
  '/requests',
  authenticateToken,
  checkPermission('manage_users'),
  async (req, res) => {
    try {
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
           u.department,
           admin.name as "processedByName"
         FROM password_reset_requests pr
         JOIN users u ON pr.user_id = u.id
         LEFT JOIN users admin ON pr.processed_by = admin.id
         ORDER BY 
           CASE WHEN pr.status = 'pending' THEN 0 ELSE 1 END,
           pr.requested_at DESC`
      );

      res.json({ requests: result.rows });
    } catch (error) {
      console.error('Get password reset requests error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Approve password reset request (Admin/HR only)
router.post(
  '/approve/:id',
  authenticateToken,
  checkPermission('manage_users'),
  body('newPassword').isLength({ min: 6 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const { id } = req.params;
      const { newPassword, notes } = req.body;

      // Get the reset request
      const requestResult = await pool.query(
        `SELECT user_id, status FROM password_reset_requests WHERE id = $1`,
        [id]
      );

      if (requestResult.rows.length === 0) {
        return res.status(404).json({ error: 'Reset request not found' });
      }

      const request = requestResult.rows[0];

      if (request.status !== 'pending') {
        return res.status(400).json({ error: 'This request has already been processed' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user's password
      await pool.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, request.user_id]
      );

      // Update request status
      await pool.query(
        `UPDATE password_reset_requests 
         SET status = 'completed', 
             processed_at = NOW(), 
             processed_by = $1,
             notes = $2
         WHERE id = $3`,
        [req.user.id, notes || 'Password reset completed', id]
      );

      res.json({ message: 'Password reset completed successfully' });
    } catch (error) {
      console.error('Approve password reset error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Reject password reset request (Admin/HR only)
router.post(
  '/reject/:id',
  authenticateToken,
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const result = await pool.query(
        `UPDATE password_reset_requests 
         SET status = 'rejected', 
             processed_at = NOW(), 
             processed_by = $1,
             notes = $2
         WHERE id = $3 AND status = 'pending'
         RETURNING id`,
        [req.user.id, notes || 'Request rejected', id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Request not found or already processed' });
      }

      res.json({ message: 'Password reset request rejected' });
    } catch (error) {
      console.error('Reject password reset error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;