// server/routes/signupRequest.routes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../index.js';
import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// ==================== SIGNUP REQUEST ROUTES ====================

// Submit signup request (public - no auth required)
router.post(
  '/request',
  body('email').isEmail().normalizeEmail(),
  body('name').trim().notEmpty(),
  body('requestedRole').isIn(['pharmacist', 'assistant']), // Can't request admin/hr roles
  body('department').trim().notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: errors.array() 
        });
      }

      const { email, name, requestedRole, department, reason } = req.body;

      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ 
          error: 'An account with this email already exists' 
        });
      }

      // Check if there's already a pending request
      const existingRequest = await pool.query(
        `SELECT id FROM signup_requests 
         WHERE email = $1 AND status = 'pending'`,
        [email]
      );

      if (existingRequest.rows.length > 0) {
        return res.status(400).json({ 
          error: 'A signup request with this email is already pending' 
        });
      }

      // Create signup request
      await pool.query(
        `INSERT INTO signup_requests 
         (email, name, requested_role, department, reason, status) 
         VALUES ($1, $2, $3, $4, $5, 'pending')`,
        [email, name, requestedRole, department, reason || null]
      );

      res.status(201).json({ 
        message: 'Signup request submitted successfully. An administrator will review your request.' 
      });
    } catch (error) {
      console.error('Signup request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get all signup requests (Admin/HR only)
router.get(
  '/requests',
  authenticateToken,
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT 
           sr.id,
           sr.email,
           sr.name,
           sr.requested_role as "requestedRole",
           sr.department,
           sr.reason,
           sr.status,
           sr.requested_at as "requestedAt",
           sr.processed_at as "processedAt",
           sr.processed_by as "processedBy",
           sr.notes,
           admin.name as "processedByName"
         FROM signup_requests sr
         LEFT JOIN users admin ON sr.processed_by = admin.id
         ORDER BY 
           CASE WHEN sr.status = 'pending' THEN 0 ELSE 1 END,
           sr.requested_at DESC`
      );

      res.json({ requests: result.rows });
    } catch (error) {
      console.error('Get signup requests error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Approve signup request (Admin/HR only)
router.post(
  '/approve/:id',
  authenticateToken,
  checkPermission('manage_users'),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['admin', 'hr', 'pharmacist', 'assistant']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Password must be at least 6 characters' 
        });
      }

      const { id } = req.params;
      const { password, role, notes } = req.body;

      // Get the signup request
      const requestResult = await pool.query(
        `SELECT * FROM signup_requests WHERE id = $1`,
        [id]
      );

      if (requestResult.rows.length === 0) {
        return res.status(404).json({ error: 'Signup request not found' });
      }

      const request = requestResult.rows[0];

      if (request.status !== 'pending') {
        return res.status(400).json({ error: 'This request has already been processed' });
      }

      // Check if email is still available
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [request.email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ 
          error: 'An account with this email already exists' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user account
      const finalRole = role || request.requested_role;
      await pool.query(
        `INSERT INTO users (email, password, name, role, department) 
         VALUES ($1, $2, $3, $4, $5)`,
        [request.email, hashedPassword, request.name, finalRole, request.department]
      );

      // Update request status
      await pool.query(
        `UPDATE signup_requests 
         SET status = 'approved', 
             processed_at = NOW(), 
             processed_by = $1,
             notes = $2
         WHERE id = $3`,
        [req.user.id, notes || 'Account created successfully', id]
      );

      res.json({ 
        message: 'Signup request approved and account created successfully',
        account: {
          email: request.email,
          name: request.name,
          role: finalRole
        }
      });
    } catch (error) {
      console.error('Approve signup request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Reject signup request (Admin/HR only)
router.post(
  '/reject/:id',
  authenticateToken,
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const result = await pool.query(
        `UPDATE signup_requests 
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

      res.json({ message: 'Signup request rejected' });
    } catch (error) {
      console.error('Reject signup request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;