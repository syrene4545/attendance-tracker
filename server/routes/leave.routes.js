// server/routes/leave.routes.js
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

// ==================== LEAVE MANAGEMENT ROUTES ====================

// ✅ CRITICAL: Hard guard to ensure companyId is always present
router.use((req, res, next) => {
  if (!req.companyId) {
    console.error('❌ CRITICAL: Missing companyId in leave request', {
      userId: req.user?.id,
      email: req.user?.email,
      path: req.path,
      method: req.method,
      headers: {
        'x-tenant-id': req.headers['x-tenant-id'],
        'x-company-subdomain': req.headers['x-company-subdomain'],
        host: req.headers.host
      }
    });
    return res.status(400).json({
      error: 'Company context missing. Please log out and log in again.',
      code: 'MISSING_TENANT_CONTEXT'
    });
  }
  console.log('✅ Tenant context verified:', {
    companyId: req.companyId,
    userId: req.user.id,
    path: req.path
  });
  next();
});

// ==================== LEAVE TYPES ====================
router.get('/types', async (req, res) => {
  try {
    const leaveTypes = [
      { type: 'annual', name: 'Annual Leave' },
      { type: 'sick', name: 'Sick Leave' },
      { type: 'maternity', name: 'Maternity Leave' },
      { type: 'paternity', name: 'Paternity Leave' },
      { type: 'study', name: 'Study Leave' },
      { type: 'unpaid', name: 'Unpaid Leave' },
    ];

    res.json({ types: leaveTypes });
  } catch (error) {
    console.error('❌ Get leave types error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== LEAVE BALANCES ====================

// Get leave balance summary for all employees (admin/hr only) - MUST BE BEFORE /:userId
router.get('/balances/summary/all', checkPermission('view_analytics'), async (req, res) => {
  try {
    const companyId = req.companyId;
    const { year, department_id } = req.query;
    const currentYear = year || new Date().getFullYear();
    
    let query = `
      SELECT 
        u.id as "userId",
        u.name as "employeeName",
        u.employee_number as "employeeNumber",
        d.name as "departmentName",
        lb.leave_type as "leaveType",
        lb.total_days as "totalDays",
        lb.used_days as "usedDays",
        lb.remaining_days as "remainingDays"
      FROM leave_balances lb
      JOIN users u ON lb.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id AND d.company_id = $1
      WHERE lb.year = $2
        AND u.employment_status = 'active'
        AND lb.company_id = $1
        AND u.company_id = $1
    `;
    
    const params = [companyId, currentYear];
    let paramIndex = 3;
    
    if (department_id) {
      query += ` AND u.department_id = $${paramIndex}`;
      params.push(department_id);
      paramIndex++;
    }
    
    query += ` ORDER BY u.name ASC, lb.leave_type ASC`;
    
    const result = await pool.query(query, params);
    
    res.json({ 
      summary: result.rows,
      year: currentYear
    });
  } catch (error) {
    console.error('❌ Get leave balances summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize leave balances for new year (admin only) - MUST BE BEFORE /:userId
router.post(
  '/balances/initialize/:userId',
  checkPermission('manage_users'),
  body('year').isInt({ min: 2020, max: 2100 }),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const companyId = req.companyId;
      const { year } = req.body;
      
      // Verify user belongs to same company
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND company_id = $2',
        [userId, companyId]
      );
      
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      // Check if balances already exist (in same company)
      const existing = await pool.query(
        'SELECT id FROM leave_balances WHERE user_id = $1 AND year = $2 AND company_id = $3',
        [userId, year, companyId]
      );
      
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Leave balances already initialized for this year' });
      }
      
      // Initialize with company_id
      const result = await pool.query(
        `INSERT INTO leave_balances (company_id, user_id, leave_type, total_days, remaining_days, used_days, year)
         VALUES 
           ($3, $1, 'annual', 21, 21, 0, $2),
           ($3, $1, 'sick', 30, 30, 0, $2),
           ($3, $1, 'unpaid', 0, 0, 0, $2)
         RETURNING leave_type as "leaveType", total_days as "totalDays"`,
        [userId, year, companyId]
      );
      
      console.log('✅ Leave balances initialized for year:', year);
      
      res.status(201).json({
        message: 'Leave balances initialized successfully',
        balances: result.rows
      });
    } catch (error) {
      console.error('❌ Initialize leave balances error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get leave balances for an employee
router.get('/balances/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const companyId = req.companyId;
    const { year } = req.query;
    
    // Verify user belongs to same company
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND company_id = $2',
      [userId, companyId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Check permissions
    const canView = ['admin', 'hr'].includes(req.user.role) || req.user.id === parseInt(userId);
    
    if (!canView) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const currentYear = year || new Date().getFullYear();
    
    const result = await pool.query(
      `SELECT 
        id,
        leave_type as "leaveType",
        total_days as "totalDays",
        used_days as "usedDays",
        remaining_days as "remainingDays",
        year,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM leave_balances
      WHERE user_id = $1 AND year = $2 AND company_id = $3
      ORDER BY 
        CASE leave_type
          WHEN 'annual' THEN 1
          WHEN 'sick' THEN 2
          WHEN 'maternity' THEN 3
          WHEN 'paternity' THEN 4
          WHEN 'unpaid' THEN 5
          ELSE 6
        END`,
      [userId, currentYear, companyId]
    );
    
    res.json({ 
      balances: result.rows,
      year: currentYear
    });
  } catch (error) {
    console.error('❌ Get leave balances error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update leave balance (admin only - for adjustments)
router.put(
  '/balances/:id',
  checkPermission('manage_users'),
  body('totalDays').optional().isFloat({ min: 0 }),
  body('usedDays').optional().isFloat({ min: 0 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }
      
      const { id } = req.params;
      const companyId = req.companyId;
      const { totalDays, usedDays } = req.body;
      
      // Get current balance (verify company)
      const current = await pool.query(
        'SELECT total_days, used_days FROM leave_balances WHERE id = $1 AND company_id = $2',
        [id, companyId]
      );
      
      if (current.rows.length === 0) {
        return res.status(404).json({ error: 'Leave balance not found' });
      }
      
      const newTotal = totalDays !== undefined ? totalDays : parseFloat(current.rows[0].total_days);
      const newUsed = usedDays !== undefined ? usedDays : parseFloat(current.rows[0].used_days);
      const newRemaining = newTotal - newUsed;
      
      const result = await pool.query(
        `UPDATE leave_balances
         SET total_days = $1,
             used_days = $2,
             remaining_days = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 AND company_id = $5
         RETURNING 
           leave_type as "leaveType",
           total_days as "totalDays",
           used_days as "usedDays",
           remaining_days as "remainingDays"`,
        [newTotal, newUsed, newRemaining, id, companyId]
      );
      
      console.log('✅ Leave balance updated:', result.rows[0]);
      
      res.json({
        message: 'Leave balance updated successfully',
        balance: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Update leave balance error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ==================== LEAVE REQUESTS ====================

// Get leave requests
router.get('/requests', async (req, res) => {
  try {
    const companyId = req.companyId;
    const { status, user_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        lr.id,
        lr.user_id as "userId",
        u.name as "employeeName",
        u.employee_number as "employeeNumber",
        d.name as "departmentName",
        lr.leave_type as "leaveType",
        lr.start_date as "startDate",
        lr.end_date as "endDate",
        lr.days_requested as "totalDays",
        lr.reason,
        lr.status,
        lr.reviewed_by as "approvedBy",
        approver.name as "approverName",
        lr.reviewed_at as "approvedAt",
        lr.rejection_reason as "rejectionReason",
        lr.created_at as "createdAt"
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id AND d.company_id = $1
      LEFT JOIN users approver ON lr.reviewed_by = approver.id AND approver.company_id = $1
      WHERE lr.company_id = $1 
        AND u.company_id = $1
    `;
    
    const params = [companyId];
    let paramIndex = 2;
    
    // Regular users can only see their own requests
    if (!['admin', 'hr'].includes(req.user.role)) {
      query += ` AND lr.user_id = $${paramIndex}`;
      params.push(req.user.id);
      paramIndex++;
    } else if (user_id) {
      // Admin/HR can filter by specific user
      query += ` AND lr.user_id = $${paramIndex}`;
      params.push(user_id);
      paramIndex++;
    }
    
    // Filter by status
    if (status) {
      query += ` AND lr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    // Filter by date range
    if (start_date) {
      query += ` AND lr.start_date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }
    
    if (end_date) {
      query += ` AND lr.end_date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }
    
    query += ` ORDER BY lr.created_at DESC`;
    
    const result = await pool.query(query, params);
    
    res.json({ 
      requests: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Get leave requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single leave request
router.get('/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;
    
    let query = `
      SELECT 
        lr.*,
        u.name as "employeeName",
        u.email as "employeeEmail",
        u.employee_number as "employeeNumber",
        d.name as "departmentName",
        jp.title as "jobTitle",
        approver.name as "approverName",
        approver.email as "approverEmail"
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id AND d.company_id = $2
      LEFT JOIN job_positions jp ON u.job_position_id = jp.id AND jp.company_id = $2
      LEFT JOIN users approver ON lr.reviewed_by = approver.id AND approver.company_id = $2
      WHERE lr.id = $1 AND lr.company_id = $2
    `;
    
    const params = [id, companyId];
    
    // Regular users can only view their own requests
    if (!['admin', 'hr'].includes(req.user.role)) {
      query += ` AND lr.user_id = $3`;
      params.push(req.user.id);
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    
    res.json({ request: result.rows[0] });
  } catch (error) {
    console.error('❌ Get leave request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit leave request
router.post(
  '/requests',
  body('leaveType').isIn(['annual', 'sick', 'maternity', 'paternity', 'unpaid', 'study']),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('reason').optional().trim(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }
      
      const { leaveType, startDate, endDate, reason } = req.body;
      const userId = req.user.id;
      const companyId = req.companyId;
      
      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end < start) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }
      
      // Calculate total days (excluding weekends)
      let totalDays = 0;
      let currentDate = new Date(start);
      
      while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay();
        // Exclude Saturday (6) and Sunday (0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          totalDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      if (totalDays === 0) {
        return res.status(400).json({ error: 'Leave request must include at least one working day' });
      }
      
      // ✅ CRITICAL FIX: Check leave balance using correct table name
      // const currentYear = start.getFullYear();
      // const balance = await pool.query(
      //   `SELECT remaining_days 
      //    FROM leave_balances 
      //    WHERE user_id = $1 AND leave_type = $2 AND year = $3 AND company_id = $4`,
      //   [userId, leaveType, currentYear, companyId]
      // );
      
      // if (balance.rows.length === 0) {
      //   return res.status(400).json({ error: 'Leave balance not found for this leave type' });
      // }
      
      // const remainingDays = parseFloat(balance.rows[0].remaining_days);
      
      // if (leaveType !== 'unpaid' && totalDays > remainingDays) {
      //   return res.status(400).json({ 
      //     error: 'Insufficient leave balance',
      //     requested: totalDays,
      //     available: remainingDays
      //   });
      // }

      // ✅ FIXED: Only check balances for balance-required leave types
      const currentYear = start.getFullYear();

      // Define which leave types require balance checking
      const balanceRequiredTypes = ['annual', 'sick'];

      // Only check balance for leave types that require it
      if (balanceRequiredTypes.includes(leaveType)) {
        const balance = await pool.query(
          `SELECT remaining_days 
          FROM leave_balances 
          WHERE user_id = $1 AND leave_type = $2 AND year = $3 AND company_id = $4`,
          [userId, leaveType, currentYear, companyId]
        );
        
        if (balance.rows.length === 0) {
          return res.status(400).json({ 
            error: `No leave balance configured for ${leaveType}. Please contact HR to initialize your leave balance.`
          });
        }
        
        const remainingDays = Number(balance.rows[0].remaining_days);
        
        if (totalDays > remainingDays) {
          return res.status(400).json({ 
            error: 'Insufficient leave balance',
            requested: totalDays,
            available: remainingDays
          });
        }
      }

      // Note: unpaid, maternity, paternity, and study leave do not require balance checking
      // as they are typically unlimited or approved on a case-by-case basis
      
      // Check for overlapping leave requests (same company)
      const overlapping = await pool.query(
        `SELECT id FROM leave_requests
         WHERE user_id = $1
           AND status IN ('pending', 'approved')
           AND company_id = $4
           AND (
             (start_date <= $2 AND end_date >= $2)
             OR (start_date <= $3 AND end_date >= $3)
             OR (start_date >= $2 AND end_date <= $3)
           )`,
        [userId, startDate, endDate, companyId]
      );
      
      if (overlapping.rows.length > 0) {
        return res.status(400).json({ error: 'You have an overlapping leave request' });
      }
      
      // Create leave request with company_id
      const result = await pool.query(
        `INSERT INTO leave_requests (
          user_id, leave_type, start_date, end_date, days_requested, reason, status, company_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
        RETURNING 
          id,
          leave_type as "leaveType",
          start_date as "startDate",
          end_date as "endDate",
          days_requested as "totalDays",
          status,
          created_at as "createdAt"`,
        [userId, leaveType, startDate, endDate, totalDays, reason || null, companyId]
      );
      
      console.log('✅ Leave request submitted:', result.rows[0]);
      
      res.status(201).json({
        message: 'Leave request submitted successfully',
        request: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Submit leave request error:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Approve leave request

// Approve leave request
router.post(
  '/requests/:id/approve',
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.companyId;
      
      console.log('📥 Approval request:', { id, companyId, approver: req.user.id });
      
      // ✅ Get leave request details with LEFT JOIN (verify company)
      const request = await pool.query(
        `SELECT lr.*, lb.remaining_days
         FROM leave_requests lr
         LEFT JOIN leave_balances lb ON lb.user_id = lr.user_id 
           AND lb.leave_type = lr.leave_type 
           AND lb.year = EXTRACT(YEAR FROM lr.start_date)
           AND lb.company_id = lr.company_id
         WHERE lr.id = $1 AND lr.company_id = $2`,
        [id, companyId]
      );
      
      if (request.rows.length === 0) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
      
      const leaveRequest = request.rows[0];
      
      if (leaveRequest.status !== 'pending') {
        return res.status(400).json({ error: 'Leave request is not pending' });
      }
      
      // Check if approver is trying to approve their own request
      if (leaveRequest.user_id === req.user.id) {
        return res.status(403).json({ error: 'You cannot approve your own leave request' });
      }
      
      // ✅ Validate balance exists for balance-required leave types
      const balanceRequiredTypes = ['annual', 'sick'];
      if (balanceRequiredTypes.includes(leaveRequest.leave_type)) {
        if (leaveRequest.remaining_days === null || leaveRequest.remaining_days === undefined) {
          console.error('❌ Missing leave balance for approval:', {
            userId: leaveRequest.user_id,
            leaveType: leaveRequest.leave_type,
            requestId: id
          });
          return res.status(400).json({
            error: `Leave balance not configured for ${leaveRequest.leave_type}. Cannot approve request.`
          });
        }
      }
      
      // Special handling for sick leave - check 3-year cycle (same company)
      if (leaveRequest.leave_type === 'sick') {
        const currentYear = new Date().getFullYear();
        const cycleStartYear = currentYear - 2;
        
        const cycleUsageResult = await pool.query(
          `SELECT COALESCE(SUM(days_requested), 0) as total_used
           FROM leave_requests
           WHERE user_id = $1 
             AND leave_type = 'sick'
             AND status = 'approved'
             AND EXTRACT(YEAR FROM start_date) >= $2
             AND company_id = $3`,
          [leaveRequest.user_id, cycleStartYear, companyId]
        );
        
        const totalUsedInCycle = parseFloat(cycleUsageResult.rows[0].total_used);
        const totalAllowance = 30;
        const availableInCycle = totalAllowance - totalUsedInCycle;
        
        if (leaveRequest.days_requested > availableInCycle) {
          return res.status(400).json({ 
            error: `Insufficient sick leave balance in 3-year cycle. Employee has ${availableInCycle} days available (${totalUsedInCycle} of 30 days used since ${cycleStartYear}).`
          });
        }
      }
      
      // Begin transaction
      await pool.query('BEGIN');
      
      try {
        // Update leave request status (verify company)
        await pool.query(
          `UPDATE leave_requests
           SET status = 'approved',
               reviewed_by = $1,
               reviewed_at = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2 AND company_id = $3`,
          [req.user.id, id, companyId]
        );
        
        // ✅ Deduct from leave balance only for balance-required types (verify company)
        if (balanceRequiredTypes.includes(leaveRequest.leave_type)) {
          const deductResult = await pool.query(
            `UPDATE leave_balances
             SET used_days = used_days + $1,
                 remaining_days = remaining_days - $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2 
               AND leave_type = $3 
               AND year = EXTRACT(YEAR FROM $4::date)
               AND company_id = $5
             RETURNING id`,
            [leaveRequest.days_requested, leaveRequest.user_id, leaveRequest.leave_type, leaveRequest.start_date, companyId]
          );
          
          if (deductResult.rows.length === 0) {
            console.error('❌ Failed to deduct leave balance');
            throw new Error('Failed to update leave balance');
          }
          
          console.log('✅ Leave balance deducted');
        } else {
          console.log('ℹ️ No balance deduction needed for', leaveRequest.leave_type);
        }
        
        await pool.query('COMMIT');
        
        console.log('✅ Leave request approved:', id);
        
        res.json({ message: 'Leave request approved successfully' });
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('❌ Approve leave request error:', error);
      console.error('❌ Error details:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// router.post(
//   '/requests/:id/approve',
//   checkPermission('manage_users'),
//   async (req, res) => {
//     try {
//       const { id } = req.params;
//       const companyId = req.companyId;

//       const request = await pool.query(
//         `SELECT lr.*, lb.remaining_days
//         FROM leave_requests lr
//         LEFT JOIN leave_balances lb ON lb.user_id = lr.user_id 
//           AND lb.leave_type = lr.leave_type 
//           AND lb.year = EXTRACT(YEAR FROM lr.start_date)
//           AND lb.company_id = lr.company_id
//         WHERE lr.id = $1 AND lr.company_id = $2`,
//         [id, companyId]
//       );
      
//       if (request.rows.length === 0) {
//         return res.status(404).json({ error: 'Leave request not found' });
//       }
      
//       const leaveRequest = request.rows[0];
      
//       if (leaveRequest.status !== 'pending') {
//         return res.status(400).json({ error: 'Leave request is not pending' });
//       }
      
//       // Check if approver is trying to approve their own request
//       if (leaveRequest.user_id === req.user.id) {
//         return res.status(403).json({ error: 'You cannot approve your own leave request' });
//       }

//       // Deduct from leave balance (verify company)
//       // ✅ FIXED: Only deduct for balance-required leave types
//       const balanceRequiredTypes = ['annual', 'sick'];
//       if (balanceRequiredTypes.includes(leaveRequest.leave_type)) {
//         const deductResult = await pool.query(
//           `UPDATE leave_balances
//           SET used_days = used_days + $1,
//               remaining_days = remaining_days - $1,
//               updated_at = CURRENT_TIMESTAMP
//           WHERE user_id = $2 
//             AND leave_type = $3 
//             AND year = EXTRACT(YEAR FROM $4::date)
//             AND company_id = $5
//           RETURNING id`,
//           [leaveRequest.days_requested, leaveRequest.user_id, leaveRequest.leave_type, leaveRequest.start_date, companyId]
//         );
        
//         if (deductResult.rows.length === 0) {
//           console.error('❌ Failed to deduct leave balance:', {
//             userId: leaveRequest.user_id,
//             leaveType: leaveRequest.leave_type,
//             requestId: id
//           });
//           throw new Error('Failed to update leave balance');
//         }
        
//         console.log('✅ Leave balance deducted:', {
//           userId: leaveRequest.user_id,
//           leaveType: leaveRequest.leave_type,
//           daysDeducted: leaveRequest.days_requested
//         });
//       } else {
//         console.log('ℹ️ No balance deduction needed for', leaveRequest.leave_type);
//       }

//       // Special handling for sick leave - check 3-year cycle (same company)
//       if (leaveRequest.leave_type === 'sick') {
//         const currentYear = new Date().getFullYear();
//         const cycleStartYear = currentYear - 2;
        
//         const cycleUsageResult = await pool.query(
//           `SELECT COALESCE(SUM(days_requested), 0) as total_used
//            FROM leave_requests
//            WHERE user_id = $1 
//              AND leave_type = 'sick'
//              AND status = 'approved'
//              AND EXTRACT(YEAR FROM start_date) >= $2
//              AND company_id = $3`,
//           [leaveRequest.user_id, cycleStartYear, companyId]
//         );
        
//         const totalUsedInCycle = parseFloat(cycleUsageResult.rows[0].total_used);
//         const totalAllowance = 30;
//         const availableInCycle = totalAllowance - totalUsedInCycle;
        
//         if (leaveRequest.days_requested > availableInCycle) {
//           return res.status(400).json({ 
//             error: `Insufficient sick leave balance in 3-year cycle. Employee has ${availableInCycle} days available (${totalUsedInCycle} of 30 days used since ${cycleStartYear}).`
//           });
//         }
//       }
      
//       // Begin transaction
//       await pool.query('BEGIN');
      
//       try {
//         // Update leave request status (verify company)
//         await pool.query(
//           `UPDATE leave_requests
//            SET status = 'approved',
//                reviewed_by = $1,
//                reviewed_at = CURRENT_TIMESTAMP,
//                updated_at = CURRENT_TIMESTAMP
//            WHERE id = $2 AND company_id = $3`,
//           [req.user.id, id, companyId]
//         );
        
//         // Deduct from leave balance (verify company)
//         if (leaveRequest.leave_type !== 'unpaid') {
//           await pool.query(
//             `UPDATE leave_balances
//              SET used_days = used_days + $1,
//                  remaining_days = remaining_days - $1,
//                  updated_at = CURRENT_TIMESTAMP
//              WHERE user_id = $2 
//                AND leave_type = $3 
//                AND year = EXTRACT(YEAR FROM $4::date)
//                AND company_id = $5`,
//             [leaveRequest.days_requested, leaveRequest.user_id, leaveRequest.leave_type, leaveRequest.start_date, companyId]
//           );
//         }
        
//         await pool.query('COMMIT');
        
//         console.log('✅ Leave request approved:', id);
        
//         res.json({ message: 'Leave request approved successfully' });
//       } catch (error) {
//         await pool.query('ROLLBACK');
//         throw error;
//       }
//     } catch (error) {
//       console.error('❌ Approve leave request error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// Reject leave request
router.post(
  '/requests/:id/reject',
  checkPermission('manage_users'),
  body('rejectionReason').trim().notEmpty().withMessage('Rejection reason is required'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }
      
      const { id } = req.params;
      const companyId = req.companyId;
      const { rejectionReason } = req.body;
      
      // Get leave request (verify company)
      const request = await pool.query(
        'SELECT user_id, status FROM leave_requests WHERE id = $1 AND company_id = $2',
        [id, companyId]
      );
      
      if (request.rows.length === 0) {
        return res.status(404).json({ error: 'Leave request not found' });
      }
      
      if (request.rows[0].status !== 'pending') {
        return res.status(400).json({ error: 'Leave request is not pending' });
      }
      
      // Check if approver is trying to reject their own request
      if (request.rows[0].user_id === req.user.id) {
        return res.status(403).json({ error: 'You cannot reject your own leave request' });
      }
      
      // Update leave request (verify company)
      await pool.query(
        `UPDATE leave_requests
         SET status = 'rejected',
             reviewed_by = $1,
             reviewed_at = CURRENT_TIMESTAMP,
             rejection_reason = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3 AND company_id = $4`,
        [req.user.id, rejectionReason, id, companyId]
      );
      
      console.log('✅ Leave request rejected:', id);
      
      res.json({ message: 'Leave request rejected' });
    } catch (error) {
      console.error('❌ Reject leave request error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Cancel leave request (by requester before approval)
router.post('/requests/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;
    
    const result = await pool.query(
      `UPDATE leave_requests
       SET status = 'cancelled',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 AND status = 'pending' AND company_id = $3
       RETURNING id`,
      [id, req.user.id, companyId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Leave request not found or cannot be cancelled' 
      });
    }
    
    console.log('✅ Leave request cancelled:', id);
    
    res.json({ message: 'Leave request cancelled successfully' });
  } catch (error) {
    console.error('❌ Cancel leave request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== LEAVE REPORTS & STATISTICS ====================

// Get overview stats (for dashboard cards)
router.get('/stats/overview', async (req, res) => {
  try {
    const companyId = req.companyId;
    const today = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    
    // Pending approvals (company only)
    const pending = await pool.query(
      "SELECT COUNT(*) FROM leave_requests WHERE status = 'pending' AND company_id = $1",
      [companyId]
    );
    
    // On leave today (company only)
    const onLeave = await pool.query(
      `SELECT COUNT(DISTINCT user_id) FROM leave_requests 
       WHERE status = 'approved' AND start_date <= $1 AND end_date >= $1 AND company_id = $2`,
      [today, companyId]
    );
    
    // This month (company only)
    const month = await pool.query(
      `SELECT COUNT(*) FROM leave_requests 
       WHERE status = 'approved' AND start_date >= $1 AND company_id = $2`,
      [firstDayOfMonth, companyId]
    );
    
    // Year total (company only)
    const yearDays = await pool.query(
      `SELECT SUM(days_requested) FROM leave_requests 
       WHERE status = 'approved' AND EXTRACT(YEAR FROM start_date) = $1 AND company_id = $2`,
      [currentYear, companyId]
    );
    
    res.json({
      pendingCount: parseInt(pending.rows[0].count),
      onLeaveToday: parseInt(onLeave.rows[0].count),
      thisMonthCount: parseInt(month.rows[0].count),
      yearTotalDays: parseInt(yearDays.rows[0].sum || 0)
    });
  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get leave statistics for employee
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const companyId = req.companyId;
    const { year } = req.query;
    
    // Verify user belongs to same company
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND company_id = $2',
      [userId, companyId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Check permissions
    const canView = ['admin', 'hr'].includes(req.user.role) || req.user.id === parseInt(userId);
    
    if (!canView) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    const currentYear = year || new Date().getFullYear();
    
    // Leave taken by type (same company)
    const leaveByType = await pool.query(
      `SELECT 
        leave_type as "leaveType",
        COUNT(*) as "requestCount",
        SUM(days_requested) as "totalDays"
      FROM leave_requests
      WHERE user_id = $1
        AND status = 'approved'
        AND EXTRACT(YEAR FROM start_date) = $2
        AND company_id = $3
      GROUP BY leave_type`,
      [userId, currentYear, companyId]
    );
    
    // Pending requests (same company)
    const pendingCount = await pool.query(
      'SELECT COUNT(*) as count FROM leave_requests WHERE user_id = $1 AND status = $2 AND company_id = $3',
      [userId, 'pending', companyId]
    );
    
    res.json({
      year: currentYear,
      leaveByType: leaveByType.rows,
      pendingRequests: parseInt(pendingCount.rows[0].count)
    });
  } catch (error) {
    console.error('❌ Get leave statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get department leave overview (admin/hr only)
router.get('/reports/department/:departmentId', checkPermission('view_analytics'), async (req, res) => {
  try {
    const { departmentId } = req.params;
    const companyId = req.companyId;
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();
    
    const result = await pool.query(
      `SELECT 
        u.name as "employeeName",
        u.employee_number as "employeeNumber",
        SUM(CASE WHEN lr.status = 'approved' THEN lr.days_requested ELSE 0 END) as "daysTaken",
        COUNT(CASE WHEN lr.status = 'pending' THEN 1 END) as "pendingRequests",
        lb_annual.remaining_days as "annualLeaveRemaining",
        lb_sick.remaining_days as "sickLeaveRemaining"
      FROM users u
      LEFT JOIN leave_requests lr ON lr.user_id = u.id 
        AND EXTRACT(YEAR FROM lr.start_date) = $2
        AND lr.company_id = $3
      LEFT JOIN leave_balances lb_annual ON lb_annual.user_id = u.id 
        AND lb_annual.leave_type = 'annual' 
        AND lb_annual.year = $2
        AND lb_annual.company_id = $3
      LEFT JOIN leave_balances lb_sick ON lb_sick.user_id = u.id 
        AND lb_sick.leave_type = 'sick' 
        AND lb_sick.year = $2
        AND lb_sick.company_id = $3
      WHERE u.department_id = $1
        AND u.employment_status = 'active'
        AND u.company_id = $3
      GROUP BY u.name, u.employee_number, lb_annual.remaining_days, lb_sick.remaining_days
      ORDER BY u.name ASC`,
      [departmentId, currentYear, companyId]
    );
    
    res.json({ 
      report: result.rows,
      year: currentYear
    });
  } catch (error) {
    console.error('❌ Get department leave report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get leave calendar (upcoming and ongoing leave)
router.get('/calendar', checkPermission('view_analytics'), async (req, res) => {
  try {
    const companyId = req.companyId;
    const { start_date, end_date, department_id } = req.query;
    
    let query = `
      SELECT 
        lr.id,
        lr.user_id as "userId",
        u.name as "employeeName",
        d.name as "departmentName",
        lr.leave_type as "leaveType",
        lr.start_date as "startDate",
        lr.end_date as "endDate",
        lr.days_requested as "totalDays",
        lr.status
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      LEFT JOIN departments d ON u.department_id = d.id AND d.company_id = $1
      WHERE lr.status = 'approved' 
        AND lr.company_id = $1
        AND u.company_id = $1
    `;
    
    const params = [companyId];
    let paramIndex = 2;
    
    if (start_date) {
      query += ` AND lr.end_date >= $${paramIndex}`;
      params.push(start_date);
      paramIndex++;
    }
    
    if (end_date) {
      query += ` AND lr.start_date <= $${paramIndex}`;
      params.push(end_date);
      paramIndex++;
    }
    
    if (department_id) {
      query += ` AND u.department_id = $${paramIndex}`;
      params.push(department_id);
      paramIndex++;
    }
    
    query += ` ORDER BY lr.start_date ASC`;
    
    const result = await pool.query(query, params);
    
    res.json({ calendar: result.rows });
  } catch (error) {
    console.error('❌ Get leave calendar error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sick leave 3-year cycle report
router.get('/reports/sick-leave-cycle', checkPermission('view_analytics'), async (req, res) => {
  try {
    const companyId = req.companyId;
    const currentYear = new Date().getFullYear();
    const cycleStartYear = currentYear - 2;
    
    const result = await pool.query(
      `SELECT 
        u.id as "userId",
        u.name,
        COALESCE(SUM(lr.days_requested), 0) as "usedInCycle"
      FROM users u
      LEFT JOIN leave_requests lr ON lr.user_id = u.id 
        AND lr.leave_type = 'sick'
        AND lr.status = 'approved'
        AND EXTRACT(YEAR FROM lr.start_date) >= $1
        AND lr.company_id = $2
      WHERE u.company_id = $2
      GROUP BY u.id, u.name
      ORDER BY u.name`,
      [cycleStartYear, companyId]
    );
    
    res.json({ 
      report: result.rows,
      cycleYears: `${cycleStartYear} - ${currentYear}`
    });
  } catch (error) {
    console.error('❌ Error fetching sick leave cycle report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get leave liability (total unused leave)
router.get('/reports/liability', checkPermission('view_analytics'), async (req, res) => {
  try {
    const companyId = req.companyId;
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();
    
    const result = await pool.query(
      `SELECT 
        SUM(remaining_days) as "totalUnusedDays",
        leave_type as "leaveType",
        COUNT(DISTINCT user_id) as "employeeCount"
      FROM leave_balances
      WHERE year = $1 AND company_id = $2
      GROUP BY leave_type`,
      [currentYear, companyId]
    );
    
    res.json({ 
      liability: result.rows,
      year: currentYear
    });
  } catch (error) {
    console.error('❌ Get leave liability error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;