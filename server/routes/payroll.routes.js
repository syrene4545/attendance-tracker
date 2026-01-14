// // server/routes/payroll.routes.js
// import express from 'express';
// import { pool } from '../index.js';
// import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';
// import { verifyTenantAccess } from '../middleware/tenantMiddleware.js';
// import { body, validationResult } from 'express-validator';

// const router = express.Router();

// // ✅ Apply authentication and tenant verification to all routes
// router.use(authenticateToken);
// router.use(verifyTenantAccess);

// // ==================== PAYROLL PROCESSING ROUTES ====================

// // ==================== TAX CALCULATIONS ====================

// // South African PAYE (Pay As You Earn) Tax Tables 2025/2026
// const calculatePAYE = (annualIncome) => {
//   // South African tax brackets 2025/2026
//   const taxBrackets = [
//     { threshold: 0, rate: 0.18, deduction: 0 },
//     { threshold: 237100, rate: 0.26, deduction: 42678 },
//     { threshold: 370500, rate: 0.31, deduction: 77362 },
//     { threshold: 512800, rate: 0.36, deduction: 103000 },
//     { threshold: 673000, rate: 0.39, deduction: 146000 },
//     { threshold: 857900, rate: 0.41, deduction: 207000 },
//     { threshold: 1817000, rate: 0.45, deduction: 279000 }
//   ];
  
//   // Primary rebate for 2025/2026
//   const primaryRebate = 17235;
  
//   let taxableIncome = annualIncome;
//   let tax = 0;
  
//   // Find applicable bracket
//   for (let i = taxBrackets.length - 1; i >= 0; i--) {
//     if (taxableIncome >= taxBrackets[i].threshold) {
//       tax = (taxableIncome * taxBrackets[i].rate) - taxBrackets[i].deduction;
//       break;
//     }
//   }
  
//   // Apply primary rebate
//   tax = Math.max(0, tax - primaryRebate);
  
//   return tax;
// };

// // Calculate UIF (Unemployment Insurance Fund)
// const calculateUIF = (monthlyIncome) => {
//   // UIF is 1% of salary, capped at R177.12 (based on max of R17,712)
//   const uifRate = 0.01;
//   const maxUIF = 177.12;
//   const uif = Math.min(monthlyIncome * uifRate, maxUIF);
//   return uif;
// };

// // ==================== PAYROLL CALCULATION ====================

// // Calculate employee payroll for a specific month
// router.post(
//   '/calculate/:userId',
//   checkPermission('view_payroll'),
//   body('month').isInt({ min: 1, max: 12 }),
//   body('year').isInt({ min: 2020, max: 2100 }),
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ error: 'Invalid input', details: errors.array() });
//       }
      
//       const { userId } = req.params;
//       const companyId = req.companyId;
//       const { month, year } = req.body;
      
//       // ✅ Verify user belongs to same company
//       const userCheck = await pool.query(
//         'SELECT id FROM users WHERE id = $1 AND company_id = $2',
//         [userId, companyId]
//       );
      
//       if (userCheck.rows.length === 0) {
//         return res.status(404).json({ error: 'Employee not found' });
//       }
      
//       // ✅ Get employee details (filter by company)
//       const employee = await pool.query(
//         `SELECT 
//           u.id,
//           u.name,
//           u.email,
//           ep.employee_number as "employeeNumber",
//           ep.first_name as "firstName",
//           ep.last_name as "lastName",
//           d.name as "departmentName",
//           jp.title as "jobTitle"
//         FROM users u
//         JOIN employee_profiles ep ON ep.user_id = u.id
//         LEFT JOIN departments d ON ep.department_id = d.id AND d.company_id = $2
//         LEFT JOIN job_positions jp ON ep.job_position_id = jp.id AND jp.company_id = $2
//         WHERE u.id = $1 AND u.company_id = $2 AND ep.company_id = $2`,
//         [userId, companyId]
//       );
      
//       if (employee.rows.length === 0) {
//         return res.status(404).json({ error: 'Employee not found' });
//       }
      
//       const emp = employee.rows[0];
      
//       // ✅ Get current compensation (filter by company)
//       const compensation = await pool.query(
//         `SELECT 
//           base_salary as "baseSalary",
//           salary_type as "salaryType",
//           payment_frequency as "paymentFrequency"
//         FROM employee_compensation
//         WHERE user_id = $1 AND is_current = true AND company_id = $2`,
//         [userId, companyId]
//       );
      
//       if (compensation.rows.length === 0) {
//         return res.status(404).json({ error: 'No compensation record found' });
//       }
      
//       const baseSalary = parseFloat(compensation.rows[0].baseSalary);
      
//       // ✅ Get active allowances (filter by company)
//       const allowances = await pool.query(
//         `SELECT 
//           allowance_type as "allowanceType",
//           amount,
//           is_taxable as "isTaxable"
//         FROM employee_allowances
//         WHERE user_id = $1 AND is_active = true AND company_id = $2`,
//         [userId, companyId]
//       );
      
//       // Calculate total allowances
//       let totalTaxableAllowances = 0;
//       let totalNonTaxableAllowances = 0;
      
//       allowances.rows.forEach(allowance => {
//         const amount = parseFloat(allowance.amount);
//         if (allowance.isTaxable) {
//           totalTaxableAllowances += amount;
//         } else {
//           totalNonTaxableAllowances += amount;
//         }
//       });
      
//       // ✅ Get active deductions (filter by company)
//       const deductions = await pool.query(
//         `SELECT 
//           deduction_type as "deductionType",
//           amount,
//           percentage,
//           is_percentage as "isPercentage",
//           is_mandatory as "isMandatory"
//         FROM employee_deductions
//         WHERE user_id = $1 AND is_active = true AND company_id = $2`,
//         [userId, companyId]
//       );
      
//       // Calculate gross pay (before tax)
//       const grossPay = baseSalary + totalTaxableAllowances;
      
//       // Calculate annual income for PAYE
//       const annualIncome = grossPay * 12;
//       const annualPAYE = calculatePAYE(annualIncome);
//       const monthlyPAYE = annualPAYE / 12;
      
//       // Calculate UIF
//       const uif = calculateUIF(grossPay);
      
//       // Calculate other deductions
//       let totalDeductions = monthlyPAYE + uif;
//       const deductionDetails = [];
      
//       // Add PAYE and UIF to deduction details
//       deductionDetails.push({
//         type: 'PAYE',
//         amount: monthlyPAYE.toFixed(2),
//         isMandatory: true
//       });
      
//       deductionDetails.push({
//         type: 'UIF',
//         amount: uif.toFixed(2),
//         isMandatory: true
//       });
      
//       // Process other deductions
//       deductions.rows.forEach(deduction => {
//         let deductionAmount = 0;
        
//         if (deduction.isPercentage) {
//           deductionAmount = grossPay * (parseFloat(deduction.percentage) / 100);
//         } else {
//           deductionAmount = parseFloat(deduction.amount || 0);
//         }
        
//         totalDeductions += deductionAmount;
        
//         deductionDetails.push({
//           type: deduction.deductionType,
//           amount: deductionAmount.toFixed(2),
//           isMandatory: deduction.isMandatory
//         });
//       });
      
//       // Calculate net pay
//       const netPay = baseSalary + totalTaxableAllowances + totalNonTaxableAllowances - totalDeductions;
      
