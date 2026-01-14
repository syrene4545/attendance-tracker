import express from 'express';
import { pool } from '../index.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';
import { extractTenant, verifyTenantAccess } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// ✅ Apply authentication and tenant extraction to ALL routes
router.use(protect);           // 1️⃣ Authenticate user
router.use(extractTenant);     // 2️⃣ Extract tenant context
router.use(verifyTenantAccess); // 3️⃣ Verify tenant access

// ===============================
// GET CURRENT LOGGED-IN USER
// GET /api/users/me
// ===============================
router.get('/me', async (req, res) => {
  try {
    const user = await pool.query(
      `SELECT id, email, name, role, department, created_at, company_id
       FROM users 
       WHERE id = $1 AND company_id = $2`,
      [req.user.id, req.companyId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: user.rows[0] });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===============================
// GET ALL USERS (Admin/HR only)
// GET /api/users
// ===============================
router.get('/', checkPermission('manage_users'), async (req, res) => {
  try {
    console.log(`📊 Fetching users for company_id: ${req.companyId}`);
    
    const result = await pool.query(
      `SELECT id, name, email, role, department, created_at
       FROM users 
       WHERE company_id = $1
       ORDER BY name ASC`,
      [req.companyId]
    );

    console.log(`✅ Found ${result.rows.length} users`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===============================
// GET USER BY ID
// - User can view themselves
// - Admin/HR can view anyone in their company
// ===============================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is viewing their own profile OR is admin/hr
    const isSelf = req.user.id === parseInt(id);
    const isAdminOrHR = ['admin', 'hr'].includes(req.user.role);

    if (!isSelf && !isAdminOrHR) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Fetch user within same company
    const result = await pool.query(
      `SELECT id, name, email, role, department, created_at, company_id
       FROM users 
       WHERE id = $1 AND company_id = $2`,
      [id, req.companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===============================
// UPDATE USER (Admin/HR only)
// PUT /api/users/:id
// ===============================
router.put('/:id', checkPermission('manage_users'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, department } = req.body;

    // Validate input
    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }

    // Update user within same company
    const updated = await pool.query(
      `UPDATE users
       SET name = $1, role = $2, department = $3, updated_at = NOW()
       WHERE id = $4 AND company_id = $5
       RETURNING id, email, name, role, department, created_at`,
      [name, role, department, id, req.companyId]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: updated.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===============================
// DELETE USER (Admin only)
// DELETE /api/users/:id
// ===============================
router.delete('/:id', checkPermission('manage_users'), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete user within same company
    const deleted = await pool.query(
      `DELETE FROM users 
       WHERE id = $1 AND company_id = $2
       RETURNING id`,
      [id, req.companyId]
    );

    if (deleted.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;