// server/routes/auth.routes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../index.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';
import { extractTenant, verifyTenantAccess } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Login - NO authentication needed
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT u.*, c.name as company_name, c.subdomain, c.is_active as company_active
       FROM users u
       LEFT JOIN companies c ON u.company_id = c.id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.company_active) {
      return res.status(403).json({ error: 'Company account is inactive' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        company_id: user.company_id
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        companyId: user.company_id,
        companyName: user.company_name,
        subdomain: user.subdomain
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PROTECTED ROUTES ====================

// Register new user (Admin only)
router.post('/register',
  protect,                          // 1️⃣ Authenticate
  extractTenant,                    // 2️⃣ Extract tenant context
  checkPermission('manage_users'),  // 3️⃣ Check permission ✅ YOUR FIX
  verifyTenantAccess,               // 4️⃣ Verify tenant access
  async (req, res) => {
    try {
      const { email, password, name, role, department } = req.body;
      const companyId = req.companyId;

      // Check if user exists in this company
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND company_id = $2',
        [email, companyId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists in this company' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Insert user
      const result = await pool.query(
        `INSERT INTO users (email, password, name, role, department, company_id) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, email, name, role, department, company_id`,
        [email, passwordHash, name, role, department, companyId]
      );

      res.status(201).json({ user: result.rows[0] });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Reset password (Admin only)
router.put('/reset-password/:id',
  protect,                          // 1️⃣ Authenticate
  extractTenant,                    // 2️⃣ Extract tenant context
  checkPermission('manage_users'),  // 3️⃣ Check permission
  verifyTenantAccess,               // 4️⃣ Verify tenant access
  async (req, res) => {
    try {
      const userId = req.params.id;
      const { newPassword } = req.body;
      const companyId = req.companyId;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      const result = await pool.query(
        `UPDATE users 
         SET password = $1, updated_at = NOW() 
         WHERE id = $2 AND company_id = $3
         RETURNING id, email, name, role`,
        [passwordHash, userId, companyId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        message: 'Password reset successful',
        user: result.rows[0],
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Verify token (for frontend to check if token is still valid)
router.get('/verify', 
  protect,  // ✅ Only needs authentication
  async (req, res) => {
    // req.user is already populated by protect middleware
    res.json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        department: req.user.department,
        companyId: req.user.company_id,
        companyName: req.user.company_name,
        subdomain: req.user.subdomain
      }
    });
  }
);

export default router;