//       // Prepare payroll calculation
//       const payrollCalculation = {
//         employee: {
//           id: emp.id,
//           name: emp.name,
//           employeeNumber: emp.employeeNumber,
//           department: emp.departmentName,
//           jobTitle: emp.jobTitle
//         },
//         period: {
//           month,
//           year,
//           monthName: new Date(year, month - 1).toLocaleString('en-US', { month: 'long' })
//         },
//         earnings: {
//           baseSalary: baseSalary.toFixed(2),
//           allowances: allowances.rows.map(a => ({
//             type: a.allowanceType,
//             amount: parseFloat(a.amount).toFixed(2),
//             taxable: a.isTaxable
//           })),
//           totalTaxableAllowances: totalTaxableAllowances.toFixed(2),
//           totalNonTaxableAllowances: totalNonTaxableAllowances.toFixed(2),
//           grossPay: grossPay.toFixed(2)
//         },
//         deductions: {
//           items: deductionDetails,
//           totalDeductions: totalDeductions.toFixed(2)
//         },
//         summary: {
//           grossPay: grossPay.toFixed(2),
//           totalDeductions: totalDeductions.toFixed(2),
//           netPay: netPay.toFixed(2)
//         }
//       };
      
//       res.json({ payroll: payrollCalculation });
//     } catch (error) {
//       console.error('❌ Calculate payroll error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // ==================== PAYROLL RUNS ====================

// // Create payroll run table if it doesn't exist (should be in migration)
// const ensurePayrollTables = async () => {
//   await pool.query(`
//     CREATE TABLE IF NOT EXISTS payroll_runs (
//       id SERIAL PRIMARY KEY,
//       month INTEGER NOT NULL,
//       year INTEGER NOT NULL,
//       status VARCHAR(50) DEFAULT 'draft',
//       total_employees INTEGER DEFAULT 0,
//       total_gross_pay DECIMAL(12,2) DEFAULT 0,
//       total_deductions DECIMAL(12,2) DEFAULT 0,
//       total_net_pay DECIMAL(12,2) DEFAULT 0,
//       processed_by INTEGER REFERENCES users(id),
//       processed_at TIMESTAMP,
//       notes TEXT,
//       company_id INTEGER REFERENCES companies(id),
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       UNIQUE(month, year, company_id)
//     );
    
//     CREATE TABLE IF NOT EXISTS payroll_items (
//       id SERIAL PRIMARY KEY,
//       payroll_run_id INTEGER REFERENCES payroll_runs(id) ON DELETE CASCADE,
//       user_id INTEGER REFERENCES users(id),
//       employee_number VARCHAR(50),
//       employee_name VARCHAR(255),
//       department VARCHAR(255),
//       base_salary DECIMAL(10,2),
//       allowances DECIMAL(10,2),
//       gross_pay DECIMAL(10,2),
//       paye DECIMAL(10,2),
//       uif DECIMAL(10,2),
//       other_deductions DECIMAL(10,2),
//       total_deductions DECIMAL(10,2),
//       net_pay DECIMAL(10,2),
//       payment_status VARCHAR(50) DEFAULT 'pending',
//       payment_date DATE,
//       payment_reference VARCHAR(255),
//       notes TEXT,
//       company_id INTEGER REFERENCES companies(id),
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     );
    
//     CREATE INDEX IF NOT EXISTS idx_payroll_runs_period ON payroll_runs(year, month);
//     CREATE INDEX IF NOT EXISTS idx_payroll_runs_company ON payroll_runs(company_id);
//     CREATE INDEX IF NOT EXISTS idx_payroll_items_run ON payroll_items(payroll_run_id);
//     CREATE INDEX IF NOT EXISTS idx_payroll_items_user ON payroll_items(user_id);
//     CREATE INDEX IF NOT EXISTS idx_payroll_items_company ON payroll_items(company_id);
//   `);
// };

// // Initialize tables on module load
// ensurePayrollTables().catch(console.error);

// // Get all payroll runs
// router.get('/runs', checkPermission('view_payroll'), async (req, res) => {
//   try {
//     const companyId = req.companyId;
//     const { year, status } = req.query;
    
//     let query = `
//       SELECT 
//         pr.id,
//         pr.month,
//         pr.year,
//         pr.status,
//         pr.total_employees as "totalEmployees",
//         pr.total_gross_pay as "totalGrossPay",
//         pr.total_deductions as "totalDeductions",
//         pr.total_net_pay as "totalNetPay",
//         pr.processed_by as "processedBy",
//         u.name as "processedByName",
//         pr.processed_at as "processedAt",
//         pr.created_at as "createdAt"
//       FROM payroll_runs pr
//       LEFT JOIN users u ON pr.processed_by = u.id AND u.company_id = $1
//       WHERE pr.company_id = $1
//     `;
    
//     const params = [companyId];
//     let paramIndex = 2;
    
//     if (year) {
//       query += ` AND pr.year = $${paramIndex}`;
//       params.push(year);
//       paramIndex++;
//     }
    
//     if (status) {
//       query += ` AND pr.status = $${paramIndex}`;
//       params.push(status);
//       paramIndex++;
//     }
    
//     query += ` ORDER BY pr.year DESC, pr.month DESC`;
    
//     const result = await pool.query(query, params);
    
//     res.json({ runs: result.rows });
//   } catch (error) {
//     console.error('❌ Get payroll runs error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get single payroll run with details
// router.get('/runs/:id', checkPermission('view_payroll'), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const companyId = req.companyId;
    
//     // ✅ Get run details (filter by company)
//     const run = await pool.query(
//       `SELECT 
//         pr.*,
//         u.name as "processedByName"
//       FROM payroll_runs pr
//       LEFT JOIN users u ON pr.processed_by = u.id AND u.company_id = $2
//       WHERE pr.id = $1 AND pr.company_id = $2`,
//       [id, companyId]
//     );
    
//     if (run.rows.length === 0) {
//       return res.status(404).json({ error: 'Payroll run not found' });
//     }
    
//     // ✅ Get payroll items (filter by company)
//     const items = await pool.query(
//       `SELECT 
//         pi.*,
//         pi.user_id as "userId",
//         pi.employee_number as "employeeNumber",
//         pi.employee_name as "employeeName",
//         pi.base_salary as "baseSalary",
//         pi.gross_pay as "grossPay",
//         pi.other_deductions as "otherDeductions",
//         pi.total_deductions as "totalDeductions",
//         pi.net_pay as "netPay",
//         pi.payment_status as "paymentStatus",
//         pi.payment_date as "paymentDate",
//         pi.payment_reference as "paymentReference"
//       FROM payroll_items pi
//       WHERE pi.payroll_run_id = $1 AND pi.company_id = $2
//       ORDER BY pi.employee_name ASC`,
//       [id, companyId]
//     );
    
//     res.json({
//       run: run.rows[0],
//       items: items.rows
//     });
//   } catch (error) {
//     console.error('❌ Get payroll run error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Process payroll for a month (create payroll run)
// router.post(
//   '/runs/process',
//   checkPermission('process_payroll'),
//   body('month').isInt({ min: 1, max: 12 }),
//   body('year').isInt({ min: 2020, max: 2100 }),
//   body('departmentId').optional().isInt(),
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ error: 'Invalid input', details: errors.array() });
//       }
      
//       const { month, year, departmentId, notes } = req.body;
//       const companyId = req.companyId;
      
//       // ✅ Check if payroll already processed for this period (in this company)
//       const existing = await pool.query(
//         'SELECT id FROM payroll_runs WHERE month = $1 AND year = $2 AND company_id = $3',
//         [month, year, companyId]
//       );
      
//       if (existing.rows.length > 0) {
//         return res.status(400).json({ 
//           error: 'Payroll already processed for this period',
//           existingRunId: existing.rows[0].id
//         });
//       }
      
//       // ✅ Get active employees (filter by company)
//       let employeeQuery = `
//         SELECT 
//           u.id,
//           u.name,
//           ep.employee_number,
//           d.name as department,
//           ec.base_salary
//         FROM users u
//         JOIN employee_profiles ep ON ep.user_id = u.id
//         JOIN employee_compensation ec ON ec.user_id = u.id AND ec.is_current = true AND ec.company_id = $1
//         LEFT JOIN departments d ON ep.department_id = d.id AND d.company_id = $1
//         WHERE ep.employment_status = 'active' 
//           AND u.company_id = $1 
//           AND ep.company_id = $1
//       `;
      
