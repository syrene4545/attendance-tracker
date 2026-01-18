// // server/routes/sop.routes.js

// import express from 'express';
// import { pool } from '../index.js';
// import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';
// import { verifyTenantAccess } from '../middleware/tenantMiddleware.js';
// import { body, validationResult } from 'express-validator';

// const router = express.Router();

// // ✅ Apply authentication and tenant verification to all routes
// router.use(authenticateToken);
// router.use(verifyTenantAccess);

// // ==================== SOP ROUTES ====================

// // Get all SOPs for the company
// router.get('/', async (req, res) => {
//   try {
//     const companyId = req.companyId;
//     const { category, status } = req.query;
    
//     let query = `
//       SELECT 
//         s.id,
//         s.title,
//         s.category,
//         s.description,
//         s.content,
//         s.version,
//         s.status,
//         s.effective_date as "effectiveDate",
//         s.review_date as "reviewDate",
//         s.created_by as "createdBy",
//         creator.name as "createdByName",
//         s.created_at as "createdAt",
//         s.updated_at as "updatedAt",
//         COUNT(DISTINCT sa.id) as "acknowledgmentCount",
//         COUNT(DISTINCT sa.id) FILTER (WHERE sa.acknowledged = true) as "acknowledgedCount"
//       FROM sops s
//       LEFT JOIN users creator ON s.created_by = creator.id AND creator.company_id = $1
//       LEFT JOIN sop_acknowledgments sa ON sa.sop_id = s.id AND sa.company_id = $1
//       WHERE s.company_id = $1
//     `;
    
//     const params = [companyId];
//     let paramIndex = 2;
    
//     if (category) {
//       query += ` AND s.category = $${paramIndex}`;
//       params.push(category);
//       paramIndex++;
//     }
    
//     if (status) {
//       query += ` AND s.status = $${paramIndex}`;
//       params.push(status);
//       paramIndex++;
//     }
    
//     query += `
//       GROUP BY s.id, creator.name
//       ORDER BY s.created_at DESC
//     `;
    
//     const result = await pool.query(query, params);
    
//     res.json({ sops: result.rows });
//   } catch (error) {
//     console.error('❌ Get SOPs error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get single SOP
// router.get('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const companyId = req.companyId;
    
//     // ✅ Get SOP (filter by company)
//     const sopResult = await pool.query(
//       `SELECT 
//         s.*,
//         s.created_by as "createdBy",
//         s.effective_date as "effectiveDate",
//         s.review_date as "reviewDate",
//         s.created_at as "createdAt",
//         s.updated_at as "updatedAt",
//         creator.name as "createdByName",
//         creator.email as "createdByEmail"
//       FROM sops s
//       LEFT JOIN users creator ON s.created_by = creator.id AND creator.company_id = $2
//       WHERE s.id = $1 AND s.company_id = $2`,
//       [id, companyId]
//     );
    
//     if (sopResult.rows.length === 0) {
//       return res.status(404).json({ error: 'SOP not found' });
//     }
    
//     const sop = sopResult.rows[0];
    
//     // ✅ Get acknowledgments (filter by company)
//     const acknowledgementsResult = await pool.query(
//       `SELECT 
//         sa.id,
//         sa.user_id as "userId",
//         u.name as "userName",
//         u.email as "userEmail",
//         ep.employee_number as "employeeNumber",
//         d.name as "departmentName",
//         sa.acknowledged,
//         sa.acknowledged_at as "acknowledgedAt",
//         sa.notes
//       FROM sop_acknowledgments sa
//       JOIN users u ON sa.user_id = u.id
//       LEFT JOIN employee_profiles ep ON ep.user_id = u.id AND ep.company_id = $2
//       LEFT JOIN departments d ON ep.department_id = d.id AND d.company_id = $2
//       WHERE sa.sop_id = $1 AND sa.company_id = $2
//       ORDER BY sa.acknowledged DESC, u.name ASC`,
//       [id, companyId]
//     );
    
//     sop.acknowledgements = acknowledgementsResult.rows;
    
