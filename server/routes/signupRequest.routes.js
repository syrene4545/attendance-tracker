// // server/routes/signupRequest.routes.js
// import express from 'express';
// import bcrypt from 'bcryptjs';
// import { pool } from '../index.js';
// import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';
// import { verifyTenantAccess } from '../middleware/tenantMiddleware.js';
// import { body, validationResult } from 'express-validator';

// const router = express.Router();

// // ==================== SIGNUP REQUEST ROUTES ====================

// // Submit signup request (public - no auth required)
// // ✅ Requires company_id or subdomain to associate request with company
// router.post(
//   '/request',
//   body('email').isEmail().normalizeEmail(),
//   body('name').trim().notEmpty(),
//   body('requestedRole').isIn(['pharmacist', 'assistant']), // Can't request admin/hr roles
//   body('department').trim().notEmpty(),
//   body('companyId').optional().isInt(),
//   body('companySubdomain').optional().trim(),
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ 
//           error: 'Invalid input', 
//           details: errors.array() 
//         });
//       }

//       const { email, name, requestedRole, department, reason, companyId, companySubdomain } = req.body;

//       // ✅ Determine company from companyId or subdomain
//       let targetCompanyId = companyId;

//       if (!targetCompanyId && companySubdomain) {
//         const companyResult = await pool.query(
//           'SELECT id FROM companies WHERE subdomain = $1 AND is_active = true',
//           [companySubdomain]
//         );

//         if (companyResult.rows.length === 0) {
//           return res.status(404).json({ error: 'Company not found' });
//         }

//         targetCompanyId = companyResult.rows[0].id;
//       }

//       if (!targetCompanyId) {
//         return res.status(400).json({ 
//           error: 'Company information is required. Please provide companyId or companySubdomain.' 
//         });
//       }

//       console.log('📝 Signup request for company:', targetCompanyId, 'email:', email);

//       // ✅ Check if user already exists in this company
//       const existingUser = await pool.query(
//         'SELECT id FROM users WHERE email = $1 AND company_id = $2',
//         [email, targetCompanyId]
//       );

//       if (existingUser.rows.length > 0) {
//         return res.status(400).json({ 
//           error: 'An account with this email already exists in this company' 
//         });
//       }

//       // ✅ Check if there's already a pending request for this company
//       const existingRequest = await pool.query(
//         `SELECT id FROM signup_requests 
//          WHERE email = $1 AND status = 'pending' AND company_id = $2`,
//         [email, targetCompanyId]
//       );

//       if (existingRequest.rows.length > 0) {
//         return res.status(400).json({ 
//           error: 'A signup request with this email is already pending for this company' 
//         });
//       }

//       // ✅ Create signup request with company_id
//       await pool.query(
//         `INSERT INTO signup_requests 
//          (email, name, requested_role, department, reason, status, company_id) 
//          VALUES ($1, $2, $3, $4, $5, 'pending', $6)`,
//         [email, name, requestedRole, department, reason || null, targetCompanyId]
//       );

//       console.log('✅ Signup request created for company:', targetCompanyId);

//       res.status(201).json({ 
//         message: 'Signup request submitted successfully. An administrator will review your request.' 
//       });
//     } catch (error) {
//       console.error('❌ Signup request error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Get all signup requests (Admin/HR only)
// router.get(
//   '/requests',
//   authenticateToken,
//   verifyTenantAccess,
//   checkPermission('manage_users'),
//   async (req, res) => {
//     try {
//       const companyId = req.companyId;
      
//       // ✅ Filter by company
//       const result = await pool.query(
//         `SELECT 
//            sr.id,
//            sr.email,
//            sr.name,
//            sr.requested_role as "requestedRole",
//            sr.department,
//            sr.reason,
//            sr.status,
//            sr.requested_at as "requestedAt",
//            sr.processed_at as "processedAt",
//            sr.processed_by as "processedBy",
//            sr.notes,
//            admin.name as "processedByName"
//          FROM signup_requests sr
//          LEFT JOIN users admin ON sr.processed_by = admin.id AND admin.company_id = $1
//          WHERE sr.company_id = $1
//          ORDER BY 
//            CASE WHEN sr.status = 'pending' THEN 0 ELSE 1 END,
//            sr.requested_at DESC`,
//         [companyId]
//       );

//       res.json({ requests: result.rows });
//     } catch (error) {
//       console.error('❌ Get signup requests error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Get single signup request (Admin/HR only)
// router.get(
//   '/requests/:id',
//   authenticateToken,
//   verifyTenantAccess,
//   checkPermission('manage_users'),
//   async (req, res) => {
//     try {
//       const { id } = req.params;
//       const companyId = req.companyId;
      
