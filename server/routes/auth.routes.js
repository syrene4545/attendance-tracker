import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../index.js';
import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// ==================== AUTH ROUTES ====================

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔵 Login attempt:', email); // ✅ Add this

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    console.log('📊 Query result:', result.rows.length, 'users found'); // ✅ Add this

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    console.log('👤 User found:', user.email); // ✅ Add this

    // ✅ Check if password exists
    if (!user.password) {
      console.log('❌ User has no password:', email);
      return res.status(500).json({ error: 'Database error: User has no password' });
    }

    // ✅ Fixed: Use 'password' not 'password_hash'
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
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
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register (Admin only)
router.post(
  '/register',
  authenticateToken,
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const { email, password, name, role, department } = req.body;

      // Check if user exists
      const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // ✅ Fixed: Use 'password' not 'password_hash'
      const result = await pool.query(
        'INSERT INTO users (email, password, name, role, department) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, department',
        [email, passwordHash, name, role, department]
      );

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
  authenticateToken,
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const userId = req.params.id;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);

      // ✅ Fixed: Use 'password' not 'password_hash'
      const result = await pool.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role',
        [passwordHash, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found.' });
      }

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


export default router;