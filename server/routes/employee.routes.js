import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../index.js';
import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// ==================== EMPLOYEE ROUTES (USERS TABLE) ====================

// Get all employees (Admin/HR only)
router.get('/', authenticateToken, checkPermission('view_all'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, role, department, email, created_at 
       FROM users 
       ORDER BY name`
    );

    res.json({ employees: result.rows });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get employee by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Allow only admin/HR OR self-view
    if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.id != id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await pool.query(
      `SELECT id, name, role, department, email, created_at 
       FROM users 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ employee: result.rows[0] });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new employee (Admin/HR only)
router.post('/', authenticateToken, checkPermission('manage_users'), async (req, res) => {
  try {
    const { name, role, department, email, password } = req.body;

    const passwordHash = await bcrypt.hash(password || 'password123', 10);

    const result = await pool.query(
      `INSERT INTO users (name, role, department, email, password_hash, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, name, role, department, email, created_at`,
      [name, role, department, email, passwordHash]
    );

    res.status(201).json({ employee: result.rows[0] });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update employee (Admin/HR only)
router.put('/:id', authenticateToken, checkPermission('manage_users'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, department, email } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET name = $1, role = $2, department = $3, email = $4 
       WHERE id = $5 
       RETURNING id, name, role, department, email, created_at`,
      [name, role, department, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ employee: result.rows[0] });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete employee (Admin only)
router.delete('/:id', authenticateToken, checkPermission('delete'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