//       // ✅ Filter by company
//       const result = await pool.query(
//         `SELECT 
//            sr.id,
//            sr.email,
//            sr.name,
//            sr.requested_role as "requestedRole",
//            sr.department,
//            sr.reason,
//            sr.status,
//            sr.requested_at as "requestedAt",
//            sr.processed_at as "processedAt",
//            sr.processed_by as "processedBy",
//            sr.notes,
//            admin.name as "processedByName",
//            admin.email as "processedByEmail"
//          FROM signup_requests sr
//          LEFT JOIN users admin ON sr.processed_by = admin.id AND admin.company_id = $2
//          WHERE sr.id = $1 AND sr.company_id = $2`,
//         [id, companyId]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({ error: 'Signup request not found' });
//       }

//       res.json({ request: result.rows[0] });
//     } catch (error) {
//       console.error('❌ Get signup request error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Approve signup request (Admin/HR only)
// router.post(
//   '/approve/:id',
//   authenticateToken,
//   verifyTenantAccess,
//   checkPermission('manage_users'),
//   body('password').isLength({ min: 6 }),
//   body('role').optional().isIn(['admin', 'hr', 'pharmacist', 'assistant']),
//   body('departmentId').optional().isInt(),
//   body('jobPositionId').optional().isInt(),
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ 
//           error: 'Password must be at least 6 characters' 
//         });
//       }

//       const { id } = req.params;
//       const companyId = req.companyId;
//       const { password, role, departmentId, jobPositionId, notes } = req.body;

//       // ✅ Get the signup request (verify company)
//       const requestResult = await pool.query(
//         `SELECT * FROM signup_requests WHERE id = $1 AND company_id = $2`,
//         [id, companyId]
//       );

//       if (requestResult.rows.length === 0) {
//         return res.status(404).json({ error: 'Signup request not found' });
//       }

//       const request = requestResult.rows[0];

//       if (request.status !== 'pending') {
//         return res.status(400).json({ error: 'This request has already been processed' });
//       }

//       // ✅ Check if email is still available in this company
//       const existingUser = await pool.query(
//         'SELECT id FROM users WHERE email = $1 AND company_id = $2',
//         [request.email, companyId]
//       );

//       if (existingUser.rows.length > 0) {
//         return res.status(400).json({ 
//           error: 'An account with this email already exists in this company' 
//         });
//       }

//       // ✅ Validate department exists in same company (if provided)
//       if (departmentId) {
//         const deptCheck = await pool.query(
//           'SELECT id FROM departments WHERE id = $1 AND company_id = $2',
//           [departmentId, companyId]
//         );

//         if (deptCheck.rows.length === 0) {
//           return res.status(400).json({ error: 'Department not found' });
//         }
//       }

//       // ✅ Validate job position exists in same company (if provided)
//       if (jobPositionId) {
//         const posCheck = await pool.query(
//           'SELECT id FROM job_positions WHERE id = $1 AND company_id = $2',
//           [jobPositionId, companyId]
//         );

//         if (posCheck.rows.length === 0) {
//           return res.status(400).json({ error: 'Job position not found' });
//         }
//       }

//       // Hash password
//       const hashedPassword = await bcrypt.hash(password, 10);

//       // Begin transaction
//       await pool.query('BEGIN');

//       try {
//         // ✅ Create user account with company_id
//         const finalRole = role || request.requested_role;
//         const userResult = await pool.query(
//           `INSERT INTO users (email, password, name, role, department, company_id) 
//            VALUES ($1, $2, $3, $4, $5, $6)
//            RETURNING id`,
//           [request.email, hashedPassword, request.name, finalRole, departmentId || null, companyId]
//         );

//         const userId = userResult.rows[0].id;

//         // ✅ Create employee profile with company_id
//         await pool.query(
//           `INSERT INTO employee_profiles (
//             user_id, first_name, last_name, department_id, job_position_id,
//             employment_status, employment_type, company_id
//           )
//           VALUES ($1, $2, $3, $4, $5, 'active', 'full-time', $6)`,
//           [
//             userId,
//             request.name.split(' ')[0], // First name
//             request.name.split(' ').slice(1).join(' ') || request.name.split(' ')[0], // Last name
//             departmentId || null,
//             jobPositionId || null,
//             companyId
//           ]
//         );

//         // ✅ Update request status (verify company)
//         await pool.query(
//           `UPDATE signup_requests 
//            SET status = 'approved', 
//                processed_at = NOW(), 
//                processed_by = $1,
//                notes = $2
//            WHERE id = $3 AND company_id = $4`,
//           [req.user.id, notes || 'Account created successfully', id, companyId]
//         );