//     res.json({ sop });
//   } catch (error) {
//     console.error('❌ Get SOP error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Create new SOP
// router.post(
//   '/',
//   checkPermission('manage_users'),
//   body('title').trim().notEmpty().withMessage('Title is required'),
//   body('category').isIn(['policy', 'procedure', 'guideline', 'form']),
//   body('content').trim().notEmpty().withMessage('Content is required'),
//   body('effectiveDate').optional().isISO8601(),
//   body('reviewDate').optional().isISO8601(),
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ error: 'Invalid input', details: errors.array() });
//       }
      
//       const companyId = req.companyId;
//       const { 
//         title, 
//         category, 
//         description, 
//         content, 
//         effectiveDate, 
//         reviewDate,
//         requireAcknowledgment 
//       } = req.body;
      
//       // ✅ Check if title already exists in this company
//       const existingTitle = await pool.query(
//         'SELECT id FROM sops WHERE title = $1 AND company_id = $2',
//         [title, companyId]
//       );
      
//       if (existingTitle.rows.length > 0) {
//         return res.status(400).json({ error: 'SOP with this title already exists' });
//       }
      
//       // ✅ Create SOP with company_id
//       const result = await pool.query(
//         `INSERT INTO sops (
//           title, category, description, content, version, status,
//           effective_date, review_date, created_by, company_id
//         )
//         VALUES ($1, $2, $3, $4, '1.0', 'draft', $5, $6, $7, $8)
//         RETURNING 
//           id,
//           title,
//           category,
//           description,
//           content,
//           version,
//           status,
//           effective_date as "effectiveDate",
//           review_date as "reviewDate",
//           created_at as "createdAt"`,
//         [
//           title,
//           category,
//           description || null,
//           content,
//           effectiveDate || null,
//           reviewDate || null,
//           req.user.id,
//           companyId
//         ]
//       );
      
//       const sop = result.rows[0];
      
//       // ✅ Create acknowledgment records for all active employees in company (if required)
//       if (requireAcknowledgment) {
//         await pool.query(
//           `INSERT INTO sop_acknowledgments (sop_id, user_id, company_id)
//            SELECT $1, u.id, $3
//            FROM users u
//            JOIN employee_profiles ep ON ep.user_id = u.id
//            WHERE ep.employment_status = 'active' 
//              AND u.company_id = $3
//              AND ep.company_id = $3`,
//           [sop.id, companyId, companyId]
//         );
//       }
      
//       console.log('✅ SOP created:', sop.title, 'for company:', companyId);
      
//       res.status(201).json({
//         message: 'SOP created successfully',
//         sop
//       });
//     } catch (error) {
//       console.error('❌ Create SOP error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Update SOP
// router.put(
//   '/:id',
//   checkPermission('manage_users'),
//   body('title').optional().trim().notEmpty(),
//   body('category').optional().isIn(['policy', 'procedure', 'guideline', 'form']),
//   body('content').optional().trim().notEmpty(),
//   body('status').optional().isIn(['draft', 'active', 'archived']),
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ error: 'Invalid input', details: errors.array() });
//       }
      
//       const { id } = req.params;
//       const companyId = req.companyId;
//       const { 
//         title, 
//         category, 
//         description, 
//         content, 
//         status,
//         effectiveDate,
//         reviewDate,
//         version
//       } = req.body;
      
//       // ✅ Check if SOP exists in company
//       const existingResult = await pool.query(
//         'SELECT id, title FROM sops WHERE id = $1 AND company_id = $2',
//         [id, companyId]
//       );
      
//       if (existingResult.rows.length === 0) {
//         return res.status(404).json({ error: 'SOP not found' });
//       }
      
//       // ✅ Check for duplicate title in company
//       if (title) {
//         const duplicateTitle = await pool.query(
//           'SELECT id FROM sops WHERE title = $1 AND id != $2 AND company_id = $3',
//           [title, id, companyId]
//         );
        
//         if (duplicateTitle.rows.length > 0) {
//           return res.status(400).json({ error: 'SOP with this title already exists' });
//         }
//       }
      
//       // Build update query
//       const updates = [];
//       const params = [];
//       let paramIndex = 1;
      
//       if (title !== undefined) {
//         updates.push(`title = $${paramIndex}`);
//         params.push(title);
//         paramIndex++;
//       }
      
//       if (category !== undefined) {
//         updates.push(`category = $${paramIndex}`);
//         params.push(category);
//         paramIndex++;
//       }
      
//       if (description !== undefined) {
//         updates.push(`description = $${paramIndex}`);
//         params.push(description);
//         paramIndex++;
//       }
      
