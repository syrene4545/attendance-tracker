// import express from 'express';
// import bcrypt from 'bcryptjs';
// import { pool } from '../index.js';
// import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';

// const router = express.Router();

// // ==================== EMPLOYEE ROUTES (USERS TABLE) ====================

// // Get all employees (Admin/HR only)
// router.get('/', authenticateToken, checkPermission('view_all'), async (req, res) => {
//   try {
//     const result = await pool.query(
//       `SELECT id, name, role, department, email, created_at 
//        FROM users 
//        ORDER BY name`
//     );

//     res.json({ employees: result.rows });
//   } catch (error) {
//     console.error('Get employees error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get employee by ID
// router.get('/:id', authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Allow only admin/HR OR self-view
//     if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.id != id) {
//       return res.status(403).json({ error: 'Not authorized' });
//     }

//     const result = await pool.query(
//       `SELECT id, name, role, department, email, created_at 
//        FROM users 
//        WHERE id = $1`,
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Employee not found' });
//     }

//     res.json({ employee: result.rows[0] });
//   } catch (error) {
//     console.error('Get employee error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Create new employee (Admin/HR only)
// router.post('/', authenticateToken, checkPermission('manage_users'), async (req, res) => {
//   try {
//     const { name, role, department, email, password } = req.body;

//     const passwordHash = await bcrypt.hash(password || 'password123', 10);

//     const result = await pool.query(
//       `INSERT INTO users (name, role, department, email, password_hash, created_at)
//        VALUES ($1, $2, $3, $4, $5, NOW())
//        RETURNING id, name, role, department, email, created_at`,
//       [name, role, department, email, passwordHash]
//     );

//     res.status(201).json({ employee: result.rows[0] });
//   } catch (error) {
//     console.error('Create employee error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Update employee (Admin/HR only)
// router.put('/:id', authenticateToken, checkPermission('manage_users'), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, role, department, email } = req.body;

//     const result = await pool.query(
//       `UPDATE users 
//        SET name = $1, role = $2, department = $3, email = $4 
//        WHERE id = $5 
//        RETURNING id, name, role, department, email, created_at`,
//       [name, role, department, email, id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Employee not found' });
//     }

//     res.json({ employee: result.rows[0] });
//   } catch (error) {
//     console.error('Update employee error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Delete employee (Admin only)
// router.delete('/:id', authenticateToken, checkPermission('delete'), async (req, res) => {
//   try {
//     const { id } = req.params;

//     const result = await pool.query(
//       `DELETE FROM users WHERE id = $1 RETURNING id`,
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Employee not found' });
//     }

//     res.json({ message: 'Employee deleted successfully' });
//   } catch (error) {
//     console.error('Delete employee error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// export default router;


import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../index.js';
import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';
import { verifyTenantAccess } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// ✅ Apply tenant middleware to all routes
router.use(authenticateToken);
router.use(verifyTenantAccess);

// ==================== EMPLOYEE ROUTES (USERS TABLE) ====================