//         await pool.query('COMMIT');

//         console.log('✅ Signup request approved, user created:', userId, 'company:', companyId);

//         res.json({ 
//           message: 'Signup request approved and account created successfully',
//           account: {
//             id: userId,
//             email: request.email,
//             name: request.name,
//             role: finalRole
//           }
//         });
//       } catch (error) {
//         await pool.query('ROLLBACK');
//         throw error;
//       }
//     } catch (error) {
//       console.error('❌ Approve signup request error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Reject signup request (Admin/HR only)
// router.post(
//   '/reject/:id',
//   authenticateToken,
//   verifyTenantAccess,
//   checkPermission('manage_users'),
//   body('notes').optional().trim(),
//   async (req, res) => {
//     try {
//       const { id } = req.params;
//       const companyId = req.companyId;
//       const { notes } = req.body;

//       // ✅ Filter by company
//       const result = await pool.query(
//         `UPDATE signup_requests 
//          SET status = 'rejected', 
//              processed_at = NOW(), 
//              processed_by = $1,
//              notes = $2
//          WHERE id = $3 AND status = 'pending' AND company_id = $4
//          RETURNING id`,
//         [req.user.id, notes || 'Request rejected', id, companyId]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({ error: 'Request not found or already processed' });
//       }

//       console.log('✅ Signup request rejected:', id);

//       res.json({ message: 'Signup request rejected' });
//     } catch (error) {
//       console.error('❌ Reject signup request error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Cancel own signup request (public - requires email verification)
// router.post(
//   '/cancel',
//   body('email').isEmail().normalizeEmail(),
//   body('requestId').isInt(),
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ error: 'Invalid input' });
//       }

//       const { email, requestId } = req.body;

//       // ✅ Cancel request (verify email matches and is pending)
//       const result = await pool.query(
//         `UPDATE signup_requests
//          SET status = 'cancelled',
//              notes = 'Cancelled by requester',
//              processed_at = NOW()
//          WHERE id = $1 
//            AND email = $2 
//            AND status = 'pending'
//          RETURNING id, company_id`,
//         [requestId, email]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({ 
//           error: 'Request not found or cannot be cancelled' 
//         });
//       }

//       console.log('✅ Signup request cancelled by user:', email, 'company:', result.rows[0].company_id);

//       res.json({ message: 'Signup request cancelled successfully' });
//     } catch (error) {
//       console.error('❌ Cancel signup request error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Get signup request statistics (Admin/HR only)
// router.get(
//   '/stats',
//   authenticateToken,
//   verifyTenantAccess,
//   checkPermission('manage_users'),
//   async (req, res) => {
//     try {
//       const companyId = req.companyId;
//       const { year } = req.query;
//       const currentYear = year || new Date().getFullYear();

//       // ✅ Get statistics (scoped to company)
//       const stats = await pool.query(
//         `SELECT 
//           COUNT(*) FILTER (WHERE status = 'pending') as "pendingCount",
//           COUNT(*) FILTER (WHERE status = 'approved') as "approvedCount",
//           COUNT(*) FILTER (WHERE status = 'rejected') as "rejectedCount",
//           COUNT(*) FILTER (WHERE status = 'cancelled') as "cancelledCount",
//           COUNT(*) as "totalCount",
//           COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM requested_at) = $2) as "yearCount"
//         FROM signup_requests
//         WHERE company_id = $1`,
//         [companyId, currentYear]
//       );

//       // ✅ Get monthly breakdown (scoped to company)
//       const monthly = await pool.query(
//         `SELECT 
//           TO_CHAR(requested_at, 'YYYY-MM') as month,
//           COUNT(*) as count,
//           COUNT(*) FILTER (WHERE status = 'approved') as approved,
//           COUNT(*) FILTER (WHERE status = 'rejected') as rejected
//         FROM signup_requests
//         WHERE company_id = $1 
//           AND EXTRACT(YEAR FROM requested_at) = $2
//         GROUP BY TO_CHAR(requested_at, 'YYYY-MM')
//         ORDER BY month DESC`,
//         [companyId, currentYear]
//       );

//       res.json({
//         statistics: stats.rows[0],
//         monthlyBreakdown: monthly.rows,
//         year: currentYear
//       });
//     } catch (error) {
//       console.error('❌ Get signup request stats error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// export default router;

// server/routes/signupRequest.routes.js
import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../index.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';
import { extractTenant, verifyTenantAccess } from '../middleware/tenantMiddleware.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// ==================== SIGNUP REQUEST ROUTES ====================