//       if (content !== undefined) {
//         updates.push(`content = $${paramIndex}`);
//         params.push(content);
//         paramIndex++;
//       }
      
//       if (status !== undefined) {
//         updates.push(`status = $${paramIndex}`);
//         params.push(status);
//         paramIndex++;
//       }
      
//       if (effectiveDate !== undefined) {
//         updates.push(`effective_date = $${paramIndex}`);
//         params.push(effectiveDate);
//         paramIndex++;
//       }
      
//       if (reviewDate !== undefined) {
//         updates.push(`review_date = $${paramIndex}`);
//         params.push(reviewDate);
//         paramIndex++;
//       }
      
//       if (version !== undefined) {
//         updates.push(`version = $${paramIndex}`);
//         params.push(version);
//         paramIndex++;
//       }
      
//       if (updates.length === 0) {
//         return res.status(400).json({ error: 'No fields to update' });
//       }
      
//       updates.push(`updated_at = NOW()`);
      
//       params.push(id);
//       params.push(companyId);
      
//       const query = `
//         UPDATE sops
//         SET ${updates.join(', ')}
//         WHERE id = $${paramIndex} AND company_id = $${paramIndex + 1}
//         RETURNING *
//       `;
      
//       const result = await pool.query(query, params);
      
//       console.log('✅ SOP updated:', result.rows[0].title);
      
//       res.json({
//         message: 'SOP updated successfully',
//         sop: result.rows[0]
//       });
//     } catch (error) {
//       console.error('❌ Update SOP error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Delete SOP
// router.delete('/:id', checkPermission('manage_users'), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const companyId = req.companyId;
    
//     // ✅ Check if SOP exists in company
//     const sopResult = await pool.query(
//       'SELECT id, title FROM sops WHERE id = $1 AND company_id = $2',
//       [id, companyId]
//     );
    
//     if (sopResult.rows.length === 0) {
//       return res.status(404).json({ error: 'SOP not found' });
//     }
    
//     // ✅ Delete SOP (cascade will delete acknowledgments)
//     await pool.query(
//       'DELETE FROM sops WHERE id = $1 AND company_id = $2',
//       [id, companyId]
//     );
    
//     console.log('✅ SOP deleted:', sopResult.rows[0].title);
    
//     res.json({ message: 'SOP deleted successfully' });
//   } catch (error) {
//     console.error('❌ Delete SOP error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Publish SOP (make it active and send to all employees)
// router.post('/:id/publish', checkPermission('manage_users'), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const companyId = req.companyId;
    
//     // ✅ Check if SOP exists in company
//     const sopResult = await pool.query(
//       'SELECT id, title, status FROM sops WHERE id = $1 AND company_id = $2',
//       [id, companyId]
//     );
    
//     if (sopResult.rows.length === 0) {
//       return res.status(404).json({ error: 'SOP not found' });
//     }
    
//     const sop = sopResult.rows[0];
    
//     if (sop.status === 'active') {
//       return res.status(400).json({ error: 'SOP is already published' });
//     }
    
//     // Begin transaction
//     await pool.query('BEGIN');
    
//     try {
//       // Update SOP status to active
//       await pool.query(
//         `UPDATE sops 
//          SET status = 'active', 
//              effective_date = CURRENT_DATE,
//              updated_at = NOW()
//          WHERE id = $1 AND company_id = $2`,
//         [id, companyId]
//       );
      
//       // ✅ Create acknowledgment records for all active employees in company
//       await pool.query(
//         `INSERT INTO sop_acknowledgments (sop_id, user_id, company_id)
//          SELECT $1, u.id, $2
//          FROM users u
//          JOIN employee_profiles ep ON ep.user_id = u.id
//          WHERE ep.employment_status = 'active' 
//            AND u.company_id = $2
//            AND ep.company_id = $2
//          ON CONFLICT DO NOTHING`,
//         [id, companyId]
//       );
      
//       await pool.query('COMMIT');
      
//       console.log('✅ SOP published:', sop.title);
      
//       res.json({ message: 'SOP published successfully' });
//     } catch (error) {
//       await pool.query('ROLLBACK');
//       throw error;
//     }
//   } catch (error) {
//     console.error('❌ Publish SOP error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get user's pending acknowledgments
// router.get('/acknowledgments/pending', async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const companyId = req.companyId;
    
