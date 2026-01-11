// // server/routes/leave.routes.js
// import express from 'express';
// import { pool } from '../index.js';
// import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';
// import { body, validationResult } from 'express-validator';

// const router = express.Router();

// // ==================== LEAVE MANAGEMENT ROUTES ====================


// // ==================== LEAVE TYPES ====================
// router.get('/types', authenticateToken, async (req, res) => {
//   try {
//     const leaveTypes = [
//       { type: 'annual', name: 'Annual Leave' },
//       { type: 'sick', name: 'Sick Leave' },
//       { type: 'maternity', name: 'Maternity Leave' },
//       { type: 'paternity', name: 'Paternity Leave' },
//       { type: 'study', name: 'Study Leave' },
//       { type: 'unpaid', name: 'Unpaid Leave' },
//     ];

//     res.json({ types: leaveTypes });
//   } catch (error) {
//     console.error('Get leave types error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });


// // ==================== LEAVE BALANCES ====================

// // Get leave balances for an employee

// // Get leave balances for an employee
// router.get('/balances/:userId', authenticateToken, async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { year } = req.query;
    
//     // Check permissions
//     const canView = ['admin', 'hr'].includes(req.user.role) || req.user.id === parseInt(userId);
    
//     if (!canView) {
//       return res.status(403).json({ error: 'Insufficient permissions' });
//     }
    
//     const currentYear = year || new Date().getFullYear();
    
//     const result = await pool.query(
//       `SELECT 
//         id,
//         leave_type as "leaveType",
//         total_days as "totalDays",
//         used_days as "usedDays",
//         remaining_days as "remainingDays",
//         year,
//         created_at as "createdAt",
//         updated_at as "updatedAt"
//       FROM employee_leave_balances
//       WHERE user_id = $1 AND year = $2
//       ORDER BY 
//         CASE leave_type
//           WHEN 'annual' THEN 1
//           WHEN 'sick' THEN 2
//           WHEN 'maternity' THEN 3
//           WHEN 'paternity' THEN 4
//           WHEN 'unpaid' THEN 5
//           ELSE 6
//         END`,
//       [userId, currentYear]
//     );
    
//     res.json({ 
//       balances: result.rows,
//       year: currentYear
//     });
//   } catch (error) {
//     console.error('Get leave balances error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get leave balance summary for all employees (admin/hr only)
// router.get('/balances/summary/all', authenticateToken, checkPermission('view_leave_reports'), async (req, res) => {
//   try {
//     const { year, department_id } = req.query;
//     const currentYear = year || new Date().getFullYear();
    
//     let query = `
//       SELECT 
//         u.id as "userId",
//         u.name as "employeeName",
//         ep.employee_number as "employeeNumber",
//         d.name as "departmentName",
//         elb.leave_type as "leaveType",
//         elb.number_of_days as "totalDays",
//         elb.used_days as "usedDays",
//         elb.remaining_days as "remainingDays"
//       FROM employee_leave_balances elb
//       JOIN users u ON elb.user_id = u.id
//       JOIN employee_profiles ep ON ep.user_id = u.id
//       LEFT JOIN departments d ON ep.department_id = d.id
//       WHERE elb.year = $1
//         AND ep.employment_status = 'active'
//     `;
    
//     const params = [currentYear];
//     let paramIndex = 2;
    
//     if (department_id) {
//       query += ` AND ep.department_id = $${paramIndex}`;
//       params.push(department_id);
//       paramIndex++;
//     }
    
//     query += ` ORDER BY u.name ASC, elb.leave_type ASC`;
    
//     const result = await pool.query(query, params);
    
//     res.json({ 
//       summary: result.rows,
//       year: currentYear
//     });
//   } catch (error) {
//     console.error('Get leave balances summary error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Update leave balance (admin only - for adjustments)
// router.put(
//   '/balances/:id',
//   authenticateToken,
//   checkPermission('manage_employees'),
//   body('totalDays').optional().isFloat({ min: 0 }),
//   body('usedDays').optional().isFloat({ min: 0 }),
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ error: 'Invalid input', details: errors.array() });
//       }
      
//       const { id } = req.params;
//       const { totalDays, usedDays } = req.body;
      
//       // Get current balance
//       const current = await pool.query(
//         'SELECT number_of_days, used_days FROM employee_leave_balances WHERE id = $1',
//         [id]
//       );
      
//       if (current.rows.length === 0) {
//         return res.status(404).json({ error: 'Leave balance not found' });
//       }
      
//       const newTotal = totalDays !== undefined ? totalDays : parseFloat(current.rows[0].number_of_days);
//       const newUsed = usedDays !== undefined ? usedDays : parseFloat(current.rows[0].used_days);
//       const newRemaining = newTotal - newUsed;
      
//       const result = await pool.query(
//         `UPDATE employee_leave_balances
//          SET number_of_days = $1,
//              used_days = $2,
//              remaining_days = $3,
//              updated_at = CURRENT_TIMESTAMP
//          WHERE id = $4
//          RETURNING 
//            leave_type as "leaveType",
//            number_of_days as "totalDays",
//            used_days as "usedDays",
//            remaining_days as "remainingDays"`,
//         [newTotal, newUsed, newRemaining, id]
//       );
      
