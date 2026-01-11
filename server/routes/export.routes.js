// import express from 'express';
// import { pool } from '../index.js';
// import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';

// const router = express.Router();

// // ==================== EXPORT ROUTES ====================

// // Export to CSV (Admin/HR only) - Africa/Harare timezone
// router.get('/csv', authenticateToken, checkPermission('export_data'), async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     console.log('📥 CSV Export Request:', { startDate, endDate });

//     // Add time to date range to capture full day
//     const start = startDate ? `${startDate} 00:00:00` : '2000-01-01 00:00:00';
//     const end = endDate ? `${endDate} 23:59:59` : '2100-01-01 23:59:59';

//     console.log('📅 Date range:', { start, end });

//     // ✅ Convert all timestamps to Africa/Harare timezone
//     const query = `
//       SELECT 
//         TO_CHAR(a.timestamp AT TIME ZONE 'Africa/Harare', 'YYYY-MM-DD') as date,
//         u.name as employee,
//         a.type as event_type,
//         TO_CHAR(a.timestamp AT TIME ZONE 'Africa/Harare', 'HH24:MI:SS') as time,
//         a.location,
//         CASE WHEN a.edited THEN 'Yes' ELSE 'No' END as edited
//       FROM attendance_logs a
//       JOIN users u ON a.user_id = u.id
//       WHERE (a.timestamp AT TIME ZONE 'Africa/Harare')::timestamp >= $1::timestamp 
//         AND (a.timestamp AT TIME ZONE 'Africa/Harare')::timestamp <= $2::timestamp
//       ORDER BY a.timestamp DESC
//     `;

//     const result = await pool.query(query, [start, end]);

//     console.log(`📊 Query returned ${result.rows.length} rows`);

//     if (result.rows.length === 0) {
//       console.log('⚠️ No data found for export');
//       // Return empty CSV with headers only
//       const csvHeader = 'Date (GMT+2),Employee,Event Type,Time (GMT+2),Location,Edited\n';
//       res.setHeader('Content-Type', 'text/csv');
//       res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
//       return res.send(csvHeader);
//     }

//     // Create CSV with timezone info in header
//     const csvHeader = 'Date (GMT+2),Employee,Event Type,Time (GMT+2),Location,Edited\n';
//     const csvRows = result.rows.map(row => 
//       `${row.date},${row.employee},${row.event_type},${row.time},${row.location || 'N/A'},${row.edited}`
//     ).join('\n');

//     const csv = csvHeader + csvRows;

//     console.log(`✅ CSV generated successfully (${csv.length} bytes)`);

//     res.setHeader('Content-Type', 'text/csv');
//     res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${startDate || 'all'}.csv`);
//     res.send(csv);
//   } catch (error) {
//     console.error('❌ Export CSV error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// export default router;

import express from 'express';
import { pool } from '../index.js';
import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';
import { verifyTenantAccess } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// ✅ Apply authentication and tenant verification to all routes
router.use(authenticateToken);
router.use(verifyTenantAccess);

// ==================== EXPORT ROUTES ====================