//     // ✅ Get pending acknowledgments for user in company
//     const result = await pool.query(
//       `SELECT 
//         sa.id as "acknowledgmentId",
//         s.id as "assessmentKey",
//         s.title,
//         s.category,
//         s.description,
//         s.effective_date as "effectiveDate",
//         sa.sent_at as "sentAt"
//       FROM sop_acknowledgments sa
//       JOIN sops s ON sa.sop_id = s.id
//       WHERE sa.user_id = $1 
//         AND sa.acknowledged = false
//         AND s.status = 'active'
//         AND sa.company_id = $2
//         AND s.company_id = $2
//       ORDER BY sa.sent_at DESC`,
//       [userId, companyId]
//     );
    
//     res.json({ pending: result.rows });
//   } catch (error) {
//     console.error('❌ Get pending acknowledgments error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Acknowledge SOP
// router.post('/acknowledgments/:id/acknowledge', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;
//     const companyId = req.companyId;
//     const { notes } = req.body;
    
//     // ✅ Update acknowledgment (verify company)
//     const result = await pool.query(
//       `UPDATE sop_acknowledgments
//        SET acknowledged = true,
//            acknowledged_at = NOW(),
//            notes = $1
//        WHERE id = $2 
//          AND user_id = $3 
//          AND company_id = $4
//        RETURNING id`,
//       [notes || null, id, userId, companyId]
//     );
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Acknowledgment not found' });
//     }
    
//     console.log('✅ SOP acknowledged by user:', userId);
    
//     res.json({ message: 'SOP acknowledged successfully' });
//   } catch (error) {
//     console.error('❌ Acknowledge SOP error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get SOP categories for the company
// router.get('/categories/list', async (req, res) => {
//   try {
//     const companyId = req.companyId;
    
//     // ✅ Get categories used in this company
//     const result = await pool.query(
//       `SELECT 
//         category,
//         COUNT(*) as count
//       FROM sops
//       WHERE company_id = $1
//       GROUP BY category
//       ORDER BY category`,
//       [companyId]
//     );
    
//     res.json({ categories: result.rows });
//   } catch (error) {
//     console.error('❌ Get categories error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get SOP statistics for the company
// router.get('/stats/overview', checkPermission('view_analytics'), async (req, res) => {
//   try {
//     const companyId = req.companyId;
    
//     // ✅ Get stats for company
//     const stats = await pool.query(
//       `SELECT 
//         COUNT(*) FILTER (WHERE status = 'active') as "activeCount",
//         COUNT(*) FILTER (WHERE status = 'draft') as "draftCount",
//         COUNT(*) FILTER (WHERE status = 'archived') as "archivedCount",
//         COUNT(*) as "totalCount"
//       FROM sops
//       WHERE company_id = $1`,
//       [companyId]
//     );
    
//     // ✅ Get acknowledgment stats for company
//     const ackStats = await pool.query(
//       `SELECT 
//         COUNT(*) as "totalAcknowledgments",
//         COUNT(*) FILTER (WHERE acknowledged = true) as "completedAcknowledgments",
//         COUNT(DISTINCT user_id) as "usersWithAcknowledgments"
//       FROM sop_acknowledgments sa
//       JOIN sops s ON sa.sop_id = s.id
//       WHERE s.status = 'active' 
//         AND sa.company_id = $1
//         AND s.company_id = $1`,
//       [companyId]
//     );
    
//     res.json({
//       sops: stats.rows[0],
//       acknowledgments: ackStats.rows[0]
//     });
//   } catch (error) {
//     console.error('❌ Get SOP stats error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// export default router;

// server/routes/sop.routes.js

import express from 'express';
import { pool } from '../index.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';
import { extractTenant, verifyTenantAccess } from '../middleware/tenantMiddleware.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// ✅ Apply authentication and tenant extraction to ALL routes
router.use(protect);           // 1️⃣ Authenticate user
router.use(extractTenant);     // 2️⃣ Extract tenant context
router.use(verifyTenantAccess); // 3️⃣ Verify tenant access

// ==================== SOP ROUTES ====================