// Submit signup request (public - no auth required)
// ✅ Requires company_id or subdomain to associate request with company
router.post(
  '/request',
  body('email').isEmail().normalizeEmail(),
  body('name').trim().notEmpty(),
  body('requestedRole').isIn(['pharmacist', 'assistant']), // Can't request admin/hr roles
  body('department').trim().notEmpty(),
  body('companyId').optional().isInt(),
  body('companySubdomain').optional().trim(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: errors.array() 
        });
      }

      const { email, name, requestedRole, department, reason, companyId, companySubdomain } = req.body;

      // Determine company from companyId or subdomain
      let targetCompanyId = companyId;

      if (!targetCompanyId && companySubdomain) {
        const companyResult = await pool.query(
          'SELECT id FROM companies WHERE subdomain = $1 AND is_active = true',
          [companySubdomain]
        );

        if (companyResult.rows.length === 0) {
          return res.status(404).json({ error: 'Company not found' });
        }

        targetCompanyId = companyResult.rows[0].id;
      }

      if (!targetCompanyId) {
        return res.status(400).json({ 
          error: 'Company information is required. Please provide companyId or companySubdomain.' 
        });
      }

      console.log('📝 Signup request for company:', targetCompanyId, 'email:', email);

      // Check if user already exists in this company
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND company_id = $2',
        [email, targetCompanyId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ 
          error: 'An account with this email already exists in this company' 
        });
      }

      // Check if there's already a pending request for this company
      const existingRequest = await pool.query(
        `SELECT id FROM signup_requests 
         WHERE email = $1 AND status = 'pending' AND company_id = $2`,
        [email, targetCompanyId]
      );

      if (existingRequest.rows.length > 0) {
        return res.status(400).json({ 
          error: 'A signup request with this email is already pending for this company' 
        });
      }

      // Create signup request with company_id
      await pool.query(
        `INSERT INTO signup_requests 
         (email, name, requested_role, department, reason, status, company_id) 
         VALUES ($1, $2, $3, $4, $5, 'pending', $6)`,
        [email, name, requestedRole, department, reason || null, targetCompanyId]
      );

      console.log('✅ Signup request created for company:', targetCompanyId);

      res.status(201).json({ 
        message: 'Signup request submitted successfully. An administrator will review your request.' 
      });
    } catch (error) {
      console.error('❌ Signup request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Cancel own signup request (public - requires email verification)
router.post(
  '/cancel',
  body('email').isEmail().normalizeEmail(),
  body('requestId').isInt(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input' });
      }

      const { email, requestId } = req.body;

      // Cancel request (verify email matches and is pending)
      const result = await pool.query(
        `UPDATE signup_requests
         SET status = 'cancelled',
             notes = 'Cancelled by requester',
             processed_at = NOW()
         WHERE id = $1 
           AND email = $2 
           AND status = 'pending'
         RETURNING id, company_id`,
        [requestId, email]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          error: 'Request not found or cannot be cancelled' 
        });
      }

      console.log('✅ Signup request cancelled by user:', email, 'company:', result.rows[0].company_id);

      res.json({ message: 'Signup request cancelled successfully' });
    } catch (error) {
      console.error('❌ Cancel signup request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ==================== PROTECTED ROUTES (REQUIRE AUTHENTICATION) ====================

// Apply authentication middleware to all routes below this point
router.use(protect);           // 1️⃣ Authenticate user
router.use(extractTenant);     // 2️⃣ Extract tenant context
router.use(verifyTenantAccess); // 3️⃣ Verify tenant access

// Get signup request statistics (Admin/HR only) - MUST BE BEFORE /requests/:id
router.get(
  '/stats',
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const companyId = req.companyId;
      const { year } = req.query;
      const currentYear = year || new Date().getFullYear();

      // Get statistics (scoped to company)
      const stats = await pool.query(
        `SELECT 
          COUNT(*) FILTER (WHERE status = 'pending') as "pendingCount",
          COUNT(*) FILTER (WHERE status = 'approved') as "approvedCount",
          COUNT(*) FILTER (WHERE status = 'rejected') as "rejectedCount",
          COUNT(*) FILTER (WHERE status = 'cancelled') as "cancelledCount",
          COUNT(*) as "totalCount",
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM requested_at) = $2) as "yearCount"
        FROM signup_requests
        WHERE company_id = $1`,
        [companyId, currentYear]
      );

      // Get monthly breakdown (scoped to company)
      const monthly = await pool.query(
        `SELECT 
          TO_CHAR(requested_at, 'YYYY-MM') as month,
          COUNT(*) as count,
          COUNT(*) FILTER (WHERE status = 'approved') as approved,
          COUNT(*) FILTER (WHERE status = 'rejected') as rejected
        FROM signup_requests
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
      console.error('❌ Get signup request stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get all signup requests (Admin/HR only)
router.get(
  '/requests',
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const companyId = req.companyId;
      
      // Filter by company
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
         LEFT JOIN users admin ON sr.processed_by = admin.id AND admin.company_id = $1
         WHERE sr.company_id = $1
         ORDER BY 
           CASE WHEN sr.status = 'pending' THEN 0 ELSE 1 END,
           sr.requested_at DESC`,
        [companyId]
      );

      res.json({ requests: result.rows });
    } catch (error) {
      console.error('❌ Get signup requests error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get single signup request (Admin/HR only)
router.get(
  '/requests/:id',
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.companyId;
      
      // Filter by company
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
           admin.name as "processedByName",
           admin.email as "processedByEmail"
         FROM signup_requests sr
         LEFT JOIN users admin ON sr.processed_by = admin.id AND admin.company_id = $2
         WHERE sr.id = $1 AND sr.company_id = $2`,
        [id, companyId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Signup request not found' });
      }

      res.json({ request: result.rows[0] });
    } catch (error) {
      console.error('❌ Get signup request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Approve signup request (Admin/HR only)
router.post(
  '/approve/:id',
  checkPermission('manage_users'),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['admin', 'hr', 'pharmacist', 'assistant']),
  body('departmentId').optional().isInt(),
  body('jobPositionId').optional().isInt(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Password must be at least 6 characters' 
        });
      }

      const { id } = req.params;
      const companyId = req.companyId;
      const { password, role, departmentId, jobPositionId, notes } = req.body;

      // Get the signup request (verify company)
      const requestResult = await pool.query(
        `SELECT * FROM signup_requests WHERE id = $1 AND company_id = $2`,
        [id, companyId]
      );

      if (requestResult.rows.length === 0) {
        return res.status(404).json({ error: 'Signup request not found' });
      }

      const request = requestResult.rows[0];

      if (request.status !== 'pending') {
        return res.status(400).json({ error: 'This request has already been processed' });
      }

      // Check if email is still available in this company
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND company_id = $2',
        [request.email, companyId]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ 
          error: 'An account with this email already exists in this company' 
        });
      }

      // Validate department exists in same company (if provided)
      if (departmentId) {
        const deptCheck = await pool.query(
          'SELECT id FROM departments WHERE id = $1 AND company_id = $2',
          [departmentId, companyId]
        );

        if (deptCheck.rows.length === 0) {
          return res.status(400).json({ error: 'Department not found' });
        }
      }

      // Validate job position exists in same company (if provided)
      if (jobPositionId) {
        const posCheck = await pool.query(
          'SELECT id FROM job_positions WHERE id = $1 AND company_id = $2',
          [jobPositionId, companyId]
        );

        if (posCheck.rows.length === 0) {
          return res.status(400).json({ error: 'Job position not found' });
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Begin transaction
      await pool.query('BEGIN');

      try {
        // Create user account with company_id
        const finalRole = role || request.requested_role;
        const userResult = await pool.query(
          `INSERT INTO users (
            email, password, name, role, 
            department_id, job_position_id, 
            employment_status, employment_type,
            company_id
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, 'active', 'full-time', $7)
          RETURNING id`,
          [
            request.email, 
            hashedPassword, 
            request.name, 
            finalRole, 
            departmentId || null,
            jobPositionId || null,
            companyId
          ]
        );

        const userId = userResult.rows[0].id;

        // Update request status (verify company)
        await pool.query(
          `UPDATE signup_requests 
           SET status = 'approved', 
               processed_at = NOW(), 
               processed_by = $1,
               notes = $2
           WHERE id = $3 AND company_id = $4`,
          [req.user.id, notes || 'Account created successfully', id, companyId]
        );

        await pool.query('COMMIT');

        console.log('✅ Signup request approved, user created:', userId, 'company:', companyId);

        res.json({ 
          message: 'Signup request approved and account created successfully',
          account: {
            id: userId,
            email: request.email,
            name: request.name,
            role: finalRole
          }
        });
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('❌ Approve signup request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Reject signup request (Admin/HR only)
router.post(
  '/reject/:id',
  checkPermission('manage_users'),
  body('notes').optional().trim(),
  async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.companyId;
      const { notes } = req.body;

      // Filter by company
      const result = await pool.query(
        `UPDATE signup_requests 
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

      console.log('✅ Signup request rejected:', id);

      res.json({ message: 'Signup request rejected' });
    } catch (error) {
      console.error('❌ Reject signup request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;