//       console.log('✅ Leave balance updated:', result.rows[0]);
      
//       res.json({
//         message: 'Leave balance updated successfully',
//         balance: result.rows[0]
//       });
//     } catch (error) {
//       console.error('Update leave balance error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Initialize leave balances for new year (admin only)
// router.post(
//   '/balances/initialize/:userId',
//   authenticateToken,
//   checkPermission('manage_employees'),
//   body('year').isInt({ min: 2020, max: 2100 }),
//   async (req, res) => {
//     try {
//       const { userId } = req.params;
//       const { year } = req.body;
      
//       // Check if balances already exist
//       const existing = await pool.query(
//         'SELECT id FROM employee_leave_balances WHERE user_id = $1 AND year = $2',
//         [userId, year]
//       );
      
//       if (existing.rows.length > 0) {
//         return res.status(400).json({ error: 'Leave balances already initialized for this year' });
//       }
      
//       // Initialize with standard South African leave days
//       const result = await pool.query(
//         `INSERT INTO employee_leave_balances (user_id, leave_type, total_days, remaining_days, year)
//          VALUES 
//            ($1, 'annual', 21, 21, $2),
//            ($1, 'sick', 30, 30, $2),
//            ($1, 'unpaid', 0, 0, $2)
//          RETURNING leave_type as "leaveType", total_days as "totalDays"`,
//         [userId, year]
//       );
      
//       console.log('✅ Leave balances initialized for year:', year);
      
//       res.status(201).json({
//         message: 'Leave balances initialized successfully',
//         balances: result.rows
//       });
//     } catch (error) {
//       console.error('Initialize leave balances error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // ==================== LEAVE REQUESTS ====================

// // Get leave requests
// router.get('/requests', authenticateToken, async (req, res) => {
//   try {
//     const { status, user_id, start_date, end_date } = req.query;
    
//     let query = `
//       SELECT 
//         lr.id,
//         lr.user_id as "userId",
//         u.name as "employeeName",
//         ep.employee_number as "employeeNumber",
//         d.name as "departmentName",
//         lr.leave_type as "leaveType",
//         lr.start_date as "startDate",
//         lr.end_date as "endDate",
//         lr.number_of_days as "totalDays",
//         lr.reason,
//         lr.status,
//         lr.approved_by as "approvedBy",
//         approver.name as "approverName",
//         lr.approved_at as "approvedAt",
//         lr.rejection_reason as "rejectionReason",
//         lr.created_at as "createdAt"
//       FROM leave_requests lr
//       JOIN users u ON lr.user_id = u.id
//       JOIN employee_profiles ep ON ep.user_id = u.id
//       LEFT JOIN departments d ON ep.department_id = d.id
//       LEFT JOIN users approver ON lr.approved_by = approver.id
//       WHERE 1=1
//     `;
    
//     const params = [];
//     let paramIndex = 1;
    
//     // Regular users can only see their own requests
//     if (!['admin', 'hr'].includes(req.user.role)) {
//       query += ` AND lr.user_id = $${paramIndex}`;
//       params.push(req.user.id);
//       paramIndex++;
//     } else if (user_id) {
//       // Admin/HR can filter by specific user
//       query += ` AND lr.user_id = $${paramIndex}`;
//       params.push(user_id);
//       paramIndex++;
//     }
    
//     // Filter by status
//     if (status) {
//       query += ` AND lr.status = $${paramIndex}`;
//       params.push(status);
//       paramIndex++;
//     }
    
//     // Filter by date range
//     if (start_date) {
//       query += ` AND lr.start_date >= $${paramIndex}`;
//       params.push(start_date);
//       paramIndex++;
//     }
    
//     if (end_date) {
//       query += ` AND lr.end_date <= $${paramIndex}`;
//       params.push(end_date);
//       paramIndex++;
//     }
    
//     query += ` ORDER BY lr.created_at DESC`;
    
//     const result = await pool.query(query, params);
    
//     res.json({ 
//       requests: result.rows,
//       total: result.rows.length
//     });
//   } catch (error) {
//     console.error('Get leave requests error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get single leave request
// router.get('/requests/:id', authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     let query = `
//       SELECT 
//         lr.*,
//         u.name as "employeeName",
//         u.email as "employeeEmail",
//         ep.employee_number as "employeeNumber",
//         d.name as "departmentName",
//         jp.title as "jobTitle",
//         approver.name as "approverName",
//         approver.email as "approverEmail"
//       FROM leave_requests lr
//       JOIN users u ON lr.user_id = u.id
//       JOIN employee_profiles ep ON ep.user_id = u.id
//       LEFT JOIN departments d ON ep.department_id = d.id
//       LEFT JOIN job_positions jp ON ep.job_position_id = jp.id
//       LEFT JOIN users approver ON lr.approved_by = approver.id
//       WHERE lr.id = $1
//     `;
    
//     const params = [id];
    
//     // Regular users can only view their own requests
//     if (!['admin', 'hr'].includes(req.user.role)) {
//       query += ` AND lr.user_id = $2`;
//       params.push(req.user.id);
//     }
    
