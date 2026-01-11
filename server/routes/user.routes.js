// import express from 'express';
// import { pool } from '../index.js';
// import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';
// import { verifyTenantAccess } from '../middleware/tenantMiddleware.js';

// const router = express.Router();

// // ===============================
// // GET CURRENT LOGGED-IN USER
// // GET /api/users/me
// // ===============================
// router.get('/me', authenticateToken, async (req, res) => {
//   try {
//     const user = await pool.query(
//       `SELECT id, email, name, role, department, created_at 
//        FROM users 
//        WHERE id = $1`,
//       [req.user.id]
//     );

//     if (user.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.json({ user: user.rows[0] });
//   } catch (error) {
//     console.error('Get me error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // ===============================
// // GET ALL USERS (ADMIN / HR)
// // ===============================
// router.get('/', authenticateToken, checkPermission('view_all'), async (req, res) => {
//   try {
//     const users = await pool.query(
//       `SELECT id, email, name, role, department, created_at
//        FROM users
//        ORDER BY name ASC`
//     );

//     res.json({ users: users.rows });
//   } catch (error) {
//     console.error('Get users error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // ===============================
// // GET USER BY ID
// // - user can only view themselves
// // - admin/hr can view anyone
// // ===============================
// router.get('/:id', authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.params;

//     // If user is not admin/hr, must match their own ID
//     if (req.user.id !== parseInt(id)) {
//       const role = req.user.role;
//       if (!['admin', 'hr'].includes(role)) {
//         return res.status(403).json({ error: 'Insufficient permissions' });
//       }
//     }

//     const user = await pool.query(
//       `SELECT id, email, name, role, department, created_at 
//        FROM users 
//        WHERE id = $1`,
//       [id]
//     );

//     if (user.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.json({ user: user.rows[0] });
//   } catch (error) {
//     console.error('Get user error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // ===============================
// // UPDATE USER (ADMIN / HR ONLY)
// // ===============================
// router.put('/:id', authenticateToken, checkPermission('manage_users'), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, role, department } = req.body;

//     const updated = await pool.query(
//       `UPDATE users
//        SET name = $1, role = $2, department = $3
//        WHERE id = $4
//        RETURNING id, email, name, role, department, created_at`,
//       [name, role, department, id]
//     );

//     if (updated.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.json({ user: updated.rows[0] });
//   } catch (error) {
//     console.error('Update user error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // ===============================
// // DELETE USER (ADMIN ONLY)
// // ===============================
// router.delete('/:id', authenticateToken, checkPermission('delete'), async (req, res) => {
//   try {
//     const { id } = req.params;

//     const deleted = await pool.query(
//       `DELETE FROM users 
//        WHERE id = $1
//        RETURNING id`,
//       [id]
//     );

//     if (deleted.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.json({ message: 'User deleted successfully' });
//   } catch (error) {
//     console.error('Delete user error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// export default router;

// import express from 'express';
// import { pool } from '../index.js';
// import { authenticateToken } from '../middleware/permissionMiddleware.js';
// import { verifyTenantAccess } from '../middleware/tenantMiddleware.js'; // ✅ Add this

// const router = express.Router();

// // ✅ Apply tenant verification to all routes
// router.use(authenticateToken);
// router.use(verifyTenantAccess);

// // Get all users (filtered by company)
// router.get('/', async (req, res) => {
//   try {
//     console.log(`📊 Fetching users for company_id: ${req.companyId}`);
    
//     const result = await pool.query(
//       `SELECT id, name, email, role 
//        FROM users 
//        WHERE company_id = $1  -- ✅ Filter by company
//        ORDER BY name ASC`,
//       [req.companyId]
//     );

//     console.log(`✅ Found ${result.rows.length} users`);
//     res.json(result.rows);
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get single user (filtered by company)
// router.get('/:id', async (req, res) => {
//   try {
//     const result = await pool.query(
//       `SELECT id, name, email, role, company_id
//        FROM users 
//        WHERE id = $1 AND company_id = $2`, // ✅ Filter by company
//       [req.params.id, req.companyId]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error('Error fetching user:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// export default router;

import express from 'express';
import { pool } from '../index.js';
import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';
import { verifyTenantAccess } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// ✅ Apply tenant verification to all routes
router.use(authenticateToken);
router.use(verifyTenantAccess);

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
      [req.user.id, req.companyId] // ✅ Filter by company
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
// GET ALL USERS (filtered by company)
// ===============================
router.get('/', checkPermission('view_all'), async (req, res) => {
  try {
    console.log(`📊 Fetching users for company_id: ${req.companyId}`);
    
    const result = await pool.query(
      `SELECT id, name, email, role, department, created_at
       FROM users 
       WHERE company_id = $1
       ORDER BY name ASC`,
      [req.companyId] // ✅ Filter by company
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
// - user can view themselves
// - admin/hr can view anyone in their company
// ===============================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // If user is not admin/hr, must match their own ID
    if (req.user.id !== parseInt(id)) {
      const role = req.user.role;
      if (!['admin', 'hr'].includes(role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }

    // ✅ Filter by company
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
// UPDATE USER (ADMIN / HR ONLY)
// ===============================
router.put('/:id', checkPermission('manage_users'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, department } = req.body;

    // ✅ Update only within same company
    const updated = await pool.query(
      `UPDATE users
       SET name = $1, role = $2, department = $3
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
// DELETE USER (ADMIN ONLY)
// ===============================
router.delete('/:id', checkPermission('delete'), async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // ✅ Delete only within same company
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