// Get all employees (Admin/HR only)
router.get('/', checkPermission('view_all'), async (req, res) => {
  try {
    const companyId = req.companyId; // ✅ Get from tenant middleware

    console.log(`📊 Fetching employees for company_id: ${companyId}`);

    // ✅ Filter by company
    const result = await pool.query(
      `SELECT id, name, role, department, email, created_at, company_id
       FROM users 
       WHERE company_id = $1
       ORDER BY name ASC`,
      [companyId]
    );

    console.log(`✅ Found ${result.rows.length} employees`);

    res.json({ employees: result.rows });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId; // ✅ Get from tenant middleware

    // Allow only admin/HR OR self-view
    if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.id != id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // ✅ Filter by company
    const result = await pool.query(
      `SELECT id, name, role, department, email, created_at, company_id
       FROM users 
       WHERE id = $1 AND company_id = $2`,
      [id, companyId]
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
router.post('/', checkPermission('manage_users'), async (req, res) => {
  try {
    const { name, role, department, email, password } = req.body;
    const companyId = req.companyId; // ✅ Get from tenant middleware

    console.log(`📝 Creating employee for company_id: ${companyId}`);

    // ✅ Check if email already exists in this company
    const existingUser = await pool.query(
      `SELECT id FROM users WHERE email = $1 AND company_id = $2`,
      [email, companyId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists in this company' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password || 'password123', 10);

    // ✅ Insert with company_id
    const result = await pool.query(
      `INSERT INTO users (name, role, department, email, password, company_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, name, role, department, email, created_at, company_id`,
      [name, role, department, email, passwordHash, companyId]
    );

    console.log('✅ Employee created:', result.rows[0].email);

    res.status(201).json({ employee: result.rows[0] });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update employee (Admin/HR only)
router.put('/:id', checkPermission('manage_users'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, department, email } = req.body;
    const companyId = req.companyId; // ✅ Get from tenant middleware

    // ✅ Check if new email already exists in this company (excluding current user)
    if (email) {
      const existingUser = await pool.query(
        `SELECT id FROM users WHERE email = $1 AND company_id = $2 AND id != $3`,
        [email, companyId, id]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email already exists in this company' });
      }
    }

    // ✅ Update only within same company
    const result = await pool.query(
      `UPDATE users 
       SET name = $1, role = $2, department = $3, email = $4 
       WHERE id = $5 AND company_id = $6
       RETURNING id, name, role, department, email, created_at, company_id`,
      [name, role, department, email, id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    console.log('✅ Employee updated:', result.rows[0].email);

    res.json({ employee: result.rows[0] });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete employee (Admin only)
router.delete('/:id', checkPermission('delete'), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId; // ✅ Get from tenant middleware

    // Prevent deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // ✅ Delete only within same company
    const result = await pool.query(
      `DELETE FROM users 
       WHERE id = $1 AND company_id = $2 
       RETURNING id, email`,
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    console.log('✅ Employee deleted:', result.rows[0].email);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ADDITIONAL EMPLOYEE ENDPOINTS ====================

// Get employee count (for dashboard stats)
router.get('/stats/count', checkPermission('view_all'), async (req, res) => {
  try {
    const companyId = req.companyId;

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE role = 'admin') as admins,
        COUNT(*) FILTER (WHERE role = 'hr') as hr,
        COUNT(*) FILTER (WHERE role NOT IN ('admin', 'hr')) as staff
       FROM users 
       WHERE company_id = $1`,
      [companyId]
    );

    res.json({
      total: parseInt(result.rows[0].total),
      admins: parseInt(result.rows[0].admins),
      hr: parseInt(result.rows[0].hr),
      staff: parseInt(result.rows[0].staff)
    });
  } catch (error) {
    console.error('Get employee count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get employees by department
router.get('/department/:department', checkPermission('view_all'), async (req, res) => {
  try {
    const { department } = req.params;
    const companyId = req.companyId;

    const result = await pool.query(
      `SELECT id, name, role, department, email, created_at
       FROM users 
       WHERE company_id = $1 AND department = $2
       ORDER BY name ASC`,
      [companyId, department]
    );

    res.json({ employees: result.rows });
  } catch (error) {
    console.error('Get employees by department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search employees (by name or email)
router.get('/search/:query', checkPermission('view_all'), async (req, res) => {
  try {
    const { query } = req.params;
    const companyId = req.companyId;

    const result = await pool.query(
      `SELECT id, name, role, department, email, created_at
       FROM users 
       WHERE company_id = $1 
         AND (
           name ILIKE $2 
           OR email ILIKE $2
         )
       ORDER BY name ASC
       LIMIT 50`,
      [companyId, `%${query}%`]
    );

    res.json({ employees: result.rows });
  } catch (error) {
    console.error('Search employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;