//     const result = await pool.query(query, params);
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Leave request not found' });
//     }
    
//     res.json({ request: result.rows[0] });
//   } catch (error) {
//     console.error('Get leave request error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Submit leave request
// router.post(
//   '/requests',
//   authenticateToken,
//   body('leaveType').isIn(['annual', 'sick', 'maternity', 'paternity', 'unpaid', 'study']),
//   body('startDate').isISO8601(),
//   body('endDate').isISO8601(),
//   body('reason').optional().trim(),
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ error: 'Invalid input', details: errors.array() });
//       }
      
//       const { leaveType, startDate, endDate, reason } = req.body;
//       const userId = req.user.id;
      
//       // Validate dates
//       const start = new Date(startDate);
//       const end = new Date(endDate);
      
//       if (end < start) {
//         return res.status(400).json({ error: 'End date must be after start date' });
//       }
      
//       // Calculate total days (excluding weekends)
//       let totalDays = 0;
//       let currentDate = new Date(start);
      
//       while (currentDate <= end) {
//         const dayOfWeek = currentDate.getDay();
//         // Exclude Saturday (6) and Sunday (0)
//         if (dayOfWeek !== 0 && dayOfWeek !== 6) {
//           totalDays++;
//         }
//         currentDate.setDate(currentDate.getDate() + 1);
//       }
      
//       if (totalDays === 0) {
//         return res.status(400).json({ error: 'Leave request must include at least one working day' });
//       }
      
//       // Check leave balance
//       const currentYear = start.getFullYear();
//       const balance = await pool.query(
//         `SELECT remaining_days 
//          FROM employee_leave_balances 
//          WHERE user_id = $1 AND leave_type = $2 AND year = $3`,
//         [userId, leaveType, currentYear]
//       );
      
//       if (balance.rows.length === 0) {
//         return res.status(400).json({ error: 'Leave balance not found for this leave type' });
//       }
      
//       const remainingDays = parseFloat(balance.rows[0].remaining_days);
      
//       if (leaveType !== 'unpaid' && totalDays > remainingDays) {
//         return res.status(400).json({ 
//           error: 'Insufficient leave balance',
//           requested: totalDays,
//           available: remainingDays
//         });
//       }
      
//       // Check for overlapping leave requests
//       const overlapping = await pool.query(
//         `SELECT id FROM leave_requests
//          WHERE user_id = $1
//            AND status IN ('pending', 'approved')
//            AND (
//              (start_date <= $2 AND end_date >= $2)
//              OR (start_date <= $3 AND end_date >= $3)
//              OR (start_date >= $2 AND end_date <= $3)
//            )`,
//         [userId, startDate, endDate]
//       );
      
//       if (overlapping.rows.length > 0) {
//         return res.status(400).json({ error: 'You have an overlapping leave request' });
//       }
      
//       // Create leave request
//       const result = await pool.query(
//         `INSERT INTO leave_requests (
//           user_id, leave_type, start_date, end_date, number_of_days, reason, status
//         )
//         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
//         RETURNING 
//           id,
//           leave_type as "leaveType",
//           start_date as "startDate",
//           end_date as "endDate",
//           number_of_days as "totalDays",
//           status,
//           created_at as "createdAt"`,
//         [userId, leaveType, startDate, endDate, totalDays, reason || null]
//       );
      
//       console.log('✅ Leave request submitted:', result.rows[0]);
      
//       res.status(201).json({
//         message: 'Leave request submitted successfully',
//         request: result.rows[0]
//       });
//     } catch (error) {
//       console.error('Submit leave request error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Approve leave request
// // router.post(
// //   '/requests/:id/approve',
// //   authenticateToken,
// //   checkPermission('approve_leave'),
// //   async (req, res) => {
// //     try {
// //       const { id } = req.params;
      
// //       // Get leave request details
// //       const request = await pool.query(
// //         `SELECT lr.*, elb.remaining_days
// //          FROM leave_requests lr
// //          JOIN employee_leave_balances elb ON elb.user_id = lr.user_id 
// //            AND elb.leave_type = lr.leave_type 
// //            AND elb.year = EXTRACT(YEAR FROM lr.start_date)
// //          WHERE lr.id = $1`,
// //         [id]
// //       );
      
// //       if (request.rows.length === 0) {
// //         return res.status(404).json({ error: 'Leave request not found' });
// //       }
      
// //       const leaveRequest = request.rows[0];
      
// //       if (leaveRequest.status !== 'pending') {
// //         return res.status(400).json({ error: 'Leave request is not pending' });
// //       }
      
// //       // Check if approver is trying to approve their own request
// //       if (leaveRequest.user_id === req.user.id) {
// //         return res.status(403).json({ error: 'You cannot approve your own leave request' });
// //       }
      
// //       // Begin transaction
// //       await pool.query('BEGIN');
      