//       const params = [companyId];
//       if (departmentId) {
//         employeeQuery += ' AND ep.department_id = $2';
//         params.push(departmentId);
//       }
      
//       employeeQuery += ' ORDER BY u.name ASC';
      
//       const employees = await pool.query(employeeQuery, params);
      
//       if (employees.rows.length === 0) {
//         return res.status(400).json({ error: 'No active employees found' });
//       }
      
//       // Begin transaction
//       await pool.query('BEGIN');
      
//       try {
//         // ✅ Create payroll run with company_id
//         const runResult = await pool.query(
//           `INSERT INTO payroll_runs (month, year, status, processed_by, notes, company_id)
//            VALUES ($1, $2, 'draft', $3, $4, $5)
//            RETURNING id`,
//           [month, year, req.user.id, notes || null, companyId]
//         );
        
//         const payrollRunId = runResult.rows[0].id;
        
//         let totalGrossPay = 0;
//         let totalDeductions = 0;
//         let totalNetPay = 0;
        
//         // Process each employee
//         for (const emp of employees.rows) {
//           // ✅ Get allowances (filter by company)
//           const allowances = await pool.query(
//             `SELECT SUM(amount) as total
//              FROM employee_allowances
//              WHERE user_id = $1 AND is_active = true AND company_id = $2`,
//             [emp.id, companyId]
//           );
          
//           const totalAllowances = parseFloat(allowances.rows[0].total || 0);
//           const baseSalary = parseFloat(emp.base_salary);
//           const grossPay = baseSalary + totalAllowances;
          
//           // Calculate PAYE
//           const annualIncome = grossPay * 12;
//           const annualPAYE = calculatePAYE(annualIncome);
//           const monthlyPAYE = annualPAYE / 12;
          
//           // Calculate UIF
//           const uif = calculateUIF(grossPay);
          
//           // ✅ Get other deductions (filter by company)
//           const deductions = await pool.query(
//             `SELECT 
//               SUM(CASE 
//                 WHEN is_percentage = true 
//                 THEN $1 * (percentage / 100)
//                 ELSE amount
//               END) as total
//              FROM employee_deductions
//              WHERE user_id = $2 AND is_active = true AND company_id = $3`,
//             [grossPay, emp.id, companyId]
//           );
          
//           const otherDeductions = parseFloat(deductions.rows[0].total || 0);
//           const totalEmpDeductions = monthlyPAYE + uif + otherDeductions;
//           const netPay = grossPay - totalEmpDeductions;
          
//           // ✅ Insert payroll item with company_id
//           await pool.query(
//             `INSERT INTO payroll_items (
//               payroll_run_id, user_id, employee_number, employee_name, department,
//               base_salary, allowances, gross_pay, paye, uif, other_deductions,
//               total_deductions, net_pay, payment_status, company_id
//             )
//             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending', $14)`,
//             [
//               payrollRunId,
//               emp.id,
//               emp.employee_number,
//               emp.name,
//               emp.department,
//               baseSalary,
//               totalAllowances,
//               grossPay,
//               monthlyPAYE,
//               uif,
//               otherDeductions,
//               totalEmpDeductions,
//               netPay,
//               companyId
//             ]
//           );
          
//           totalGrossPay += grossPay;
//           totalDeductions += totalEmpDeductions;
//           totalNetPay += netPay;
//         }
        
//         // Update payroll run totals
//         await pool.query(
//           `UPDATE payroll_runs
//            SET total_employees = $1,
//                total_gross_pay = $2,
//                total_deductions = $3,
//                total_net_pay = $4,
//                processed_at = CURRENT_TIMESTAMP,
//                status = 'processed'
//            WHERE id = $5`,
//           [employees.rows.length, totalGrossPay, totalDeductions, totalNetPay, payrollRunId]
//         );
        
//         await pool.query('COMMIT');
        
//         console.log('✅ Payroll processed:', {
//           runId: payrollRunId,
//           month,
//           year,
//           companyId,
//           employees: employees.rows.length
//         });
        
//         res.status(201).json({
//           message: 'Payroll processed successfully',
//           payrollRun: {
//             id: payrollRunId,
//             month,
//             year,
//             totalEmployees: employees.rows.length,
//             totalGrossPay: totalGrossPay.toFixed(2),
//             totalDeductions: totalDeductions.toFixed(2),
//             totalNetPay: totalNetPay.toFixed(2)
//           }
//         });
//       } catch (error) {
//         await pool.query('ROLLBACK');
//         throw error;
//       }
//     } catch (error) {
//       console.error('❌ Process payroll error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Update payment status for payroll item
// router.put(
//   '/items/:id/payment',
//   checkPermission('process_payroll'),
//   body('paymentStatus').isIn(['pending', 'paid', 'failed']),
//   body('paymentDate').optional().isISO8601(),
//   body('paymentReference').optional().trim(),
//   async (req, res) => {
//     try {
//       const { id } = req.params;
//       const companyId = req.companyId;
//       const { paymentStatus, paymentDate, paymentReference } = req.body;
      
//       // ✅ Filter by company
//       const result = await pool.query(
//         `UPDATE payroll_items
//          SET payment_status = $1,
//              payment_date = $2,
//              payment_reference = $3
//          WHERE id = $4 AND company_id = $5
//          RETURNING id, employee_name, payment_status`,
//         [paymentStatus, paymentDate || null, paymentReference || null, id, companyId]
//       );
      
//       if (result.rows.length === 0) {
//         return res.status(404).json({ error: 'Payroll item not found' });
//       }
      
//       res.json({
//         message: 'Payment status updated',
//         item: result.rows[0]
//       });
//     } catch (error) {
//       console.error('❌ Update payment status error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // ==================== PAYSLIPS ====================

// // Get employee's payslips
// router.get('/payslips/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const companyId = req.companyId;
//     const { year } = req.query;
    
//     console.log('📊 Fetching payslips for user:', userId, 'by:', req.user.id, 'company:', companyId);
    
//     // ✅ Verify user belongs to same company
//     const userCheck = await pool.query(
//       'SELECT id FROM users WHERE id = $1 AND company_id = $2',
//       [userId, companyId]
//     );
    
//     if (userCheck.rows.length === 0) {
//       return res.status(404).json({ error: 'Employee not found' });
//     }
    
//     // Check permissions - users can ONLY view their own payslips
//     const canViewAll = ['admin', 'hr'].includes(req.user.role);
//     const isOwnPayslip = req.user.id === parseInt(userId);
    
//     if (!canViewAll && !isOwnPayslip) {
//       console.log('❌ Access denied - user', req.user.id, 'tried to view user', userId);
//       return res.status(403).json({ error: 'You can only view your own payslips' });
//     }
    
//     let query = `
//       SELECT 
//         pr.id as "payrollRunId",
//         pr.month,
//         pr.year,
//         pr.processed_at as "processedAt",
//         pi.id as "payslipId",
//         pi.payment_date as "paymentDate",
//         pi.payment_status as "paymentStatus",
//         pi.payment_reference as "paymentReference",
//         COALESCE(pi.base_salary, 0) as "baseSalary",
//         COALESCE(pi.allowances, 0) as "allowances",
//         COALESCE(pi.gross_pay, 0) as "grossPay",
//         COALESCE(pi.paye, 0) as "paye",
//         COALESCE(pi.uif, 0) as "uif",
//         COALESCE(pi.other_deductions, 0) as "otherDeductions",
//         COALESCE(pi.total_deductions, 0) as "totalDeductions",
//         COALESCE(pi.net_pay, 0) as "netPay",
//         pi.employee_number as "employeeNumber",
//         pi.employee_name as "employeeName",
//         pi.department
//       FROM payroll_items pi
//       JOIN payroll_runs pr ON pi.payroll_run_id = pr.id
//       WHERE pi.user_id = $1
//         AND pr.status = 'processed'
//         AND pi.company_id = $2
//         AND pr.company_id = $2
//     `;
    