// Get SOP categories for the company - MUST BE BEFORE /:id
router.get('/categories/list', async (req, res) => {
  try {
    const companyId = req.companyId;
    
    // Get categories used in this company
    const result = await pool.query(
      `SELECT 
        category,
        COUNT(*) as count
      FROM sops
      WHERE company_id = $1
      GROUP BY category
      ORDER BY category`,
      [companyId]
    );
    
    res.json({ categories: result.rows });
  } catch (error) {
    console.error('❌ Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get SOP statistics for the company - MUST BE BEFORE /:id
router.get('/stats/overview', checkPermission('view_analytics'), async (req, res) => {
  try {
    const companyId = req.companyId;
    
    // Get stats for company
    const stats = await pool.query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'active') as "activeCount",
        COUNT(*) FILTER (WHERE status = 'draft') as "draftCount",
        COUNT(*) FILTER (WHERE status = 'archived') as "archivedCount",
        COUNT(*) as "totalCount"
      FROM sops
      WHERE company_id = $1`,
      [companyId]
    );
    
    // Get acknowledgment stats for company
    const ackStats = await pool.query(
      `SELECT 
        COUNT(*) as "totalAcknowledgments",
        COUNT(*) FILTER (WHERE acknowledged = true) as "completedAcknowledgments",
        COUNT(DISTINCT user_id) as "usersWithAcknowledgments"
      FROM sop_acknowledgments sa
      JOIN sops s ON sa.sop_id = s.id
      WHERE s.status = 'active' 
        AND sa.company_id = $1
        AND s.company_id = $1`,
      [companyId]
    );
    
    res.json({
      sops: stats.rows[0],
      acknowledgments: ackStats.rows[0]
    });
  } catch (error) {
    console.error('❌ Get SOP stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's pending acknowledgments - MUST BE BEFORE /:id
router.get('/acknowledgments/pending', async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = req.companyId;
    
    // Get pending acknowledgments for user in company
    const result = await pool.query(
      `SELECT 
        sa.id as "acknowledgmentId",
        s.id as "assessmentKey",
        s.title,
        s.category,
        s.description,
        s.effective_date as "effectiveDate",
        sa.sent_at as "sentAt"
      FROM sop_acknowledgments sa
      JOIN sops s ON sa.sop_id = s.id
      WHERE sa.user_id = $1 
        AND sa.acknowledged = false
        AND s.status = 'active'
        AND sa.company_id = $2
        AND s.company_id = $2
      ORDER BY sa.sent_at DESC`,
      [userId, companyId]
    );
    
    res.json({ pending: result.rows });
  } catch (error) {
    console.error('❌ Get pending acknowledgments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Acknowledge SOP - MUST BE BEFORE /:id
router.post('/acknowledgments/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const companyId = req.companyId;
    const { notes } = req.body;
    
    // Update acknowledgment (verify company)
    const result = await pool.query(
      `UPDATE sop_acknowledgments
       SET acknowledged = true,
           acknowledged_at = NOW(),
           notes = $1
       WHERE id = $2 
         AND user_id = $3 
         AND company_id = $4
       RETURNING id`,
      [notes || null, id, userId, companyId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Acknowledgment not found' });
    }
    
    console.log('✅ SOP acknowledged by user:', userId);
    
    res.json({ message: 'SOP acknowledged successfully' });
  } catch (error) {
    console.error('❌ Acknowledge SOP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all SOPs for the company
router.get('/', async (req, res) => {
  try {
    const companyId = req.companyId;
    const { category, status } = req.query;
    
    let query = `
      SELECT 
        s.id,
        s.title,
        s.category,
        s.description,
        s.content,
        s.version,
        s.status,
        s.effective_date as "effectiveDate",
        s.review_date as "reviewDate",
        s.created_by as "createdBy",
        creator.name as "createdByName",
        s.created_at as "createdAt",
        s.updated_at as "updatedAt",
        COUNT(DISTINCT sa.id) as "acknowledgmentCount",
        COUNT(DISTINCT sa.id) FILTER (WHERE sa.acknowledged = true) as "acknowledgedCount"
      FROM sops s
      LEFT JOIN users creator ON s.created_by = creator.id AND creator.company_id = $1
      LEFT JOIN sop_acknowledgments sa ON sa.sop_id = s.id AND sa.company_id = $1
      WHERE s.company_id = $1
    `;
    
    const params = [companyId];
    let paramIndex = 2;
    
    if (category) {
      query += ` AND s.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND s.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    query += `
      GROUP BY s.id, creator.name
      ORDER BY s.created_at DESC
    `;
    
    const result = await pool.query(query, params);
    
    res.json({ sops: result.rows });
  } catch (error) {
    console.error('❌ Get SOPs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single SOP
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;
    
    // Get SOP (filter by company)
    const sopResult = await pool.query(
      `SELECT 
        s.*,
        s.created_by as "createdBy",
        s.effective_date as "effectiveDate",
        s.review_date as "reviewDate",
        s.created_at as "createdAt",
        s.updated_at as "updatedAt",
        creator.name as "createdByName",
        creator.email as "createdByEmail"
      FROM sops s
      LEFT JOIN users creator ON s.created_by = creator.id AND creator.company_id = $2
      WHERE s.id = $1 AND s.company_id = $2`,
      [id, companyId]
    );
    
    if (sopResult.rows.length === 0) {
      return res.status(404).json({ error: 'SOP not found' });
    }
    
    const sop = sopResult.rows[0];
    
    // Get acknowledgments (filter by company)
    const acknowledgementsResult = await pool.query(
      `SELECT 
        sa.id,
        sa.user_id as "userId",
        u.name as "userName",
        u.email as "userEmail",
        u.employee_number as "employeeNumber",
        d.name as "departmentName",
        sa.acknowledged,
        sa.acknowledged_at as "acknowledgedAt",
        sa.notes
      FROM sop_acknowledgments sa
      JOIN users u ON sa.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id AND d.company_id = $2
      WHERE sa.sop_id = $1 AND sa.company_id = $2
      ORDER BY sa.acknowledged DESC, u.name ASC`,
      [id, companyId]
    );
    
    sop.acknowledgements = acknowledgementsResult.rows;
    
    res.json({ sop });
  } catch (error) {
    console.error('❌ Get SOP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new SOP
router.post(
  '/',
  checkPermission('manage_users'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').isIn(['policy', 'procedure', 'guideline', 'form']),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('effectiveDate').optional().isISO8601(),
  body('reviewDate').optional().isISO8601(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }
      
      const companyId = req.companyId;
      const { 
        title, 
        category, 
        description, 
        content, 
        effectiveDate, 
        reviewDate,
        requireAcknowledgment 
      } = req.body;
      
      // Check if title already exists in this company
      const existingTitle = await pool.query(
        'SELECT id FROM sops WHERE title = $1 AND company_id = $2',
        [title, companyId]
      );
      
      if (existingTitle.rows.length > 0) {
        return res.status(400).json({ error: 'SOP with this title already exists' });
      }
      
      // Create SOP with company_id
      const result = await pool.query(
        `INSERT INTO sops (
          title, category, description, content, version, status,
          effective_date, review_date, created_by, company_id
        )
        VALUES ($1, $2, $3, $4, '1.0', 'draft', $5, $6, $7, $8)
        RETURNING 
          id,
          title,
          category,
          description,
          content,
          version,
          status,
          effective_date as "effectiveDate",
          review_date as "reviewDate",
          created_at as "createdAt"`,
        [
          title,
          category,
          description || null,
          content,
          effectiveDate || null,
          reviewDate || null,
          req.user.id,
          companyId
        ]
      );
      
      const sop = result.rows[0];
      
      // Create acknowledgment records for all active employees in company (if required)
      if (requireAcknowledgment) {
        await pool.query(
          `INSERT INTO sop_acknowledgments (sop_id, user_id, company_id)
           SELECT $1, u.id, $2
           FROM users u
           WHERE u.employment_status = 'active' 
             AND u.company_id = $2`,
          [sop.id, companyId]
        );
      }
      
      console.log('✅ SOP created:', sop.title, 'for company:', companyId);
      
      res.status(201).json({
        message: 'SOP created successfully',
        sop
      });
    } catch (error) {
      console.error('❌ Create SOP error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Publish SOP (make it active and send to all employees)
router.post('/:id/publish', checkPermission('manage_users'), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;
    
    // Check if SOP exists in company
    const sopResult = await pool.query(
      'SELECT id, title, status FROM sops WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );
    
    if (sopResult.rows.length === 0) {
      return res.status(404).json({ error: 'SOP not found' });
    }
    
    const sop = sopResult.rows[0];
    
    if (sop.status === 'active') {
      return res.status(400).json({ error: 'SOP is already published' });
    }
    
    // Begin transaction
    await pool.query('BEGIN');
    
    try {
      // Update SOP status to active
      await pool.query(
        `UPDATE sops 
         SET status = 'active', 
             effective_date = CURRENT_DATE,
             updated_at = NOW()
         WHERE id = $1 AND company_id = $2`,
        [id, companyId]
      );
      
      // Create acknowledgment records for all active employees in company
      await pool.query(
        `INSERT INTO sop_acknowledgments (sop_id, user_id, company_id)
         SELECT $1, u.id, $2
         FROM users u
         WHERE u.employment_status = 'active' 
           AND u.company_id = $2
         ON CONFLICT DO NOTHING`,
        [id, companyId]
      );
      
      await pool.query('COMMIT');
      
      console.log('✅ SOP published:', sop.title);
      
      res.json({ message: 'SOP published successfully' });
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('❌ Publish SOP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update SOP
router.put(
  '/:id',
  checkPermission('manage_users'),
  body('title').optional().trim().notEmpty(),
  body('category').optional().isIn(['policy', 'procedure', 'guideline', 'form']),
  body('content').optional().trim().notEmpty(),
  body('status').optional().isIn(['draft', 'active', 'archived']),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }
      
      const { id } = req.params;
      const companyId = req.companyId;
      const { 
        title, 
        category, 
        description, 
        content, 
        status,
        effectiveDate,
        reviewDate,
        version
      } = req.body;
      
      // Check if SOP exists in company
      const existingResult = await pool.query(
        'SELECT id, title FROM sops WHERE id = $1 AND company_id = $2',
        [id, companyId]
      );
      
      if (existingResult.rows.length === 0) {
        return res.status(404).json({ error: 'SOP not found' });
      }
      
      // Check for duplicate title in company
      if (title) {
        const duplicateTitle = await pool.query(
          'SELECT id FROM sops WHERE title = $1 AND id != $2 AND company_id = $3',
          [title, id, companyId]
        );
        
        if (duplicateTitle.rows.length > 0) {
          return res.status(400).json({ error: 'SOP with this title already exists' });
        }
      }
      
      // Build update query
      const updates = [];
      const params = [];
      let paramIndex = 1;
      
      if (title !== undefined) {
        updates.push(`title = $${paramIndex}`);
        params.push(title);
        paramIndex++;
      }
      
      if (category !== undefined) {
        updates.push(`category = $${paramIndex}`);
        params.push(category);
        paramIndex++;
      }
      
      if (description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        params.push(description);
        paramIndex++;
      }
      
      if (content !== undefined) {
        updates.push(`content = $${paramIndex}`);
        params.push(content);
        paramIndex++;
      }
      
      if (status !== undefined) {
        updates.push(`status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
      }
      
      if (effectiveDate !== undefined) {
        updates.push(`effective_date = $${paramIndex}`);
        params.push(effectiveDate);
        paramIndex++;
      }
      
      if (reviewDate !== undefined) {
        updates.push(`review_date = $${paramIndex}`);
        params.push(reviewDate);
        paramIndex++;
      }
      
      if (version !== undefined) {
        updates.push(`version = $${paramIndex}`);
        params.push(version);
        paramIndex++;
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      updates.push(`updated_at = NOW()`);
      
      params.push(id);
      params.push(companyId);
      
      const query = `
        UPDATE sops
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex} AND company_id = $${paramIndex + 1}
        RETURNING *
      `;
      
      const result = await pool.query(query, params);
      
      console.log('✅ SOP updated:', result.rows[0].title);
      
      res.json({
        message: 'SOP updated successfully',
        sop: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Update SOP error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete SOP
router.delete('/:id', checkPermission('manage_users'), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;
    
    // Check if SOP exists in company
    const sopResult = await pool.query(
      'SELECT id, title FROM sops WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );
    
    if (sopResult.rows.length === 0) {
      return res.status(404).json({ error: 'SOP not found' });
    }
    
    // Delete SOP (cascade will delete acknowledgments)
    await pool.query(
      'DELETE FROM sops WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );
    
    console.log('✅ SOP deleted:', sopResult.rows[0].title);
    
    res.json({ message: 'SOP deleted successfully' });
  } catch (error) {
    console.error('❌ Delete SOP error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;