// //       try {
// //         // Update leave request status
// //         await pool.query(
// //           `UPDATE leave_requests
// //            SET status = 'approved',
// //                approved_by = $1,
// //                approved_at = CURRENT_TIMESTAMP,
// //                updated_at = CURRENT_TIMESTAMP
// //            WHERE id = $2`,
// //           [req.user.id, id]
// //         );
        
// //         // Deduct from leave balance (if not unpaid leave)
// //         if (leaveRequest.leave_type !== 'unpaid') {
// //           await pool.query(
// //             `UPDATE employee_leave_balances
// //              SET used_days = used_days + $1,
// //                  remaining_days = remaining_days - $1,
// //                  updated_at = CURRENT_TIMESTAMP
// //              WHERE user_id = $2 
// //                AND leave_type = $3 
// //                AND year = EXTRACT(YEAR FROM $4::date)`,
// //             [leaveRequest.number_of_days, leaveRequest.user_id, leaveRequest.leave_type, leaveRequest.start_date]
// //           );
// //         }
        
// //         await pool.query('COMMIT');
        
// //         console.log('✅ Leave request approved:', id);
        
// //         res.json({ message: 'Leave request approved successfully' });
// //       } catch (error) {
// //         await pool.query('ROLLBACK');
// //         throw error;
// //       }
// //     } catch (error) {
// //       console.error('Approve leave request error:', error);
// //       res.status(500).json({ error: 'Internal server error' });
// //     }
// //   }
// // );

// // Approve leave request
// router.post(
//   '/requests/:id/approve',
//   authenticateToken,
//   checkPermission('approve_leave'),
//   async (req, res) => {
//     try {
//       const { id } = req.params;
      
//       // Get leave request details
//       const request = await pool.query(
//         `SELECT lr.*, elb.remaining_days
//          FROM leave_requests lr
//          JOIN employee_leave_balances elb ON elb.user_id = lr.user_id 
//            AND elb.leave_type = lr.leave_type 
//            AND elb.year = EXTRACT(YEAR FROM lr.start_date)
//          WHERE lr.id = $1`,
//         [id]
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
      
//       // ✅ Special handling for sick leave - check 3-year cycle
//       if (leaveRequest.leave_type === 'sick') {
//         const currentYear = new Date().getFullYear();
//         const cycleStartYear = currentYear - 2;
        
//         // Get total sick leave used in 3-year cycle
//         const cycleUsageResult = await pool.query(
//           `SELECT COALESCE(SUM(number_of_days), 0) as total_used
//            FROM leave_requests
//            WHERE user_id = $1 
//              AND leave_type = 'sick'
//              AND status = 'approved'
//              AND EXTRACT(YEAR FROM start_date) >= $2`,
//           [leaveRequest.user_id, cycleStartYear]
//         );
        
//         const totalUsedInCycle = parseFloat(cycleUsageResult.rows[0].total_used);
//         const totalAllowance = 30; // 30 days per 3-year cycle
//         const availableInCycle = totalAllowance - totalUsedInCycle;
        
//         if (leaveRequest.number_of_days > availableInCycle) {
//           return res.status(400).json({ 
//             error: `Insufficient sick leave balance in 3-year cycle. Employee has ${availableInCycle} days available (${totalUsedInCycle} of 30 days used since ${cycleStartYear}).`
//           });
//         }
//       }
      
//       // Begin transaction
//       await pool.query('BEGIN');
      
//       try {
//         // Update leave request status
//         await pool.query(
//           `UPDATE leave_requests
//            SET status = 'approved',
//                approved_by = $1,
//                approved_at = CURRENT_TIMESTAMP,
//                updated_at = CURRENT_TIMESTAMP
//            WHERE id = $2`,
//           [req.user.id, id]
//         );
        
//         // Deduct from leave balance (if not unpaid leave)
//         if (leaveRequest.leave_type !== 'unpaid') {
//           await pool.query(
//             `UPDATE employee_leave_balances
//              SET used_days = used_days + $1,
//                  remaining_days = remaining_days - $1,
//                  updated_at = CURRENT_TIMESTAMP
//              WHERE user_id = $2 
//                AND leave_type = $3 
//                AND year = EXTRACT(YEAR FROM $4::date)`,
//             [leaveRequest.number_of_days, leaveRequest.user_id, leaveRequest.leave_type, leaveRequest.start_date]
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
//       console.error('Approve leave request error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Reject leave request
// router.post(
//   '/requests/:id/reject',
//   authenticateToken,
//   checkPermission('approve_leave'),
//   body('rejectionReason').trim().notEmpty().withMessage('Rejection reason is required'),
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ error: 'Invalid input', details: errors.array() });
//       }
      
//       const { id } = req.params;
//       const { rejectionReason } = req.body;
      
//       // Get leave request
//       const request = await pool.query(
//         'SELECT user_id, status FROM leave_requests WHERE id = $1',
//         [id]
//       );
      
//       if (request.rows.length === 0) {
//         return res.status(404).json({ error: 'Leave request not found' });
//       }
      
//       if (request.rows[0].status !== 'pending') {
//         return res.status(400).json({ error: 'Leave request is not pending' });
//       }
      
//       // Check if approver is trying to reject their own request
//       if (request.rows[0].user_id === req.user.id) {
//         return res.status(403).json({ error: 'You cannot reject your own leave request' });
//       }
      