//     const params = [userId, companyId];
//     let paramIndex = 3;
    
//     if (year) {
//       query += ` AND pr.year = $${paramIndex}`;
//       params.push(year);
//       paramIndex++;
//     }
    
//     query += ` ORDER BY pr.year DESC, pr.month DESC`;
    
//     const result = await pool.query(query, params);
    
//     console.log(`✅ Found ${result.rows.length} payslips for user ${userId}`);
    
//     res.json({ payslips: result.rows });
//   } catch (error) {
//     console.error('❌ Get payslips error:', error);
//     console.error('❌ Error details:', error.message);
//     res.status(500).json({ 
//       error: 'Internal server error',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

// // Get detailed payslip
// router.get('/payslips/:userId/:runId', async (req, res) => {
//   try {
//     const { userId, runId } = req.params;
//     const companyId = req.companyId;
    
//     console.log('📄 Fetching payslip for user:', userId, 'run:', runId, 'by:', req.user.id, 'company:', companyId);
    
//     // ✅ Verify user belongs to same company
//     const userCheck = await pool.query(
//       'SELECT id FROM users WHERE id = $1 AND company_id = $2',
//       [userId, companyId]
//     );
    
//     if (userCheck.rows.length === 0) {
//       return res.status(404).json({ error: 'Employee not found' });
//     }
    
//     // Check permissions
//     const canViewAll = ['admin', 'hr'].includes(req.user.role);
//     const isOwnPayslip = req.user.id === parseInt(userId);
    
//     if (!canViewAll && !isOwnPayslip) {
//       console.log('❌ Access denied');
//       return res.status(403).json({ error: 'You can only view your own payslips' });
//     }
    
//     // ✅ Filter by company
//     const result = await pool.query(
//       `SELECT 
//         pr.id as "payrollRunId",
//         pr.month,
//         pr.year,
//         pr.processed_at as "processedAt",
//         pi.id as "payslipId",
//         pi.payment_date as "paymentDate",
//         pi.payment_status as "paymentStatus",
//         pi.payment_reference as "paymentReference",
//         pi.employee_number as "employeeNumber",
//         pi.employee_name as "employeeName",
//         pi.department,
//         u.email,
//         COALESCE(pi.base_salary, 0) as "baseSalary",
//         COALESCE(pi.allowances, 0) as "allowances",
//         COALESCE(pi.gross_pay, 0) as "grossPay",
//         COALESCE(pi.paye, 0) as "paye",
//         COALESCE(pi.uif, 0) as "uif",
//         COALESCE(pi.other_deductions, 0) as "otherDeductions",
//         COALESCE(pi.total_deductions, 0) as "totalDeductions",
//         COALESCE(pi.net_pay, 0) as "netPay"
//       FROM payroll_items pi
//       JOIN payroll_runs pr ON pi.payroll_run_id = pr.id
//       JOIN users u ON u.id = pi.user_id
//       WHERE pi.user_id = $1 
//         AND pr.id = $2 
//         AND pi.company_id = $3 
//         AND pr.company_id = $3 
//         AND u.company_id = $3`,
//       [userId, runId, companyId]
//     );
    
//     if (result.rows.length === 0) {
//       console.log('❌ Payslip not found');
//       return res.status(404).json({ error: 'Payslip not found' });
//     }
    
//     const data = result.rows[0];
    
//     const formattedPayslip = {
//       employee: {
//         id: parseInt(userId),
//         name: data.employeeName,
//         employeeNumber: data.employeeNumber,
//         email: data.email,
//         department: data.department
//       },
//       period: {
//         month: data.month,
//         year: data.year,
//         monthName: new Date(data.year, data.month - 1).toLocaleString('en-US', { month: 'long' }),
//         processedAt: data.processedAt
//       },
//       earnings: {
//         baseSalary: parseFloat(data.baseSalary).toFixed(2),
//         allowances: parseFloat(data.allowances).toFixed(2),
//         grossPay: parseFloat(data.grossPay).toFixed(2)
//       },
//       deductions: {
//         paye: parseFloat(data.paye).toFixed(2),
//         uif: parseFloat(data.uif).toFixed(2),
//         otherDeductions: parseFloat(data.otherDeductions).toFixed(2),
//         totalDeductions: parseFloat(data.totalDeductions).toFixed(2)
//       },
//       payment: {
//         netPay: parseFloat(data.netPay).toFixed(2),
//         paymentStatus: data.paymentStatus || 'pending',
//         paymentDate: data.paymentDate,
//         paymentReference: data.paymentReference
//       }
//     };
    
//     console.log('✅ Loaded payslip successfully');
    
//     res.json({ payslip: formattedPayslip });
//   } catch (error) {
//     console.error('❌ Get payslip error:', error);
//     console.error('❌ Error details:', error.message);
//     res.status(500).json({ 
//       error: 'Internal server error',
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// });

// // ==================== PAYROLL REPORTS ====================

// // Get payroll summary report
// router.get('/reports/summary', checkPermission('view_payroll'), async (req, res) => {
//   try {
//     const companyId = req.companyId;
//     const { year } = req.query;
//     const currentYear = year || new Date().getFullYear();
    
//     // ✅ Filter by company
//     const result = await pool.query(
//       `SELECT 
//         pr.month,
//         pr.year,
//         pr.total_employees as "totalEmployees",
//         pr.total_gross_pay as "totalGrossPay",
//         pr.total_deductions as "totalDeductions",
//         pr.total_net_pay as "totalNetPay",
//         pr.status,
//         pr.processed_at as "processedAt"
//       FROM payroll_runs pr
//       WHERE pr.year = $1 AND pr.company_id = $2
//       ORDER BY pr.month ASC`,
//       [currentYear, companyId]
//     );
    
//     // Calculate year totals
//     const yearTotals = result.rows.reduce((acc, row) => {
//       acc.totalGrossPay += parseFloat(row.totalGrossPay || 0);
//       acc.totalDeductions += parseFloat(row.totalDeductions || 0);
//       acc.totalNetPay += parseFloat(row.totalNetPay || 0);
//       return acc;
//     }, { totalGrossPay: 0, totalDeductions: 0, totalNetPay: 0 });
    
//     res.json({
//       year: currentYear,
//       monthly: result.rows,
//       yearTotals: {
//         totalGrossPay: yearTotals.totalGrossPay.toFixed(2),
//         totalDeductions: yearTotals.totalDeductions.toFixed(2),
//         totalNetPay: yearTotals.totalNetPay.toFixed(2)
//       }
//     });
//   } catch (error) {
//     console.error('❌ Get payroll summary error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get department payroll breakdown
// router.get('/reports/department/:departmentId', checkPermission('view_payroll'), async (req, res) => {
//   try {
//     const { departmentId } = req.params;
//     const companyId = req.companyId;
//     const { month, year } = req.query;
    
//     if (!month || !year) {
//       return res.status(400).json({ error: 'Month and year are required' });
//     }
    
//     // ✅ Filter by company
//     const result = await pool.query(
//       `SELECT 
//         pi.employee_name as "employeeName",
//         pi.employee_number as "employeeNumber",
//         pi.base_salary as "baseSalary",
//         pi.allowances,
//         pi.gross_pay as "grossPay",
//         pi.total_deductions as "totalDeductions",
//         pi.net_pay as "netPay"
//       FROM payroll_items pi
//       JOIN payroll_runs pr ON pi.payroll_run_id = pr.id
//       JOIN employee_profiles ep ON pi.user_id = ep.user_id
//       WHERE ep.department_id = $1
//         AND pr.month = $2
//         AND pr.year = $3
//         AND pi.company_id = $4
//         AND pr.company_id = $4
//         AND ep.company_id = $4
//       ORDER BY pi.employee_name ASC`,
//       [departmentId, month, year, companyId]
//     );
    
