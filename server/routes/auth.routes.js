
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../index.js';
import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';
import { extractTenant, verifyTenantAccess } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// ==================== AUTH ROUTES ====================

// Login (public route - no tenant verification needed yet)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔵 Login attempt:', email);

    // ✅ Get user with company information
    const result = await pool.query(
      `SELECT u.*, c.company_name, c.subdomain, c.is_active as company_active
       FROM users u
       LEFT JOIN companies c ON u.company_id = c.id
       WHERE u.email = $1`,
      [email]
    );

    console.log('📊 Query result:', result.rows.length, 'users found');

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    console.log('👤 User found:', user.email, '| Company:', user.company_name);

    // ✅ Check if company is active
    if (!user.company_active) {
      return res.status(403).json({ 
        error: 'Company account is inactive. Please contact support.' 
      });
    }

    // Check if password exists
    if (!user.password) {
      console.log('❌ User has no password:', email);
      return res.status(500).json({ error: 'Database error: User has no password' });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ✅ Include company_id in JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        company_id: user.company_id // ✅ Add company_id to token
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // ✅ Return company info with user
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

// Register (Admin only - within same company)
router.post(
  '/register',
  extractTenant, // ✅ Extract tenant first
  authenticateToken,
  verifyTenantAccess, // ✅ Verify tenant access
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const { email, password, name, role, department } = req.body;
      const companyId = req.companyId; // ✅ Get company_id from tenant middleware

      console.log(`📝 Registering new user for company_id: ${companyId}`);

      // ✅ Check if user exists in this company
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND company_id = $2',
        [email, companyId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists in this company' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // ✅ Insert with company_id
      const result = await pool.query(
        `INSERT INTO users (email, password, name, role, department, company_id) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, email, name, role, department, company_id`,
        [email, passwordHash, name, role, department, companyId]
      );

      console.log('✅ User registered:', result.rows[0].email);

      res.status(201).json({ user: result.rows[0] });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ==================== RESET USER PASSWORD (ADMIN ONLY) ====================
router.put(
  '/reset-password/:id',
  extractTenant, // ✅ Extract tenant first
  authenticateToken,
  verifyTenantAccess, // ✅ Verify tenant access
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const userId = req.params.id;
      const { newPassword } = req.body;
      const companyId = req.companyId; // ✅ Get company_id from tenant middleware

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // ✅ Update only within same company
      const result = await pool.query(
        `UPDATE users 
         SET password = $1, updated_at = NOW() 
         WHERE id = $2 AND company_id = $3
         RETURNING id, email, name, role`,
        [passwordHash, userId, companyId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found.' });
      }

      console.log('✅ Password reset for user:', result.rows[0].email);

      res.json({
        message: 'Password reset successful.',
        user: result.rows[0],
      });

    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Internal server error.' });
    }
  }
);

// ==================== VERIFY TOKEN (for frontend) ====================
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    // ✅ Get user with company info
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.department, u.company_id,
              c.company_name, c.subdomain
       FROM users u
       LEFT JOIN companies c ON u.company_id = c.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        companyId: user.company_id,
        companyName: user.company_name,
        subdomain: user.subdomain
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;