//       // Update leave request
//       await pool.query(
//         `UPDATE leave_requests
//          SET status = 'rejected',
//              approved_by = $1,
//              approved_at = CURRENT_TIMESTAMP,
//              rejection_reason = $2,
//              updated_at = CURRENT_TIMESTAMP
//          WHERE id = $3`,
//         [req.user.id, rejectionReason, id]
//       );
      
//       console.log('✅ Leave request rejected:', id);
      
//       res.json({ message: 'Leave request rejected' });
//     } catch (error) {
//       console.error('Reject leave request error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Cancel leave request (by requester before approval)
// router.post(
//   '/requests/:id/cancel',
//   authenticateToken,
//   async (req, res) => {
//     try {
//       const { id } = req.params;
      
//       const result = await pool.query(
//         `UPDATE leave_requests
//          SET status = 'cancelled',
//              updated_at = CURRENT_TIMESTAMP
//          WHERE id = $1 AND user_id = $2 AND status = 'pending'
//          RETURNING id`,
//         [id, req.user.id]
//       );
      
//       if (result.rows.length === 0) {
//         return res.status(404).json({ 
//           error: 'Leave request not found or cannot be cancelled' 
//         });
//       }
      
//       console.log('✅ Leave request cancelled:', id);
      
//       res.json({ message: 'Leave request cancelled successfully' });
//     } catch (error) {
//       console.error('Cancel leave request error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // ==================== LEAVE REPORTS & STATISTICS ====================

// // Get overview stats (for dashboard cards)
// router.get('/stats/overview', authenticateToken, async (req, res) => {
//   try {
//     const today = new Date().toISOString().split('T')[0];
//     const currentYear = new Date().getFullYear();
//     const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    
//     // Pending approvals
//     const pending = await pool.query(
//       "SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'"
//     );
    
//     // On leave today
//     const onLeave = await pool.query(
//       `SELECT COUNT(DISTINCT user_id) FROM leave_requests 
//        WHERE status = 'approved' AND start_date <= $1 AND end_date >= $1`,
//       [today]
//     );
    
//     // This month
//     const month = await pool.query(
//       `SELECT COUNT(*) FROM leave_requests 
//        WHERE status = 'approved' AND start_date >= $1`,
//       [firstDayOfMonth]
//     );
    
//     // Year total
//     const yearDays = await pool.query(
//       `SELECT SUM(number_of_days) FROM leave_requests 
//        WHERE status = 'approved' AND EXTRACT(YEAR FROM start_date) = $1`,
//       [currentYear]
//     );
    
//     res.json({
//       pendingCount: parseInt(pending.rows[0].count),
//       onLeaveToday: parseInt(onLeave.rows[0].count),
//       thisMonthCount: parseInt(month.rows[0].count),
//       yearTotalDays: parseInt(yearDays.rows[0].sum || 0)
//     });
//   } catch (error) {
//     console.error('Get stats error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get leave statistics for employee
// router.get('/stats/:userId', authenticateToken, async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { year } = req.query;
    
//     // Check permissions
//     const canView = ['admin', 'hr'].includes(req.user.role) || req.user.id === parseInt(userId);
    
//     if (!canView) {
//       return res.status(403).json({ error: 'Insufficient permissions' });
//     }
    
//     const currentYear = year || new Date().getFullYear();
    
//     // Leave taken by type
//     const leaveByType = await pool.query(
//       `SELECT 
//         leave_type as "leaveType",
//         COUNT(*) as "requestCount",
//         SUM(number_of_days) as "totalDays"
//       FROM leave_requests
//       WHERE user_id = $1
//         AND status = 'approved'
//         AND EXTRACT(YEAR FROM start_date) = $2
//       GROUP BY leave_type`,
//       [userId, currentYear]
//     );
    
//     // Pending requests
//     const pendingCount = await pool.query(
//       'SELECT COUNT(*) as count FROM leave_requests WHERE user_id = $1 AND status = $2',
//       [userId, 'pending']
//     );
    
//     res.json({
//       year: currentYear,
//       leaveByType: leaveByType.rows,
//       pendingRequests: parseInt(pendingCount.rows[0].count)
//     });
//   } catch (error) {
//     console.error('Get leave statistics error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get department leave overview (admin/hr only)
// router.get('/reports/department/:departmentId', authenticateToken, checkPermission('view_leave_reports'), async (req, res) => {
//   try {
//     const { departmentId } = req.params;
//     const { year } = req.query;
//     const currentYear = year || new Date().getFullYear();
    