//     // Calculate totals
//     const totals = result.rows.reduce((acc, row) => {
//       acc.totalBaseSalary += parseFloat(row.baseSalary);
//       acc.totalAllowances += parseFloat(row.allowances);
//       acc.totalGrossPay += parseFloat(row.grossPay);
//       acc.totalDeductions += parseFloat(row.totalDeductions);
//       acc.totalNetPay += parseFloat(row.netPay);
//       return acc;
//     }, {
//       totalBaseSalary: 0,
//       totalAllowances: 0,
//       totalGrossPay: 0,
//       totalDeductions: 0,
//       totalNetPay: 0
//     });
    
//     res.json({
//       period: { month, year },
//       employees: result.rows,
//       totals: {
//         employeeCount: result.rows.length,
//         totalBaseSalary: totals.totalBaseSalary.toFixed(2),
//         totalAllowances: totals.totalAllowances.toFixed(2),
//         totalGrossPay: totals.totalGrossPay.toFixed(2),
//         totalDeductions: totals.totalDeductions.toFixed(2),
//         totalNetPay: totals.totalNetPay.toFixed(2)
//       }
//     });
//   } catch (error) {
//     console.error('❌ Get department payroll report error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get tax report (PAYE summary)
// router.get('/reports/tax', checkPermission('view_payroll'), async (req, res) => {
//   try {
//     const companyId = req.companyId;
//     const { month, year } = req.query;
    
//     if (!month || !year) {
//       return res.status(400).json({ error: 'Month and year are required' });
//     }
    
//     // ✅ Filter by company
//     const result = await pool.query(
//       `SELECT 
//         pi.employee_name as "employeeName",
//         pi.employee_number as "employeeNumber",
//         pi.gross_pay as "grossPay",
//         pi.paye,
//         pi.uif
//       FROM payroll_items pi
//       JOIN payroll_runs pr ON pi.payroll_run_id = pr.id
//       WHERE pr.month = $1 
//         AND pr.year = $2 
//         AND pi.company_id = $3 
//         AND pr.company_id = $3
//       ORDER BY pi.paye DESC`,
//       [month, year, companyId]
//     );
    
//     const totals = result.rows.reduce((acc, row) => {
//       acc.totalPAYE += parseFloat(row.paye);
//       acc.totalUIF += parseFloat(row.uif);
//       return acc;
//     }, { totalPAYE: 0, totalUIF: 0 });
    
//     res.json({
//       period: { month, year },
//       taxReport: result.rows,
//       totals: {
//         totalPAYE: totals.totalPAYE.toFixed(2),
//         totalUIF: totals.totalUIF.toFixed(2),
//         totalTax: (totals.totalPAYE + totals.totalUIF).toFixed(2)
//       }
//     });
//   } catch (error) {
//     console.error('❌ Get tax report error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// export default router;

// server/routes/payroll.routes.js
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

// ==================== PAYROLL PROCESSING ROUTES ====================

// ==================== TAX CALCULATIONS ====================

// South African PAYE (Pay As You Earn) Tax Tables 2025/2026
const calculatePAYE = (annualIncome) => {
  // South African tax brackets 2025/2026
  const taxBrackets = [
    { threshold: 0, rate: 0.18, deduction: 0 },
    { threshold: 237100, rate: 0.26, deduction: 42678 },
    { threshold: 370500, rate: 0.31, deduction: 77362 },
    { threshold: 512800, rate: 0.36, deduction: 103000 },
    { threshold: 673000, rate: 0.39, deduction: 146000 },
    { threshold: 857900, rate: 0.41, deduction: 207000 },
    { threshold: 1817000, rate: 0.45, deduction: 279000 }
  ];
  
  // Primary rebate for 2025/2026
  const primaryRebate = 17235;
  
  let taxableIncome = annualIncome;
  let tax = 0;
  
  // Find applicable bracket
  for (let i = taxBrackets.length - 1; i >= 0; i--) {
    if (taxableIncome >= taxBrackets[i].threshold) {
      tax = (taxableIncome * taxBrackets[i].rate) - taxBrackets[i].deduction;
      break;
    }
  }
  
  // Apply primary rebate
  tax = Math.max(0, tax - primaryRebate);
  
  return tax;
};

// Calculate UIF (Unemployment Insurance Fund)
const calculateUIF = (monthlyIncome) => {
  // UIF is 1% of salary, capped at R177.12 (based on max of R17,712)
  const uifRate = 0.01;
  const maxUIF = 177.12;
  const uif = Math.min(monthlyIncome * uifRate, maxUIF);
  return uif;
};

// ==================== PAYROLL CALCULATION ====================