// Export to CSV (Admin/HR only) - Africa/Harare timezone
router.get('/csv', checkPermission('export_data'), async (req, res) => {
  try {
    const companyId = req.companyId;
    const { startDate, endDate } = req.query;

    console.log('📥 CSV Export Request:', { startDate, endDate, companyId });

    // Add time to date range to capture full day
    const start = startDate ? `${startDate} 00:00:00` : '2000-01-01 00:00:00';
    const end = endDate ? `${endDate} 23:59:59` : '2100-01-01 23:59:59';

    console.log('📅 Date range:', { start, end });

    // ✅ Filter by company_id and convert all timestamps to Africa/Harare timezone
    const query = `
      SELECT 
        TO_CHAR(a.timestamp AT TIME ZONE 'Africa/Harare', 'YYYY-MM-DD') as date,
        u.name as employee,
        a.type as event_type,
        TO_CHAR(a.timestamp AT TIME ZONE 'Africa/Harare', 'HH24:MI:SS') as time,
        a.location,
        CASE WHEN a.edited THEN 'Yes' ELSE 'No' END as edited
      FROM attendance_logs a
      JOIN users u ON a.user_id = u.id
      WHERE (a.timestamp AT TIME ZONE 'Africa/Harare')::timestamp >= $1::timestamp 
        AND (a.timestamp AT TIME ZONE 'Africa/Harare')::timestamp <= $2::timestamp
        AND a.company_id = $3
        AND u.company_id = $3
      ORDER BY a.timestamp DESC
    `;

    const result = await pool.query(query, [start, end, companyId]);

    console.log(`📊 Query returned ${result.rows.length} rows for company ${companyId}`);

    if (result.rows.length === 0) {
      console.log('⚠️ No data found for export');
      // Return empty CSV with headers only
      const csvHeader = 'Date (GMT+2),Employee,Event Type,Time (GMT+2),Location,Edited\n';
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
      return res.send(csvHeader);
    }

    // Create CSV with timezone info in header
    const csvHeader = 'Date (GMT+2),Employee,Event Type,Time (GMT+2),Location,Edited\n';
    const csvRows = result.rows.map(row => 
      `${row.date},${row.employee},${row.event_type},${row.time},${row.location || 'N/A'},${row.edited}`
    ).join('\n');

    const csv = csvHeader + csvRows;

    console.log(`✅ CSV generated successfully (${csv.length} bytes) for company ${companyId}`);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=attendance-report-${startDate || 'all'}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('❌ Export CSV error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Export employee data to CSV (Admin/HR only)
router.get('/employees/csv', checkPermission('export_data'), async (req, res) => {
  try {
    const companyId = req.companyId;
    const { department_id, employment_status } = req.query;

    console.log('📥 Employee Export Request:', { companyId, department_id, employment_status });

    let query = `
      SELECT 
        ep.employee_number as "Employee Number",
        CONCAT(ep.first_name, ' ', ep.last_name) as "Full Name",
        u.email as "Email",
        d.name as "Department",
        jp.title as "Job Title",
        ep.employment_type as "Employment Type",
        ep.employment_status as "Status",
        TO_CHAR(ep.hire_date, 'YYYY-MM-DD') as "Hire Date",
        ep.phone_number as "Phone",
        ep.work_location as "Work Location"
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      LEFT JOIN departments d ON ep.department_id = d.id
      LEFT JOIN job_positions jp ON ep.job_position_id = jp.id
      WHERE ep.company_id = $1 AND u.company_id = $1
    `;

    const params = [companyId];
    let paramIndex = 2;

    if (department_id) {
      query += ` AND ep.department_id = $${paramIndex}`;
      params.push(department_id);
      paramIndex++;
    }

    if (employment_status) {
      query += ` AND ep.employment_status = $${paramIndex}`;
      params.push(employment_status);
      paramIndex++;
    }

    query += ` ORDER BY ep.first_name ASC, ep.last_name ASC`;

    const result = await pool.query(query, params);

    console.log(`📊 Employee export: ${result.rows.length} rows for company ${companyId}`);

    if (result.rows.length === 0) {
      const csvHeader = 'Employee Number,Full Name,Email,Department,Job Title,Employment Type,Status,Hire Date,Phone,Work Location\n';
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=employees-report.csv');
      return res.send(csvHeader);
    }

    // Create CSV
    const csvHeader = 'Employee Number,Full Name,Email,Department,Job Title,Employment Type,Status,Hire Date,Phone,Work Location\n';
    const csvRows = result.rows.map(row => 
      `${row["Employee Number"]},${row["Full Name"]},${row["Email"]},${row["Department"] || 'N/A'},${row["Job Title"] || 'N/A'},${row["Employment Type"]},${row["Status"]},${row["Hire Date"]},${row["Phone"] || 'N/A'},${row["Work Location"] || 'N/A'}`
    ).join('\n');

    const csv = csvHeader + csvRows;

    console.log(`✅ Employee CSV generated (${csv.length} bytes) for company ${companyId}`);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=employees-report-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('❌ Export employees CSV error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Export leave requests to CSV (Admin/HR only)
router.get('/leave/csv', checkPermission('export_data'), async (req, res) => {
  try {
    const companyId = req.companyId;
    const { startDate, endDate, status } = req.query;

    console.log('📥 Leave Export Request:', { companyId, startDate, endDate, status });

    let query = `
      SELECT 
        u.name as "Employee Name",
        ep.employee_number as "Employee Number",
        lr.leave_type as "Leave Type",
        TO_CHAR(lr.start_date, 'YYYY-MM-DD') as "Start Date",
        TO_CHAR(lr.end_date, 'YYYY-MM-DD') as "End Date",
        lr.days_requested as "Days",
        lr.status as "Status",
        lr.reason as "Reason",
        approver.name as "Approved By",
        TO_CHAR(lr.reviewed_at, 'YYYY-MM-DD') as "Review Date"
      FROM leave_requests lr
      JOIN users u ON lr.user_id = u.id
      LEFT JOIN employee_profiles ep ON lr.user_id = ep.user_id
      LEFT JOIN users approver ON lr.reviewed_by = approver.id
      WHERE lr.company_id = $1 AND u.company_id = $1
    `;

    const params = [companyId];
    let paramIndex = 2;

    if (startDate) {
      query += ` AND lr.start_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND lr.end_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (status) {
      query += ` AND lr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY lr.start_date DESC`;

    const result = await pool.query(query, params);

    console.log(`📊 Leave export: ${result.rows.length} rows for company ${companyId}`);

    if (result.rows.length === 0) {
      const csvHeader = 'Employee Name,Employee Number,Leave Type,Start Date,End Date,Days,Status,Reason,Approved By,Review Date\n';
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=leave-report.csv');
      return res.send(csvHeader);
    }

    // Create CSV
    const csvHeader = 'Employee Name,Employee Number,Leave Type,Start Date,End Date,Days,Status,Reason,Approved By,Review Date\n';
    const csvRows = result.rows.map(row => 
      `${row["Employee Name"]},${row["Employee Number"]},${row["Leave Type"]},${row["Start Date"]},${row["End Date"]},${row["Days"]},${row["Status"]},"${row["Reason"] || 'N/A'}",${row["Approved By"] || 'Pending'},${row["Review Date"] || 'N/A'}`
    ).join('\n');

    const csv = csvHeader + csvRows;

    console.log(`✅ Leave CSV generated (${csv.length} bytes) for company ${companyId}`);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=leave-report-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('❌ Export leave CSV error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Export payroll data to CSV (Admin/HR only)
router.get('/payroll/csv', checkPermission('export_data'), async (req, res) => {
  try {
    const companyId = req.companyId;
    const { month, year } = req.query;

    console.log('📥 Payroll Export Request:', { companyId, month, year });

    const query = `
      SELECT 
        u.name as "Employee Name",
        ep.employee_number as "Employee Number",
        d.name as "Department",
        ec.base_salary as "Base Salary",
        ec.salary_type as "Salary Type",
        ec.payment_frequency as "Payment Frequency",
        ec.currency as "Currency"
      FROM employee_compensation ec
      JOIN users u ON ec.user_id = u.id
      LEFT JOIN employee_profiles ep ON ec.user_id = ep.user_id
      LEFT JOIN departments d ON ep.department_id = d.id
      WHERE ec.is_current = true 
        AND ec.company_id = $1 
        AND u.company_id = $1
        AND ep.employment_status = 'active'
      ORDER BY d.name ASC, u.name ASC
    `;

    const result = await pool.query(query, [companyId]);

    console.log(`📊 Payroll export: ${result.rows.length} rows for company ${companyId}`);

    if (result.rows.length === 0) {
      const csvHeader = 'Employee Name,Employee Number,Department,Base Salary,Salary Type,Payment Frequency,Currency\n';
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=payroll-report.csv');
      return res.send(csvHeader);
    }

    // Create CSV
    const csvHeader = 'Employee Name,Employee Number,Department,Base Salary,Salary Type,Payment Frequency,Currency\n';
    const csvRows = result.rows.map(row => 
      `${row["Employee Name"]},${row["Employee Number"]},${row["Department"] || 'N/A'},${row["Base Salary"]},${row["Salary Type"]},${row["Payment Frequency"]},${row["Currency"]}`
    ).join('\n');

    const csv = csvHeader + csvRows;

    console.log(`✅ Payroll CSV generated (${csv.length} bytes) for company ${companyId}`);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=payroll-report-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('❌ Export payroll CSV error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;