//     const result = await pool.query(
//       `SELECT 
//         u.name as "employeeName",
//         ep.employee_number as "employeeNumber",
//         SUM(CASE WHEN lr.status = 'approved' THEN lr.number_of_days ELSE 0 END) as "daysTaken",
//         COUNT(CASE WHEN lr.status = 'pending' THEN 1 END) as "pendingRequests",
//         elb_annual.remaining_days as "annualLeaveRemaining",
//         elb_sick.remaining_days as "sickLeaveRemaining"
//       FROM employee_profiles ep
//       JOIN users u ON ep.user_id = u.id
//       LEFT JOIN leave_requests lr ON lr.user_id = u.id 
//         AND EXTRACT(YEAR FROM lr.start_date) = $2
//       LEFT JOIN employee_leave_balances elb_annual ON elb_annual.user_id = u.id 
//         AND elb_annual.leave_type = 'annual' 
//         AND elb_annual.year = $2
//       LEFT JOIN employee_leave_balances elb_sick ON elb_sick.user_id = u.id 
//         AND elb_sick.leave_type = 'sick' 
//         AND elb_sick.year = $2
//       WHERE ep.department_id = $1
//         AND ep.employment_status = 'active'
//       GROUP BY u.name, ep.employee_number, elb_annual.remaining_days, elb_sick.remaining_days
//       ORDER BY u.name ASC`,
//       [departmentId, currentYear]
//     );
    
//     res.json({ 
//       report: result.rows,
//       year: currentYear
//     });
//   } catch (error) {
//     console.error('Get department leave report error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get leave calendar (upcoming and ongoing leave)
// router.get('/calendar', authenticateToken, checkPermission('view_leave_reports'), async (req, res) => {
//   try {
//     const { start_date, end_date, department_id } = req.query;
    
//     let query = `
//       SELECT 
//         lr.id,
//         lr.user_id as "userId",
//         u.name as "employeeName",
//         d.name as "departmentName",
//         lr.leave_type as "leaveType",
//         lr.start_date as "startDate",
//         lr.end_date as "endDate",
//         lr.number_of_days as "totalDays",
//         lr.status
//       FROM leave_requests lr
//       JOIN users u ON lr.user_id = u.id
//       JOIN employee_profiles ep ON ep.user_id = u.id
//       LEFT JOIN departments d ON ep.department_id = d.id
//       WHERE lr.status = 'approved'
//     `;
    
//     const params = [];
//     let paramIndex = 1;
    
//     if (start_date) {
//       query += ` AND lr.end_date >= $${paramIndex}`;
//       params.push(start_date);
//       paramIndex++;
//     }
    
//     if (end_date) {
//       query += ` AND lr.start_date <= $${paramIndex}`;
//       params.push(end_date);
//       paramIndex++;
//     }
    
//     if (department_id) {
//       query += ` AND ep.department_id = $${paramIndex}`;
//       params.push(department_id);
//       paramIndex++;
//     }
    
//     query += ` ORDER BY lr.start_date ASC`;
    
//     const result = await pool.query(query, params);
    
//     res.json({ calendar: result.rows });
//   } catch (error) {
//     console.error('Get leave calendar error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get sick leave 3-year cycle report
// router.get('/reports/sick-leave-cycle', authenticateToken, checkPermission('view_leave_reports'), async (req, res) => {
//   try {
//     const currentYear = new Date().getFullYear();
//     const cycleStartYear = currentYear - 2;
    
//     const result = await pool.query(
//       `SELECT 
//         u.id as "userId",
//         u.name,
//         COALESCE(SUM(lr.number_of_days), 0) as "usedInCycle"
//       FROM users u
//       LEFT JOIN leave_requests lr ON lr.user_id = u.id 
//         AND lr.leave_type = 'sick'
//         AND lr.status = 'approved'
//         AND EXTRACT(YEAR FROM lr.start_date) >= $1
//       GROUP BY u.id, u.name
//       ORDER BY u.name`,
//       [cycleStartYear]
//     );
    
//     res.json({ 
//       report: result.rows,
//       cycleYears: `${cycleStartYear} - ${currentYear}`
//     });
//   } catch (error) {
//     console.error('Error fetching sick leave cycle report:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get leave liability (total unused leave)
// router.get('/reports/liability', authenticateToken, checkPermission('view_leave_reports'), async (req, res) => {
//   try {
//     const { year } = req.query;
//     const currentYear = year || new Date().getFullYear();
    
//     const result = await pool.query(
//       `SELECT 
//         SUM(remaining_days) as "totalUnusedDays",
//         leave_type as "leaveType",
//         COUNT(DISTINCT user_id) as "employeeCount"
//       FROM employee_leave_balances
//       WHERE year = $1
//       GROUP BY leave_type`,
//       [currentYear]
//     );
    
//     res.json({ 
//       liability: result.rows,
//       year: currentYear
//     });
//   } catch (error) {
//     console.error('Get leave liability error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// export default router;

// server/routes/leave.routes.js
import express from 'express';
import { pool } from '../index.js';
import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';
import { verifyTenantAccess } from '../middleware/tenantMiddleware.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// ✅ Apply authentication and tenant verification to all routes
router.use(authenticateToken);
router.use(verifyTenantAccess);

// ==================== LEAVE MANAGEMENT ROUTES ====================

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