// Calculate employee payroll for a specific month
router.post(
  '/calculate/:userId',
  checkPermission('manage_payroll'),
  body('month').isInt({ min: 1, max: 12 }),
  body('year').isInt({ min: 2020, max: 2100 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }
      
      const { userId } = req.params;
      const companyId = req.companyId;
      const { month, year } = req.body;
      
      // Verify user belongs to same company
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND company_id = $2',
        [userId, companyId]
      );
      
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      // Get employee details (filter by company)
      const employee = await pool.query(
        `SELECT 
          u.id,
          u.name,
          u.email,
          u.employee_number as "employeeNumber",
          u.first_name as "firstName",
          u.last_name as "lastName",
          d.name as "departmentName",
          jp.title as "jobTitle"
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id AND d.company_id = $2
        LEFT JOIN job_positions jp ON u.job_position_id = jp.id AND jp.company_id = $2
        WHERE u.id = $1 AND u.company_id = $2`,
        [userId, companyId]
      );
      
      if (employee.rows.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      const emp = employee.rows[0];
      
      // Get current compensation (filter by company)
      const compensation = await pool.query(
        `SELECT 
          base_salary as "baseSalary",
          salary_type as "salaryType",
          payment_frequency as "paymentFrequency"
        FROM employee_compensation
        WHERE user_id = $1 AND is_current = true AND company_id = $2`,
        [userId, companyId]
      );
      
      if (compensation.rows.length === 0) {
        return res.status(404).json({ error: 'No compensation record found' });
      }
      
      const baseSalary = parseFloat(compensation.rows[0].baseSalary);
      
      // Get active allowances (filter by company)
      const allowances = await pool.query(
        `SELECT 
          allowance_type as "allowanceType",
          amount,
          is_taxable as "isTaxable"
        FROM employee_allowances
        WHERE user_id = $1 AND is_active = true AND company_id = $2`,
        [userId, companyId]
      );
      
      // Calculate total allowances
      let totalTaxableAllowances = 0;
      let totalNonTaxableAllowances = 0;
      
      allowances.rows.forEach(allowance => {
        const amount = parseFloat(allowance.amount);
        if (allowance.isTaxable) {
          totalTaxableAllowances += amount;
        } else {
          totalNonTaxableAllowances += amount;
        }
      });
      
      // Get active deductions (filter by company)
      const deductions = await pool.query(
        `SELECT 
          deduction_type as "deductionType",
          amount,
          percentage,
          is_percentage as "isPercentage",
          is_mandatory as "isMandatory"
        FROM employee_deductions
        WHERE user_id = $1 AND is_active = true AND company_id = $2`,
        [userId, companyId]
      );
      
      // Calculate gross pay (before tax)
      const grossPay = baseSalary + totalTaxableAllowances;
      
      // Calculate annual income for PAYE
      const annualIncome = grossPay * 12;
      const annualPAYE = calculatePAYE(annualIncome);
      const monthlyPAYE = annualPAYE / 12;
      
      // Calculate UIF
      const uif = calculateUIF(grossPay);
      
      // Calculate other deductions
      let totalDeductions = monthlyPAYE + uif;
      const deductionDetails = [];
      
      // Add PAYE and UIF to deduction details
      deductionDetails.push({
        type: 'PAYE',
        amount: monthlyPAYE.toFixed(2),
        isMandatory: true
      });
      
      deductionDetails.push({
        type: 'UIF',
        amount: uif.toFixed(2),
        isMandatory: true
      });
      
      // Process other deductions
      deductions.rows.forEach(deduction => {
        let deductionAmount = 0;
        
        if (deduction.isPercentage) {
          deductionAmount = grossPay * (parseFloat(deduction.percentage) / 100);
        } else {
          deductionAmount = parseFloat(deduction.amount || 0);
        }
        
        totalDeductions += deductionAmount;
        
        deductionDetails.push({
          type: deduction.deductionType,
          amount: deductionAmount.toFixed(2),
          isMandatory: deduction.isMandatory
        });
      });
      
      // Calculate net pay
      const netPay = baseSalary + totalTaxableAllowances + totalNonTaxableAllowances - totalDeductions;
      
      // Prepare payroll calculation
      const payrollCalculation = {
        employee: {
          id: emp.id,
          name: emp.name,
          employeeNumber: emp.employeeNumber,
          department: emp.departmentName,
          jobTitle: emp.jobTitle
        },
        period: {
          month,
          year,
          monthName: new Date(year, month - 1).toLocaleString('en-US', { month: 'long' })
        },
        earnings: {
          baseSalary: baseSalary.toFixed(2),
          allowances: allowances.rows.map(a => ({
            type: a.allowanceType,
            amount: parseFloat(a.amount).toFixed(2),
            taxable: a.isTaxable
          })),
          totalTaxableAllowances: totalTaxableAllowances.toFixed(2),
          totalNonTaxableAllowances: totalNonTaxableAllowances.toFixed(2),
          grossPay: grossPay.toFixed(2)
        },
        deductions: {
          items: deductionDetails,
          totalDeductions: totalDeductions.toFixed(2)
        },
        summary: {
          grossPay: grossPay.toFixed(2),
          totalDeductions: totalDeductions.toFixed(2),
          netPay: netPay.toFixed(2)
        }
      };
      
      res.json({ payroll: payrollCalculation });
    } catch (error) {
      console.error('❌ Calculate payroll error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ==================== PAYROLL RUNS ====================

// Create payroll run table if it doesn't exist (should be in migration)
const ensurePayrollTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payroll_runs (
      id SERIAL PRIMARY KEY,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      status VARCHAR(50) DEFAULT 'draft',
      total_employees INTEGER DEFAULT 0,
      total_gross_pay DECIMAL(12,2) DEFAULT 0,
      total_deductions DECIMAL(12,2) DEFAULT 0,
      total_net_pay DECIMAL(12,2) DEFAULT 0,
      processed_by INTEGER REFERENCES users(id),
      processed_at TIMESTAMP,
      notes TEXT,
      company_id INTEGER REFERENCES companies(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(month, year, company_id)
    );
    
    CREATE TABLE IF NOT EXISTS payroll_items (
      id SERIAL PRIMARY KEY,
      payroll_run_id INTEGER REFERENCES payroll_runs(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id),
      employee_number VARCHAR(50),
      employee_name VARCHAR(255),
      department VARCHAR(255),
      base_salary DECIMAL(10,2),
      allowances DECIMAL(10,2),
      gross_pay DECIMAL(10,2),
      paye DECIMAL(10,2),
      uif DECIMAL(10,2),
      other_deductions DECIMAL(10,2),
      total_deductions DECIMAL(10,2),
      net_pay DECIMAL(10,2),
      payment_status VARCHAR(50) DEFAULT 'pending',
      payment_date DATE,
      payment_reference VARCHAR(255),
      notes TEXT,
      company_id INTEGER REFERENCES companies(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_payroll_runs_period ON payroll_runs(year, month);
    CREATE INDEX IF NOT EXISTS idx_payroll_runs_company ON payroll_runs(company_id);
    CREATE INDEX IF NOT EXISTS idx_payroll_items_run ON payroll_items(payroll_run_id);
    CREATE INDEX IF NOT EXISTS idx_payroll_items_user ON payroll_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_payroll_items_company ON payroll_items(company_id);
  `);
};

// Initialize tables on module load
ensurePayrollTables().catch(console.error);

// Get all payroll runs
router.get('/runs', checkPermission('manage_payroll'), async (req, res) => {
  try {
    const companyId = req.companyId;
    const { year, status } = req.query;
    
    let query = `
      SELECT 
        pr.id,
        pr.month,
        pr.year,
        pr.status,
        pr.total_employees as "totalEmployees",
        pr.total_gross_pay as "totalGrossPay",
        pr.total_deductions as "totalDeductions",
        pr.total_net_pay as "totalNetPay",
        pr.processed_by as "processedBy",
        u.name as "processedByName",
        pr.processed_at as "processedAt",
        pr.created_at as "createdAt"
      FROM payroll_runs pr
      LEFT JOIN users u ON pr.processed_by = u.id AND u.company_id = $1
      WHERE pr.company_id = $1
    `;
    
    const params = [companyId];
    let paramIndex = 2;
    
    if (year) {
      query += ` AND pr.year = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND pr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    query += ` ORDER BY pr.year DESC, pr.month DESC`;
    
    const result = await pool.query(query, params);
    
    res.json({ runs: result.rows });
  } catch (error) {
    console.error('❌ Get payroll runs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single payroll run with details
router.get('/runs/:id', checkPermission('manage_payroll'), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;
    
    // Get run details (filter by company)
    const run = await pool.query(
      `SELECT 
        pr.*,
        u.name as "processedByName"
      FROM payroll_runs pr
      LEFT JOIN users u ON pr.processed_by = u.id AND u.company_id = $2
      WHERE pr.id = $1 AND pr.company_id = $2`,
      [id, companyId]
    );
    
    if (run.rows.length === 0) {
      return res.status(404).json({ error: 'Payroll run not found' });
    }
    
    // Get payroll items (filter by company)
    const items = await pool.query(
      `SELECT 
        pi.*,
        pi.user_id as "userId",
        pi.employee_number as "employeeNumber",
        pi.employee_name as "employeeName",
        pi.base_salary as "baseSalary",
        pi.gross_pay as "grossPay",
        pi.other_deductions as "otherDeductions",
        pi.total_deductions as "totalDeductions",
        pi.net_pay as "netPay",
        pi.payment_status as "paymentStatus",
        pi.payment_date as "paymentDate",
        pi.payment_reference as "paymentReference"
      FROM payroll_items pi
      WHERE pi.payroll_run_id = $1 AND pi.company_id = $2
      ORDER BY pi.employee_name ASC`,
      [id, companyId]
    );
    
    res.json({
      run: run.rows[0],
      items: items.rows
    });
  } catch (error) {
    console.error('❌ Get payroll run error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process payroll for a month (create payroll run)
router.post(
  '/runs/process',
  checkPermission('manage_payroll'),
  body('month').isInt({ min: 1, max: 12 }),
  body('year').isInt({ min: 2020, max: 2100 }),
  body('departmentId').optional().isInt(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }
      
      const { month, year, departmentId, notes } = req.body;
      const companyId = req.companyId;
      
      // Check if payroll already processed for this period (in this company)
      const existing = await pool.query(
        'SELECT id FROM payroll_runs WHERE month = $1 AND year = $2 AND company_id = $3',
        [month, year, companyId]
      );
      
      if (existing.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Payroll already processed for this period',
          existingRunId: existing.rows[0].id
        });
      }
      
      // Get active employees (filter by company)
      let employeeQuery = `
        SELECT 
          u.id,
          u.name,
          u.employee_number,
          d.name as department,
          ec.base_salary
        FROM users u
        JOIN employee_compensation ec ON ec.user_id = u.id AND ec.is_current = true AND ec.company_id = $1
        LEFT JOIN departments d ON u.department_id = d.id AND d.company_id = $1
        WHERE u.employment_status = 'active' 
          AND u.company_id = $1
      `;
      
      const params = [companyId];
      if (departmentId) {
        employeeQuery += ' AND u.department_id = $2';
        params.push(departmentId);
      }
      
      employeeQuery += ' ORDER BY u.name ASC';
      
      const employees = await pool.query(employeeQuery, params);
      
      if (employees.rows.length === 0) {
        return res.status(400).json({ error: 'No active employees found' });
      }
      
      // Begin transaction
      await pool.query('BEGIN');
      
      try {
        // Create payroll run with company_id
        const runResult = await pool.query(
          `INSERT INTO payroll_runs (month, year, status, processed_by, notes, company_id)
           VALUES ($1, $2, 'draft', $3, $4, $5)
           RETURNING id`,
          [month, year, req.user.id, notes || null, companyId]
        );
        
        const payrollRunId = runResult.rows[0].id;
        
        let totalGrossPay = 0;
        let totalDeductions = 0;
        let totalNetPay = 0;
        
        // Process each employee
        for (const emp of employees.rows) {
          // Get allowances (filter by company)
          const allowances = await pool.query(
            `SELECT SUM(amount) as total
             FROM employee_allowances
             WHERE user_id = $1 AND is_active = true AND company_id = $2`,
            [emp.id, companyId]
          );
          
          const totalAllowances = parseFloat(allowances.rows[0].total || 0);
          const baseSalary = parseFloat(emp.base_salary);
          const grossPay = baseSalary + totalAllowances;
          
          // Calculate PAYE
          const annualIncome = grossPay * 12;
          const annualPAYE = calculatePAYE(annualIncome);
          const monthlyPAYE = annualPAYE / 12;
          
          // Calculate UIF
          const uif = calculateUIF(grossPay);
          
          // Get other deductions (filter by company)
          const deductions = await pool.query(
            `SELECT 
              SUM(CASE 
                WHEN is_percentage = true 
                THEN $1 * (percentage / 100)
                ELSE amount
              END) as total
             FROM employee_deductions
             WHERE user_id = $2 AND is_active = true AND company_id = $3`,
            [grossPay, emp.id, companyId]
          );
          
          const otherDeductions = parseFloat(deductions.rows[0].total || 0);
          const totalEmpDeductions = monthlyPAYE + uif + otherDeductions;
          const netPay = grossPay - totalEmpDeductions;
          
          // Insert payroll item with company_id
          await pool.query(
            `INSERT INTO payroll_items (
              payroll_run_id, user_id, employee_number, employee_name, department,
              base_salary, allowances, gross_pay, paye, uif, other_deductions,
              total_deductions, net_pay, payment_status, company_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending', $14)`,
            [
              payrollRunId,
              emp.id,
              emp.employee_number,
              emp.name,
              emp.department,
              baseSalary,
              totalAllowances,
              grossPay,
              monthlyPAYE,
              uif,
              otherDeductions,
              totalEmpDeductions,
              netPay,
              companyId
            ]
          );
          
          totalGrossPay += grossPay;
          totalDeductions += totalEmpDeductions;
          totalNetPay += netPay;
        }
        
        // Update payroll run totals
        await pool.query(
          `UPDATE payroll_runs
           SET total_employees = $1,
               total_gross_pay = $2,
               total_deductions = $3,
               total_net_pay = $4,
               processed_at = CURRENT_TIMESTAMP,
               status = 'processed'
           WHERE id = $5`,
          [employees.rows.length, totalGrossPay, totalDeductions, totalNetPay, payrollRunId]
        );
        
        await pool.query('COMMIT');
        
        console.log('✅ Payroll processed:', {
          runId: payrollRunId,
          month,
          year,
          companyId,
          employees: employees.rows.length
        });
        
        res.status(201).json({
          message: 'Payroll processed successfully',
          payrollRun: {
            id: payrollRunId,
            month,
            year,
            totalEmployees: employees.rows.length,
            totalGrossPay: totalGrossPay.toFixed(2),
            totalDeductions: totalDeductions.toFixed(2),
            totalNetPay: totalNetPay.toFixed(2)
          }
        });
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('❌ Process payroll error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update payment status for payroll item
router.put(
  '/items/:id/payment',
  checkPermission('manage_payroll'),
  body('paymentStatus').isIn(['pending', 'paid', 'failed']),
  body('paymentDate').optional().isISO8601(),
  body('paymentReference').optional().trim(),
  async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.companyId;
      const { paymentStatus, paymentDate, paymentReference } = req.body;
      
      const result = await pool.query(
        `UPDATE payroll_items
         SET payment_status = $1,
             payment_date = $2,
             payment_reference = $3
         WHERE id = $4 AND company_id = $5
         RETURNING id, employee_name, payment_status`,
        [paymentStatus, paymentDate || null, paymentReference || null, id, companyId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Payroll item not found' });
      }
      
      res.json({
        message: 'Payment status updated',
        item: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Update payment status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ==================== PAYSLIPS ====================

// Get employee's payslips
router.get('/payslips/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const companyId = req.companyId;
    const { year } = req.query;
    
    console.log('📊 Fetching payslips for user:', userId, 'by:', req.user.id, 'company:', companyId);
    
    // Verify user belongs to same company
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND company_id = $2',
      [userId, companyId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Check permissions - users can ONLY view their own payslips
    const canViewAll = ['admin', 'hr'].includes(req.user.role);
    const isOwnPayslip = req.user.id === parseInt(userId);
    
    if (!canViewAll && !isOwnPayslip) {
      console.log('❌ Access denied - user', req.user.id, 'tried to view user', userId);
      return res.status(403).json({ error: 'You can only view your own payslips' });
    }
    
    let query = `
      SELECT 
        pr.id as "payrollRunId",
        pr.month,
        pr.year,
        pr.processed_at as "processedAt",
        pi.id as "payslipId",
        pi.payment_date as "paymentDate",
        pi.payment_status as "paymentStatus",
        pi.payment_reference as "paymentReference",
        COALESCE(pi.base_salary, 0) as "baseSalary",
        COALESCE(pi.allowances, 0) as "allowances",
        COALESCE(pi.gross_pay, 0) as "grossPay",
        COALESCE(pi.paye, 0) as "paye",
        COALESCE(pi.uif, 0) as "uif",
        COALESCE(pi.other_deductions, 0) as "otherDeductions",
        COALESCE(pi.total_deductions, 0) as "totalDeductions",
        COALESCE(pi.net_pay, 0) as "netPay",
        pi.employee_number as "employeeNumber",
        pi.employee_name as "employeeName",
        pi.department
      FROM payroll_items pi
      JOIN payroll_runs pr ON pi.payroll_run_id = pr.id
      WHERE pi.user_id = $1
        AND pr.status = 'processed'
        AND pi.company_id = $2
        AND pr.company_id = $2
    `;
    
    const params = [userId, companyId];
    let paramIndex = 3;
    
    if (year) {
      query += ` AND pr.year = $${paramIndex}`;
      params.push(year);
      paramIndex++;
    }
    
    query += ` ORDER BY pr.year DESC, pr.month DESC`;
    
    const result = await pool.query(query, params);
    
    console.log(`✅ Found ${result.rows.length} payslips for user ${userId}`);
    
    res.json({ payslips: result.rows });
  } catch (error) {
    console.error('❌ Get payslips error:', error);
    console.error('❌ Error details:', error.message);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get detailed payslip
router.get('/payslips/:userId/:runId', async (req, res) => {
  try {
    const { userId, runId } = req.params;
    const companyId = req.companyId;
    
    console.log('📄 Fetching payslip for user:', userId, 'run:', runId, 'by:', req.user.id, 'company:', companyId);
    
    // Verify user belongs to same company
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND company_id = $2',
      [userId, companyId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Check permissions
    const canViewAll = ['admin', 'hr'].includes(req.user.role);
    const isOwnPayslip = req.user.id === parseInt(userId);
    
    if (!canViewAll && !isOwnPayslip) {
      console.log('❌ Access denied');
      return res.status(403).json({ error: 'You can only view your own payslips' });
    }
    
    const result = await pool.query(
      `SELECT 
        pr.id as "payrollRunId",
        pr.month,
        pr.year,
        pr.processed_at as "processedAt",
        pi.id as "payslipId",
        pi.payment_date as "paymentDate",
        pi.payment_status as "paymentStatus",
        pi.payment_reference as "paymentReference",
        pi.employee_number as "employeeNumber",
        pi.employee_name as "employeeName",
        pi.department,
        u.email,
        COALESCE(pi.base_salary, 0) as "baseSalary",
        COALESCE(pi.allowances, 0) as "allowances",
        COALESCE(pi.gross_pay, 0) as "grossPay",
        COALESCE(pi.paye, 0) as "paye",
        COALESCE(pi.uif, 0) as "uif",
        COALESCE(pi.other_deductions, 0) as "otherDeductions",
        COALESCE(pi.total_deductions, 0) as "totalDeductions",
        COALESCE(pi.net_pay, 0) as "netPay"
      FROM payroll_items pi
      JOIN payroll_runs pr ON pi.payroll_run_id = pr.id
      JOIN users u ON u.id = pi.user_id
      WHERE pi.user_id = $1 
        AND pr.id = $2 
        AND pi.company_id = $3 
        AND pr.company_id = $3 
        AND u.company_id = $3`,
      [userId, runId, companyId]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Payslip not found');
      return res.status(404).json({ error: 'Payslip not found' });
    }
    
    const data = result.rows[0];
    
    const formattedPayslip = {
      employee: {
        id: parseInt(userId),
        name: data.employeeName,
        employeeNumber: data.employeeNumber,
        email: data.email,
        department: data.department
      },
      period: {
        month: data.month,
        year: data.year,
        monthName: new Date(data.year, data.month - 1).toLocaleString('en-US', { month: 'long' }),
        processedAt: data.processedAt
      },
      earnings: {
        baseSalary: parseFloat(data.baseSalary).toFixed(2),
        allowances: parseFloat(data.allowances).toFixed(2),
        grossPay: parseFloat(data.grossPay).toFixed(2)
      },
      deductions: {
        paye: parseFloat(data.paye).toFixed(2),
        uif: parseFloat(data.uif).toFixed(2),
        otherDeductions: parseFloat(data.otherDeductions).toFixed(2),
        totalDeductions: parseFloat(data.totalDeductions).toFixed(2)
      },
      payment: {
        netPay: parseFloat(data.netPay).toFixed(2),
        paymentStatus: data.paymentStatus || 'pending',
        paymentDate: data.paymentDate,
        paymentReference: data.paymentReference
      }
    };
    
    console.log('✅ Loaded payslip successfully');
    
    res.json({ payslip: formattedPayslip });
  } catch (error) {
    console.error('❌ Get payslip error:', error);
    console.error('❌ Error details:', error.message);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ==================== PAYROLL REPORTS ====================

// Get payroll summary report
router.get('/reports/summary', checkPermission('manage_payroll'), async (req, res) => {
  try {
    const companyId = req.companyId;
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();
    
    const result = await pool.query(
      `SELECT 
        pr.month,
        pr.year,
        pr.total_employees as "totalEmployees",
        pr.total_gross_pay as "totalGrossPay",
        pr.total_deductions as "totalDeductions",
        pr.total_net_pay as "totalNetPay",
        pr.status,
        pr.processed_at as "processedAt"
      FROM payroll_runs pr
      WHERE pr.year = $1 AND pr.company_id = $2
      ORDER BY pr.month ASC`,
      [currentYear, companyId]
    );
    
    // Calculate year totals
    const yearTotals = result.rows.reduce((acc, row) => {
      acc.totalGrossPay += parseFloat(row.totalGrossPay || 0);
      acc.totalDeductions += parseFloat(row.totalDeductions || 0);
      acc.totalNetPay += parseFloat(row.totalNetPay || 0);
      return acc;
    }, { totalGrossPay: 0, totalDeductions: 0, totalNetPay: 0 });
    
    res.json({
      year: currentYear,
      monthly: result.rows,
      yearTotals: {
        totalGrossPay: yearTotals.totalGrossPay.toFixed(2),
        totalDeductions: yearTotals.totalDeductions.toFixed(2),
        totalNetPay: yearTotals.totalNetPay.toFixed(2)
      }
    });
  } catch (error) {
    console.error('❌ Get payroll summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get department payroll breakdown
router.get('/reports/department/:departmentId', checkPermission('manage_payroll'), async (req, res) => {
  try {
    const { departmentId } = req.params;
    const companyId = req.companyId;
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }
    
    const result = await pool.query(
      `SELECT 
        pi.employee_name as "employeeName",
        pi.employee_number as "employeeNumber",
        pi.base_salary as "baseSalary",
        pi.allowances,
        pi.gross_pay as "grossPay",
        pi.total_deductions as "totalDeductions",
        pi.net_pay as "netPay"
      FROM payroll_items pi
      JOIN payroll_runs pr ON pi.payroll_run_id = pr.id
      JOIN users u ON pi.user_id = u.id
      WHERE u.department_id = $1
        AND pr.month = $2
        AND pr.year = $3
        AND pi.company_id = $4
        AND pr.company_id = $4
        AND u.company_id = $4
      ORDER BY pi.employee_name ASC`,
      [departmentId, month, year, companyId]
    );
    
    // Calculate totals
    const totals = result.rows.reduce((acc, row) => {
      acc.totalBaseSalary += parseFloat(row.baseSalary);
      acc.totalAllowances += parseFloat(row.allowances);
      acc.totalGrossPay += parseFloat(row.grossPay);
      acc.totalDeductions += parseFloat(row.totalDeductions);
      acc.totalNetPay += parseFloat(row.netPay);
      return acc;
    }, {
      totalBaseSalary: 0,
      totalAllowances: 0,
      totalGrossPay: 0,
      totalDeductions: 0,
      totalNetPay: 0
    });
    
    res.json({
      period: { month, year },
      employees: result.rows,
      totals: {
        employeeCount: result.rows.length,
        totalBaseSalary: totals.totalBaseSalary.toFixed(2),
        totalAllowances: totals.totalAllowances.toFixed(2),
        totalGrossPay: totals.totalGrossPay.toFixed(2),
        totalDeductions: totals.totalDeductions.toFixed(2),
        totalNetPay: totals.totalNetPay.toFixed(2)
      }
    });
  } catch (error) {
    console.error('❌ Get department payroll report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get tax report (PAYE summary)
router.get('/reports/tax', checkPermission('manage_payroll'), async (req, res) => {
  try {
    const companyId = req.companyId;
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }
    
    const result = await pool.query(
      `SELECT 
        pi.employee_name as "employeeName",
        pi.employee_number as "employeeNumber",
        pi.gross_pay as "grossPay",
        pi.paye,
        pi.uif
      FROM payroll_items pi
      JOIN payroll_runs pr ON pi.payroll_run_id = pr.id
      WHERE pr.month = $1 
        AND pr.year = $2 
        AND pi.company_id = $3 
        AND pr.company_id = $3
      ORDER BY pi.paye DESC`,
      [month, year, companyId]
    );
    
    const totals = result.rows.reduce((acc, row) => {
      acc.totalPAYE += parseFloat(row.paye);
      acc.totalUIF += parseFloat(row.uif);
      return acc;
    }, { totalPAYE: 0, totalUIF: 0 });
    
    res.json({
      period: { month, year },
      taxReport: result.rows,
      totals: {
        totalPAYE: totals.totalPAYE.toFixed(2),
        totalUIF: totals.totalUIF.toFixed(2),
        totalTax: (totals.totalPAYE + totals.totalUIF).toFixed(2)
      }
    });
  } catch (error) {
    console.error('❌ Get tax report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;