// Get leave balances for an employee
router.get('/balances/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const companyId = req.companyId;
    const { year } = req.query;
    
    // ✅ Verify user belongs to same company
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
    
    // ✅ Filter by company
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
      FROM employee_leave_balances
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

// Get leave balance summary for all employees (admin/hr only)
router.get('/balances/summary/all', checkPermission('view_leave_reports'), async (req, res) => {
  try {
    const companyId = req.companyId;
    const { year, department_id } = req.query;
    const currentYear = year || new Date().getFullYear();
    
    let query = `
      SELECT 
        u.id as "userId",
        u.name as "employeeName",
        ep.employee_number as "employeeNumber",
        d.name as "departmentName",
        elb.leave_type as "leaveType",
        elb.total_days as "totalDays",
        elb.used_days as "usedDays",
        elb.remaining_days as "remainingDays"
      FROM employee_leave_balances elb
      JOIN users u ON elb.user_id = u.id
      JOIN employee_profiles ep ON ep.user_id = u.id
      LEFT JOIN departments d ON ep.department_id = d.id AND d.company_id = $1
      WHERE elb.year = $2
        AND ep.employment_status = 'active'
        AND elb.company_id = $1
        AND u.company_id = $1
        AND ep.company_id = $1
    `;
    
    const params = [companyId, currentYear];
    let paramIndex = 3;
    
    if (department_id) {
      query += ` AND ep.department_id = $${paramIndex}`;
      params.push(department_id);
      paramIndex++;
    }
    
    query += ` ORDER BY u.name ASC, elb.leave_type ASC`;
    
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

// Update leave balance (admin only - for adjustments)
router.put(
  '/balances/:id',
  checkPermission('manage_employees'),
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
      
      // ✅ Get current balance (verify company)
      const current = await pool.query(
        'SELECT total_days, used_days FROM employee_leave_balances WHERE id = $1 AND company_id = $2',
        [id, companyId]
      );
      
      if (current.rows.length === 0) {
        return res.status(404).json({ error: 'Leave balance not found' });
      }
      
      const newTotal = totalDays !== undefined ? totalDays : parseFloat(current.rows[0].total_days);
      const newUsed = usedDays !== undefined ? usedDays : parseFloat(current.rows[0].used_days);
      const newRemaining = newTotal - newUsed;
      
      // ✅ Filter by company
      const result = await pool.query(
        `UPDATE employee_leave_balances
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

// Initialize leave balances for new year (admin only)
router.post(
  '/balances/initialize/:userId',
  checkPermission('manage_employees'),
  body('year').isInt({ min: 2020, max: 2100 }),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const companyId = req.companyId;
      const { year } = req.body;
      
      // ✅ Verify user belongs to same company
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND company_id = $2',
        [userId, companyId]
      );
      
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      // ✅ Check if balances already exist (in same company)
      const existing = await pool.query(
        'SELECT id FROM employee_leave_balances WHERE user_id = $1 AND year = $2 AND company_id = $3',
        [userId, year, companyId]
      );
      
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Leave balances already initialized for this year' });
      }
      
      // ✅ Initialize with company_id
      const result = await pool.query(
        `INSERT INTO employee_leave_balances (user_id, leave_type, total_days, remaining_days, year, company_id)
         VALUES 
           ($1, 'annual', 21, 21, $2, $3),
           ($1, 'sick', 30, 30, $2, $3),
           ($1, 'unpaid', 0, 0, $2, $3)
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
        ep.employee_number as "employeeNumber",
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
      JOIN employee_profiles ep ON ep.user_id = u.id
      LEFT JOIN departments d ON ep.department_id = d.id AND d.company_id = $1
      LEFT JOIN users approver ON lr.reviewed_by = approver.id AND approver.company_id = $1
      WHERE lr.company_id = $1 
        AND u.company_id = $1 
        AND ep.company_id = $1
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
        ep.employee_number as "employeeNumber",
        d.name as "departmentName",
        jp.title as "jobTitle",
        approver.name as "approverName",
        approver.email as "approverEmail"
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      JOIN employee_profiles ep ON ep.user_id = u.id
      LEFT JOIN departments d ON ep.department_id = d.id AND d.company_id = $2
      LEFT JOIN job_positions jp ON ep.job_position_id = jp.id AND jp.company_id = $2
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
      
      // ✅ Check leave balance (same company)
      const currentYear = start.getFullYear();
      const balance = await pool.query(
        `SELECT remaining_days 
         FROM employee_leave_balances 
         WHERE user_id = $1 AND leave_type = $2 AND year = $3 AND company_id = $4`,
        [userId, leaveType, currentYear, companyId]
      );
      
      if (balance.rows.length === 0) {
        return res.status(400).json({ error: 'Leave balance not found for this leave type' });
      }
      
      const remainingDays = parseFloat(balance.rows[0].remaining_days);
      
      if (leaveType !== 'unpaid' && totalDays > remainingDays) {
        return res.status(400).json({ 
          error: 'Insufficient leave balance',
          requested: totalDays,
          available: remainingDays
        });
      }
      
      // ✅ Check for overlapping leave requests (same company)
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
      
      // ✅ Create leave request with company_id
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
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Approve leave request
router.post(
  '/requests/:id/approve',
  checkPermission('approve_leave'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.companyId;
      
      // ✅ Get leave request details (verify company)
      const request = await pool.query(
        `SELECT lr.*, elb.remaining_days
         FROM leave_requests lr
         JOIN employee_leave_balances elb ON elb.user_id = lr.user_id 
           AND elb.leave_type = lr.leave_type 
           AND elb.year = EXTRACT(YEAR FROM lr.start_date)
           AND elb.company_id = lr.company_id
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
      
      // ✅ Special handling for sick leave - check 3-year cycle (same company)
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
        // ✅ Update leave request status (verify company)
        await pool.query(
          `UPDATE leave_requests
           SET status = 'approved',
               reviewed_by = $1,
               reviewed_at = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2 AND company_id = $3`,
          [req.user.id, id, companyId]
        );
        
        // ✅ Deduct from leave balance (verify company)
        if (leaveRequest.leave_type !== 'unpaid') {
          await pool.query(
            `UPDATE employee_leave_balances
             SET used_days = used_days + $1,
                 remaining_days = remaining_days - $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $2 
               AND leave_type = $3 
               AND year = EXTRACT(YEAR FROM $4::date)
               AND company_id = $5`,
            [leaveRequest.days_requested, leaveRequest.user_id, leaveRequest.leave_type, leaveRequest.start_date, companyId]
          );
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
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Reject leave request
router.post(
  '/requests/:id/reject',
  checkPermission('approve_leave'),
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
      
      // ✅ Get leave request (verify company)
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
      
      // ✅ Update leave request (verify company)
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
    
    // ✅ Filter by company
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
    
    // ✅ Pending approvals (company only)
    const pending = await pool.query(
      "SELECT COUNT(*) FROM leave_requests WHERE status = 'pending' AND company_id = $1",
      [companyId]
    );
    
    // ✅ On leave today (company only)
    const onLeave = await pool.query(
      `SELECT COUNT(DISTINCT user_id) FROM leave_requests 
       WHERE status = 'approved' AND start_date <= $1 AND end_date >= $1 AND company_id = $2`,
      [today, companyId]
    );
    
    // ✅ This month (company only)
    const month = await pool.query(
      `SELECT COUNT(*) FROM leave_requests 
       WHERE status = 'approved' AND start_date >= $1 AND company_id = $2`,
      [firstDayOfMonth, companyId]
    );
    
    // ✅ Year total (company only)
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
    
    // ✅ Verify user belongs to same company
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
    
    // ✅ Leave taken by type (same company)
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
    
    // ✅ Pending requests (same company)
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
router.get('/reports/department/:departmentId', checkPermission('view_leave_reports'), async (req, res) => {
  try {
    const { departmentId } = req.params;
    const companyId = req.companyId;
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();
    
    // ✅ Filter by company
    const result = await pool.query(
      `SELECT 
        u.name as "employeeName",
        ep.employee_number as "employeeNumber",
        SUM(CASE WHEN lr.status = 'approved' THEN lr.days_requested ELSE 0 END) as "daysTaken",
        COUNT(CASE WHEN lr.status = 'pending' THEN 1 END) as "pendingRequests",
        elb_annual.remaining_days as "annualLeaveRemaining",
        elb_sick.remaining_days as "sickLeaveRemaining"
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      LEFT JOIN leave_requests lr ON lr.user_id = u.id 
        AND EXTRACT(YEAR FROM lr.start_date) = $2
        AND lr.company_id = $3
      LEFT JOIN employee_leave_balances elb_annual ON elb_annual.user_id = u.id 
        AND elb_annual.leave_type = 'annual' 
        AND elb_annual.year = $2
        AND elb_annual.company_id = $3
      LEFT JOIN employee_leave_balances elb_sick ON elb_sick.user_id = u.id 
        AND elb_sick.leave_type = 'sick' 
        AND elb_sick.year = $2
        AND elb_sick.company_id = $3
      WHERE ep.department_id = $1
        AND ep.employment_status = 'active'
        AND ep.company_id = $3
        AND u.company_id = $3
      GROUP BY u.name, ep.employee_number, elb_annual.remaining_days, elb_sick.remaining_days
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
router.get('/calendar', checkPermission('view_leave_reports'), async (req, res) => {
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
      JOIN employee_profiles ep ON ep.user_id = u.id
      LEFT JOIN departments d ON ep.department_id = d.id AND d.company_id = $1
      WHERE lr.status = 'approved' 
        AND lr.company_id = $1
        AND u.company_id = $1
        AND ep.company_id = $1
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
      query += ` AND ep.department_id = $${paramIndex}`;
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
router.get('/reports/sick-leave-cycle', checkPermission('view_leave_reports'), async (req, res) => {
  try {
    const companyId = req.companyId;
    const currentYear = new Date().getFullYear();
    const cycleStartYear = currentYear - 2;
    
    // ✅ Filter by company
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
router.get('/reports/liability', checkPermission('view_leave_reports'), async (req, res) => {
  try {
    const companyId = req.companyId;
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();
    
    // ✅ Filter by company
    const result = await pool.query(
      `SELECT 
        SUM(remaining_days) as "totalUnusedDays",
        leave_type as "leaveType",
        COUNT(DISTINCT user_id) as "employeeCount"
      FROM employee_leave_balances
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