// // server/routes/jobPositions.routes.js
// import express from 'express';
// import { pool } from '../index.js';
// import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';
// import { verifyTenantAccess } from '../middleware/tenantMiddleware.js';
// import { body, validationResult } from 'express-validator';

// const router = express.Router();

// // ✅ Apply authentication and tenant verification to all routes
// router.use(authenticateToken);
// router.use(verifyTenantAccess);

// // ==================== JOB POSITIONS ROUTES ====================

// // Get all job positions
// router.get('/', async (req, res) => {
//   try {
//     const companyId = req.companyId;
//     const { department_id, include_inactive } = req.query;
    
//     let query = `
//       SELECT 
//         jp.id,
//         jp.title,
//         jp.code,
//         jp.department_id as "departmentId",
//         d.name as "departmentName",
//         jp.job_grade as "jobGrade",
//         jp.description,
//         jp.responsibilities,
//         jp.qualifications,
//         jp.salary_range_min as "salaryRangeMin",
//         jp.salary_range_max as "salaryRangeMax",
//         jp.is_active as "isActive",
//         jp.created_at as "createdAt",
//         jp.updated_at as "updatedAt",
//         COUNT(DISTINCT ep.user_id) as "employeeCount"
//       FROM job_positions jp
//       LEFT JOIN departments d ON jp.department_id = d.id AND d.company_id = $1
//       LEFT JOIN employee_profiles ep ON ep.job_position_id = jp.id 
//         AND ep.employment_status = 'active'
//         AND ep.company_id = $1
//       WHERE jp.company_id = $1
//     `;
    
//     const params = [companyId];
//     let paramIndex = 2;
    
//     // Filter by department if specified
//     if (department_id) {
//       query += ` AND jp.department_id = $${paramIndex}`;
//       params.push(department_id);
//       paramIndex++;
//     }
    
//     // Filter inactive positions unless requested
//     if (include_inactive !== 'true') {
//       query += ` AND jp.is_active = true`;
//     }
    
//     query += `
//       GROUP BY jp.id, d.name
//       ORDER BY jp.title ASC
//     `;
    
//     const result = await pool.query(query, params);
    
//     res.json({ 
//       positions: result.rows,
//       total: result.rows.length
//     });
//   } catch (error) {
//     console.error('❌ Get job positions error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get single job position by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const companyId = req.companyId;
    
//     // ✅ Filter by company
//     const result = await pool.query(
//       `SELECT 
//         jp.id,
//         jp.title,
//         jp.code,
//         jp.department_id as "departmentId",
//         d.name as "departmentName",
//         d.code as "departmentCode",
//         jp.job_grade as "jobGrade",
//         jp.description,
//         jp.responsibilities,
//         jp.qualifications,
//         jp.salary_range_min as "salaryRangeMin",
//         jp.salary_range_max as "salaryRangeMax",
//         jp.is_active as "isActive",
//         jp.created_at as "createdAt",
//         jp.updated_at as "updatedAt"
//       FROM job_positions jp
//       LEFT JOIN departments d ON jp.department_id = d.id AND d.company_id = $2
//       WHERE jp.id = $1 AND jp.company_id = $2`,
//       [id, companyId]
//     );
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Job position not found' });
//     }
    
//     // ✅ Get employees in this position (same company)
//     const employeesResult = await pool.query(
//       `SELECT 
//         u.id,
//         u.name,
//         u.email,
//         ep.employee_number as "employeeNumber",
//         ep.employment_status as "employmentStatus",
//         ep.hire_date as "hireDate",
//         ec.base_salary as "baseSalary"
//       FROM employee_profiles ep
//       JOIN users u ON ep.user_id = u.id
//       LEFT JOIN employee_compensation ec ON ec.user_id = u.id AND ec.is_current = true AND ec.company_id = $2
//       WHERE ep.job_position_id = $1 
//         AND ep.company_id = $2 
//         AND u.company_id = $2
//       ORDER BY u.name ASC`,
//       [id, companyId]
//     );
    
//     // ✅ Get salary statistics (same company)
//     const salaryStats = await pool.query(
//       `SELECT 
//         COUNT(*) as "employeeCount",
//         MIN(ec.base_salary) as "minSalary",
//         MAX(ec.base_salary) as "maxSalary",
//         AVG(ec.base_salary) as "avgSalary"
//       FROM employee_compensation ec
//       JOIN employee_profiles ep ON ec.user_id = ep.user_id
//       WHERE ep.job_position_id = $1 
//         AND ec.is_current = true
//         AND ep.employment_status = 'active'
//         AND ec.company_id = $2
//         AND ep.company_id = $2`,
//       [id, companyId]
//     );
    
//     const position = result.rows[0];
//     position.employees = employeesResult.rows;
//     position.salaryStatistics = salaryStats.rows[0];
    
//     res.json({ position });
//   } catch (error) {
//     console.error('❌ Get job position error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get positions by department
// router.get('/department/:departmentId', async (req, res) => {
//   try {
//     const { departmentId } = req.params;
//     const companyId = req.companyId;
    
//     // ✅ Filter by company
//     const result = await pool.query(
//       `SELECT 
//         jp.id,
//         jp.title,
//         jp.code,
//         jp.job_grade as "jobGrade",
//         jp.salary_range_min as "salaryRangeMin",
//         jp.salary_range_max as "salaryRangeMax",
//         jp.is_active as "isActive",
//         COUNT(DISTINCT ep.user_id) as "employeeCount"
//       FROM job_positions jp
//       LEFT JOIN employee_profiles ep ON ep.job_position_id = jp.id 
//         AND ep.employment_status = 'active'
//         AND ep.company_id = $2
//       WHERE jp.department_id = $1 
//         AND jp.is_active = true
//         AND jp.company_id = $2
//       GROUP BY jp.id
//       ORDER BY jp.title ASC`,
//       [departmentId, companyId]
//     );
    
//     res.json({ positions: result.rows });
//   } catch (error) {
//     console.error('❌ Get positions by department error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get positions by job grade
// router.get('/grade/:grade', async (req, res) => {
//   try {
//     const { grade } = req.params;
//     const companyId = req.companyId;
    
//     // ✅ Filter by company
//     const result = await pool.query(
//       `SELECT 
//         jp.id,
//         jp.title,
//         jp.code,
//         jp.department_id as "departmentId",
//         d.name as "departmentName",
//         jp.salary_range_min as "salaryRangeMin",
//         jp.salary_range_max as "salaryRangeMax",
//         COUNT(DISTINCT ep.user_id) as "employeeCount"
//       FROM job_positions jp
//       LEFT JOIN departments d ON jp.department_id = d.id AND d.company_id = $2
//       LEFT JOIN employee_profiles ep ON ep.job_position_id = jp.id 
//         AND ep.employment_status = 'active'
//         AND ep.company_id = $2
//       WHERE jp.job_grade = $1 
//         AND jp.is_active = true
//         AND jp.company_id = $2
//       GROUP BY jp.id, d.name
//       ORDER BY jp.title ASC`,
//       [grade, companyId]
//     );
    
//     res.json({ positions: result.rows });
//   } catch (error) {
//     console.error('❌ Get positions by grade error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Create new job position
// router.post(
//   '/',
//   checkPermission('manage_employees'),
//   body('title').trim().notEmpty().withMessage('Job title is required'),
//   body('code').optional().trim(),
//   body('departmentId').optional().isInt(),
//   body('jobGrade').optional().trim(),
//   body('description').optional().trim(),
//   body('responsibilities').optional().trim(),
//   body('qualifications').optional().trim(),
//   body('salaryRangeMin').optional().isFloat({ min: 0 }),
//   body('salaryRangeMax').optional().isFloat({ min: 0 }),
//   async (req, res) => {
//     try {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({ error: 'Invalid input', details: errors.array() });
//       }
      
//       const companyId = req.companyId;
//       const { 
//         title, 
//         code, 
//         departmentId, 
//         jobGrade, 
//         description, 
//         responsibilities, 
//         qualifications,
//         salaryRangeMin,
//         salaryRangeMax
//       } = req.body;
      
//       // Validate salary range
//       if (salaryRangeMin && salaryRangeMax && salaryRangeMin > salaryRangeMax) {
//         return res.status(400).json({ 
//           error: 'Minimum salary cannot be greater than maximum salary' 
//         });
//       }
      
//       // ✅ Check if code already exists in same company (if provided)
//       if (code) {
//         const existingCode = await pool.query(
//           'SELECT id FROM job_positions WHERE code = $1 AND company_id = $2',
//           [code, companyId]
//         );
        
//         if (existingCode.rows.length > 0) {
//           return res.status(400).json({ error: 'Job position code already exists' });
//         }
//       }
      
//       // ✅ Validate department exists in same company (if provided)
//       if (departmentId) {
//         const deptExists = await pool.query(
//           'SELECT id FROM departments WHERE id = $1 AND is_active = true AND company_id = $2',
//           [departmentId, companyId]
//         );
        
//         if (deptExists.rows.length === 0) {
//           return res.status(400).json({ error: 'Department not found or inactive' });
//         }
//       }
      
//       // ✅ Insert new job position with company_id
//       const result = await pool.query(
//         `INSERT INTO job_positions 
//          (title, code, department_id, job_grade, description, responsibilities, 
//           qualifications, salary_range_min, salary_range_max, is_active, company_id)
//          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10)
//          RETURNING 
//            id,
//            title,
//            code,
//            department_id as "departmentId",
//            job_grade as "jobGrade",
//            description,
//            responsibilities,
//            qualifications,
//            salary_range_min as "salaryRangeMin",
//            salary_range_max as "salaryRangeMax",
//            is_active as "isActive",
//            created_at as "createdAt"`,
//         [
//           title, 
//           code || null, 
//           departmentId || null, 
//           jobGrade || null, 
//           description || null,
//           responsibilities || null,
//           qualifications || null,
//           salaryRangeMin || null,
//           salaryRangeMax || null,
//           companyId
//         ]
//       );
      
//       console.log('✅ Job position created:', result.rows[0]);
      
//       res.status(201).json({ 
//         message: 'Job position created successfully',
//         position: result.rows[0]
//       });
//     } catch (error) {
//       console.error('❌ Create job position error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Update job position
// router.put(
//   '/:id',
//   checkPermission('manage_employees'),
//   body('title').optional().trim().notEmpty(),
//   body('code').optional().trim(),
//   body('departmentId').optional().isInt(),
//   body('jobGrade').optional().trim(),
//   body('description').optional().trim(),
//   body('responsibilities').optional().trim(),
//   body('qualifications').optional().trim(),
//   body('salaryRangeMin').optional().isFloat({ min: 0 }),
//   body('salaryRangeMax').optional().isFloat({ min: 0 }),
//   body('isActive').optional().isBoolean(),
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
//         code, 
//         departmentId, 
//         jobGrade, 
//         description, 
//         responsibilities, 
//         qualifications,
//         salaryRangeMin,
//         salaryRangeMax,
//         isActive
//       } = req.body;
      
//       // ✅ Check if position exists in same company
//       const posExists = await pool.query(
//         'SELECT id, salary_range_min, salary_range_max FROM job_positions WHERE id = $1 AND company_id = $2',
//         [id, companyId]
//       );
      
//       if (posExists.rows.length === 0) {
//         return res.status(404).json({ error: 'Job position not found' });
//       }
      
//       const currentPosition = posExists.rows[0];
      
//       // Validate salary range
//       const newMin = salaryRangeMin !== undefined ? salaryRangeMin : currentPosition.salary_range_min;
//       const newMax = salaryRangeMax !== undefined ? salaryRangeMax : currentPosition.salary_range_max;
      
//       if (newMin && newMax && newMin > newMax) {
//         return res.status(400).json({ 
//           error: 'Minimum salary cannot be greater than maximum salary' 
//         });
//       }
      
//       // ✅ Check for duplicate code in same company (excluding current position)
//       if (code) {
//         const duplicateCode = await pool.query(
//           'SELECT id FROM job_positions WHERE code = $1 AND id != $2 AND company_id = $3',
//           [code, id, companyId]
//         );
        
//         if (duplicateCode.rows.length > 0) {
//           return res.status(400).json({ error: 'Job position code already exists' });
//         }
//       }
      
//       // ✅ Validate department is in same company (if provided)
//       if (departmentId) {
//         const deptCheck = await pool.query(
//           'SELECT id FROM departments WHERE id = $1 AND company_id = $2',
//           [departmentId, companyId]
//         );
        
//         if (deptCheck.rows.length === 0) {
//           return res.status(400).json({ error: 'Department not found' });
//         }
//       }
      
//       // Build update query dynamically
//       const updates = [];
//       const values = [];
//       let paramCount = 1;
      
//       if (title !== undefined) {
//         updates.push(`title = $${paramCount}`);
//         values.push(title);
//         paramCount++;
//       }
      
//       if (code !== undefined) {
//         updates.push(`code = $${paramCount}`);
//         values.push(code || null);
//         paramCount++;
//       }
      
//       if (departmentId !== undefined) {
//         updates.push(`department_id = $${paramCount}`);
//         values.push(departmentId || null);
//         paramCount++;
//       }
      
//       if (jobGrade !== undefined) {
//         updates.push(`job_grade = $${paramCount}`);
//         values.push(jobGrade || null);
//         paramCount++;
//       }
      
//       if (description !== undefined) {
//         updates.push(`description = $${paramCount}`);
//         values.push(description || null);
//         paramCount++;
//       }
      
//       if (responsibilities !== undefined) {
//         updates.push(`responsibilities = $${paramCount}`);
//         values.push(responsibilities || null);
//         paramCount++;
//       }
      
//       if (qualifications !== undefined) {
//         updates.push(`qualifications = $${paramCount}`);
//         values.push(qualifications || null);
//         paramCount++;
//       }
      
//       if (salaryRangeMin !== undefined) {
//         updates.push(`salary_range_min = $${paramCount}`);
//         values.push(salaryRangeMin || null);
//         paramCount++;
//       }
      
//       if (salaryRangeMax !== undefined) {
//         updates.push(`salary_range_max = $${paramCount}`);
//         values.push(salaryRangeMax || null);
//         paramCount++;
//       }
      
//       if (isActive !== undefined) {
//         updates.push(`is_active = $${paramCount}`);
//         values.push(isActive);
//         paramCount++;
//       }
      
//       if (updates.length === 0) {
//         return res.status(400).json({ error: 'No fields to update' });
//       }
      
//       // Add updated_at
//       updates.push(`updated_at = CURRENT_TIMESTAMP`);
      
//       // Add ID and company_id for WHERE clause
//       values.push(id);
//       values.push(companyId);
      
//       const query = `
//         UPDATE job_positions
//         SET ${updates.join(', ')}
//         WHERE id = $${paramCount} AND company_id = $${paramCount + 1}
//         RETURNING 
//           id,
//           title,
//           code,
//           department_id as "departmentId",
//           job_grade as "jobGrade",
//           description,
//           responsibilities,
//           qualifications,
//           salary_range_min as "salaryRangeMin",
//           salary_range_max as "salaryRangeMax",
//           is_active as "isActive",
//           updated_at as "updatedAt"
//       `;
      
//       const result = await pool.query(query, values);
      
//       console.log('✅ Job position updated:', result.rows[0]);
      
//       res.json({ 
//         message: 'Job position updated successfully',
//         position: result.rows[0]
//       });
//     } catch (error) {
//       console.error('❌ Update job position error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Delete (deactivate) job position
// router.delete(
//   '/:id',
//   checkPermission('manage_employees'),
//   async (req, res) => {
//     try {
//       const { id } = req.params;
//       const companyId = req.companyId;
//       const { force } = req.query; // force=true for hard delete
      
//       // ✅ Check if position exists in same company
//       const posExists = await pool.query(
//         'SELECT id, title FROM job_positions WHERE id = $1 AND company_id = $2',
//         [id, companyId]
//       );
      
//       if (posExists.rows.length === 0) {
//         return res.status(404).json({ error: 'Job position not found' });
//       }
      
//       // ✅ Check if position has employees in same company
//       const employeeCount = await pool.query(
//         `SELECT COUNT(*) as count 
//          FROM employee_profiles 
//          WHERE job_position_id = $1 
//            AND employment_status = 'active'
//            AND company_id = $2`,
//         [id, companyId]
//       );
      
//       if (parseInt(employeeCount.rows[0].count) > 0) {
//         return res.status(400).json({ 
//           error: 'Cannot delete job position with active employees',
//           employeeCount: employeeCount.rows[0].count
//         });
//       }
      
//       if (force === 'true') {
//         // ✅ Hard delete (same company)
//         await pool.query('DELETE FROM job_positions WHERE id = $1 AND company_id = $2', [id, companyId]);
//         console.log('✅ Job position deleted (hard):', id);
//         res.json({ message: 'Job position deleted permanently' });
//       } else {
//         // ✅ Soft delete (same company)
//         await pool.query(
//           'UPDATE job_positions SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND company_id = $2',
//           [id, companyId]
//         );
//         console.log('✅ Job position deactivated:', id);
//         res.json({ message: 'Job position deactivated successfully' });
//       }
//     } catch (error) {
//       console.error('❌ Delete job position error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Reactivate job position
// router.post(
//   '/:id/reactivate',
//   checkPermission('manage_employees'),
//   async (req, res) => {
//     try {
//       const { id } = req.params;
//       const companyId = req.companyId;
      
//       // ✅ Filter by company
//       const result = await pool.query(
//         `UPDATE job_positions 
//          SET is_active = true, updated_at = CURRENT_TIMESTAMP 
//          WHERE id = $1 AND company_id = $2
//          RETURNING id, title`,
//         [id, companyId]
//       );
      
//       if (result.rows.length === 0) {
//         return res.status(404).json({ error: 'Job position not found' });
//       }
      
//       console.log('✅ Job position reactivated:', result.rows[0]);
      
//       res.json({ 
//         message: 'Job position reactivated successfully',
//         position: result.rows[0]
//       });
//     } catch (error) {
//       console.error('❌ Reactivate job position error:', error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }
// );

// // Get salary benchmarking data
// router.get('/:id/salary-benchmark', checkPermission('view_compensation'), async (req, res) => {
//   try {
//     const { id } = req.params;
//     const companyId = req.companyId;
    
//     // ✅ Get position details (same company)
//     const position = await pool.query(
//       `SELECT 
//         title,
//         job_grade as "jobGrade",
//         salary_range_min as "salaryRangeMin",
//         salary_range_max as "salaryRangeMax"
//       FROM job_positions
//       WHERE id = $1 AND company_id = $2`,
//       [id, companyId]
//     );
    
//     if (position.rows.length === 0) {
//       return res.status(404).json({ error: 'Job position not found' });
//     }
    
//     // ✅ Get actual salaries (same company)
//     const salaries = await pool.query(
//       `SELECT 
//         ec.base_salary as "baseSalary",
//         ep.hire_date as "hireDate",
//         EXTRACT(YEAR FROM AGE(CURRENT_DATE, ep.hire_date)) as "yearsOfService"
//       FROM employee_compensation ec
//       JOIN employee_profiles ep ON ec.user_id = ep.user_id
//       WHERE ep.job_position_id = $1 
//         AND ec.is_current = true
//         AND ep.employment_status = 'active'
//         AND ec.company_id = $2
//         AND ep.company_id = $2
//       ORDER BY ec.base_salary ASC`,
//       [id, companyId]
//     );
    
//     // Calculate percentiles
//     const salaryValues = salaries.rows.map(s => parseFloat(s.baseSalary));
//     const sortedSalaries = [...salaryValues].sort((a, b) => a - b);
    
//     const percentile = (p) => {
//       if (sortedSalaries.length === 0) return null;
//       const index = Math.ceil((p / 100) * sortedSalaries.length) - 1;
//       return sortedSalaries[Math.max(0, index)];
//     };
    
//     res.json({
//       position: position.rows[0],
//       statistics: {
//         count: salaries.rows.length,
//         min: sortedSalaries.length > 0 ? sortedSalaries[0] : null,
//         max: sortedSalaries.length > 0 ? sortedSalaries[sortedSalaries.length - 1] : null,
//         median: percentile(50),
//         percentile25: percentile(25),
//         percentile75: percentile(75),
//         average: salaryValues.length > 0 ? 
//           salaryValues.reduce((a, b) => a + b, 0) / salaryValues.length : null
//       },
//       salaryDistribution: salaries.rows
//     });
//   } catch (error) {
//     console.error('❌ Get salary benchmark error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get all job grades with statistics
// router.get('/grades/list', async (req, res) => {
//   try {
//     const companyId = req.companyId;
    
//     // ✅ Filter by company
//     const result = await pool.query(
//       `SELECT 
//         job_grade as "jobGrade",
//         COUNT(DISTINCT jp.id) as "positionCount",
//         COUNT(DISTINCT ep.user_id) as "employeeCount",
//         MIN(jp.salary_range_min) as "minSalaryRange",
//         MAX(jp.salary_range_max) as "maxSalaryRange"
//       FROM job_positions jp
//       LEFT JOIN employee_profiles ep ON ep.job_position_id = jp.id 
//         AND ep.employment_status = 'active'
//         AND ep.company_id = $1
//       WHERE jp.is_active = true 
//         AND jp.job_grade IS NOT NULL
//         AND jp.company_id = $1
//       GROUP BY jp.job_grade
//       ORDER BY jp.job_grade ASC`,
//       [companyId]
//     );
    
//     res.json({ grades: result.rows });
//   } catch (error) {
//     console.error('❌ Get job grades error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// export default router;

// server/routes/jobPositions.routes.js
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

// ==================== JOB POSITIONS ROUTES ====================

// Get all job grades with statistics - MUST BE BEFORE /:id
router.get('/grades/list', async (req, res) => {
  try {
    const companyId = req.companyId;
    
    const result = await pool.query(
      `SELECT 
        job_grade as "jobGrade",
        COUNT(DISTINCT jp.id) as "positionCount",
        COUNT(DISTINCT u.id) as "employeeCount",
        MIN(jp.salary_range_min) as "minSalaryRange",
        MAX(jp.salary_range_max) as "maxSalaryRange"
      FROM job_positions jp
      LEFT JOIN users u ON u.job_position_id = jp.id 
        AND u.employment_status = 'active'
        AND u.company_id = $1
      WHERE jp.is_active = true 
        AND jp.job_grade IS NOT NULL
        AND jp.company_id = $1
      GROUP BY jp.job_grade
      ORDER BY jp.job_grade ASC`,
      [companyId]
    );
    
    res.json({ grades: result.rows });
  } catch (error) {
    console.error('❌ Get job grades error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get positions by department - MUST BE BEFORE /:id
router.get('/department/:departmentId', async (req, res) => {
  try {
    const { departmentId } = req.params;
    const companyId = req.companyId;
    
    const result = await pool.query(
      `SELECT 
        jp.id,
        jp.title,
        jp.code,
        jp.job_grade as "jobGrade",
        jp.salary_range_min as "salaryRangeMin",
        jp.salary_range_max as "salaryRangeMax",
        jp.is_active as "isActive",
        COUNT(DISTINCT u.id) as "employeeCount"
      FROM job_positions jp
      LEFT JOIN users u ON u.job_position_id = jp.id 
        AND u.employment_status = 'active'
        AND u.company_id = $2
      WHERE jp.department_id = $1 
        AND jp.is_active = true
        AND jp.company_id = $2
      GROUP BY jp.id
      ORDER BY jp.title ASC`,
      [departmentId, companyId]
    );
    
    res.json({ positions: result.rows });
  } catch (error) {
    console.error('❌ Get positions by department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get positions by job grade - MUST BE BEFORE /:id
router.get('/grade/:grade', async (req, res) => {
  try {
    const { grade } = req.params;
    const companyId = req.companyId;
    
    const result = await pool.query(
      `SELECT 
        jp.id,
        jp.title,
        jp.code,
        jp.department_id as "departmentId",
        d.name as "departmentName",
        jp.salary_range_min as "salaryRangeMin",
        jp.salary_range_max as "salaryRangeMax",
        COUNT(DISTINCT u.id) as "employeeCount"
      FROM job_positions jp
      LEFT JOIN departments d ON jp.department_id = d.id AND d.company_id = $2
      LEFT JOIN users u ON u.job_position_id = jp.id 
        AND u.employment_status = 'active'
        AND u.company_id = $2
      WHERE jp.job_grade = $1 
        AND jp.is_active = true
        AND jp.company_id = $2
      GROUP BY jp.id, d.name
      ORDER BY jp.title ASC`,
      [grade, companyId]
    );
    
    res.json({ positions: result.rows });
  } catch (error) {
    console.error('❌ Get positions by grade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all job positions
router.get('/', async (req, res) => {
  try {
    const companyId = req.companyId;
    const { department_id, include_inactive } = req.query;
    
    let query = `
      SELECT 
        jp.id,
        jp.title,
        jp.code,
        jp.department_id as "departmentId",
        d.name as "departmentName",
        jp.job_grade as "jobGrade",
        jp.description,
        jp.responsibilities,
        jp.qualifications,
        jp.salary_range_min as "salaryRangeMin",
        jp.salary_range_max as "salaryRangeMax",
        jp.is_active as "isActive",
        jp.created_at as "createdAt",
        jp.updated_at as "updatedAt",
        COUNT(DISTINCT u.id) as "employeeCount"
      FROM job_positions jp
      LEFT JOIN departments d ON jp.department_id = d.id AND d.company_id = $1
      LEFT JOIN users u ON u.job_position_id = jp.id 
        AND u.employment_status = 'active'
        AND u.company_id = $1
      WHERE jp.company_id = $1
    `;
    
    const params = [companyId];
    let paramIndex = 2;
    
    // Filter by department if specified
    if (department_id) {
      query += ` AND jp.department_id = $${paramIndex}`;
      params.push(department_id);
      paramIndex++;
    }
    
    // Filter inactive positions unless requested
    if (include_inactive !== 'true') {
      query += ` AND jp.is_active = true`;
    }
    
    query += `
      GROUP BY jp.id, d.name
      ORDER BY jp.title ASC
    `;
    
    const result = await pool.query(query, params);
    
    res.json({ 
      positions: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Get job positions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single job position by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;
    
    const result = await pool.query(
      `SELECT 
        jp.id,
        jp.title,
        jp.code,
        jp.department_id as "departmentId",
        d.name as "departmentName",
        d.code as "departmentCode",
        jp.job_grade as "jobGrade",
        jp.description,
        jp.responsibilities,
        jp.qualifications,
        jp.salary_range_min as "salaryRangeMin",
        jp.salary_range_max as "salaryRangeMax",
        jp.is_active as "isActive",
        jp.created_at as "createdAt",
        jp.updated_at as "updatedAt"
      FROM job_positions jp
      LEFT JOIN departments d ON jp.department_id = d.id AND d.company_id = $2
      WHERE jp.id = $1 AND jp.company_id = $2`,
      [id, companyId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job position not found' });
    }
    
    // Get employees in this position (same company)
    const employeesResult = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.employee_number as "employeeNumber",
        u.employment_status as "employmentStatus",
        u.hire_date as "hireDate",
        ec.base_salary as "baseSalary"
      FROM users u
      LEFT JOIN employee_compensation ec ON ec.user_id = u.id AND ec.is_current = true AND ec.company_id = $2
      WHERE u.job_position_id = $1 
        AND u.company_id = $2
      ORDER BY u.name ASC`,
      [id, companyId]
    );
    
    // Get salary statistics (same company)
    const salaryStats = await pool.query(
      `SELECT 
        COUNT(*) as "employeeCount",
        MIN(ec.base_salary) as "minSalary",
        MAX(ec.base_salary) as "maxSalary",
        AVG(ec.base_salary) as "avgSalary"
      FROM employee_compensation ec
      JOIN users u ON ec.user_id = u.id
      WHERE u.job_position_id = $1 
        AND ec.is_current = true
        AND u.employment_status = 'active'
        AND ec.company_id = $2
        AND u.company_id = $2`,
      [id, companyId]
    );
    
    const position = result.rows[0];
    position.employees = employeesResult.rows;
    position.salaryStatistics = salaryStats.rows[0];
    
    res.json({ position });
  } catch (error) {
    console.error('❌ Get job position error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get salary benchmarking data
router.get('/:id/salary-benchmark', checkPermission('view_analytics'), async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;
    
    // Get position details (same company)
    const position = await pool.query(
      `SELECT 
        title,
        job_grade as "jobGrade",
        salary_range_min as "salaryRangeMin",
        salary_range_max as "salaryRangeMax"
      FROM job_positions
      WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );
    
    if (position.rows.length === 0) {
      return res.status(404).json({ error: 'Job position not found' });
    }
    
    // Get actual salaries (same company)
    const salaries = await pool.query(
      `SELECT 
        ec.base_salary as "baseSalary",
        u.hire_date as "hireDate",
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, u.hire_date)) as "yearsOfService"
      FROM employee_compensation ec
      JOIN users u ON ec.user_id = u.id
      WHERE u.job_position_id = $1 
        AND ec.is_current = true
        AND u.employment_status = 'active'
        AND ec.company_id = $2
        AND u.company_id = $2
      ORDER BY ec.base_salary ASC`,
      [id, companyId]
    );
    
    // Calculate percentiles
    const salaryValues = salaries.rows.map(s => parseFloat(s.baseSalary));
    const sortedSalaries = [...salaryValues].sort((a, b) => a - b);
    
    const percentile = (p) => {
      if (sortedSalaries.length === 0) return null;
      const index = Math.ceil((p / 100) * sortedSalaries.length) - 1;
      return sortedSalaries[Math.max(0, index)];
    };
    
    res.json({
      position: position.rows[0],
      statistics: {
        count: salaries.rows.length,
        min: sortedSalaries.length > 0 ? sortedSalaries[0] : null,
        max: sortedSalaries.length > 0 ? sortedSalaries[sortedSalaries.length - 1] : null,
        median: percentile(50),
        percentile25: percentile(25),
        percentile75: percentile(75),
        average: salaryValues.length > 0 ? 
          salaryValues.reduce((a, b) => a + b, 0) / salaryValues.length : null
      },
      salaryDistribution: salaries.rows
    });
  } catch (error) {
    console.error('❌ Get salary benchmark error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new job position
router.post(
  '/',
  checkPermission('manage_users'),
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('code').optional().trim(),
  body('departmentId').optional().isInt(),
  body('jobGrade').optional().trim(),
  body('description').optional().trim(),
  body('responsibilities').optional().trim(),
  body('qualifications').optional().trim(),
  body('salaryRangeMin').optional().isFloat({ min: 0 }),
  body('salaryRangeMax').optional().isFloat({ min: 0 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }
      
      const companyId = req.companyId;
      const { 
        title, 
        code, 
        departmentId, 
        jobGrade, 
        description, 
        responsibilities, 
        qualifications,
        salaryRangeMin,
        salaryRangeMax
      } = req.body;
      
      // Validate salary range
      if (salaryRangeMin && salaryRangeMax && salaryRangeMin > salaryRangeMax) {
        return res.status(400).json({ 
          error: 'Minimum salary cannot be greater than maximum salary' 
        });
      }
      
      // Check if code already exists in same company (if provided)
      if (code) {
        const existingCode = await pool.query(
          'SELECT id FROM job_positions WHERE code = $1 AND company_id = $2',
          [code, companyId]
        );
        
        if (existingCode.rows.length > 0) {
          return res.status(400).json({ error: 'Job position code already exists' });
        }
      }
      
      // Validate department exists in same company (if provided)
      if (departmentId) {
        const deptExists = await pool.query(
          'SELECT id FROM departments WHERE id = $1 AND is_active = true AND company_id = $2',
          [departmentId, companyId]
        );
        
        if (deptExists.rows.length === 0) {
          return res.status(400).json({ error: 'Department not found or inactive' });
        }
      }
      
      // Insert new job position with company_id
      const result = await pool.query(
        `INSERT INTO job_positions 
         (title, code, department_id, job_grade, description, responsibilities, 
          qualifications, salary_range_min, salary_range_max, is_active, company_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10)
         RETURNING 
           id,
           title,
           code,
           department_id as "departmentId",
           job_grade as "jobGrade",
           description,
           responsibilities,
           qualifications,
           salary_range_min as "salaryRangeMin",
           salary_range_max as "salaryRangeMax",
           is_active as "isActive",
           created_at as "createdAt"`,
        [
          title, 
          code || null, 
          departmentId || null, 
          jobGrade || null, 
          description || null,
          responsibilities || null,
          qualifications || null,
          salaryRangeMin || null,
          salaryRangeMax || null,
          companyId
        ]
      );
      
      console.log('✅ Job position created:', result.rows[0]);
      
      res.status(201).json({ 
        message: 'Job position created successfully',
        position: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Create job position error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update job position
router.put(
  '/:id',
  checkPermission('manage_users'),
  body('title').optional().trim().notEmpty(),
  body('code').optional().trim(),
  body('departmentId').optional().isInt(),
  body('jobGrade').optional().trim(),
  body('description').optional().trim(),
  body('responsibilities').optional().trim(),
  body('qualifications').optional().trim(),
  body('salaryRangeMin').optional().isFloat({ min: 0 }),
  body('salaryRangeMax').optional().isFloat({ min: 0 }),
  body('isActive').optional().isBoolean(),
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
        code, 
        departmentId, 
        jobGrade, 
        description, 
        responsibilities, 
        qualifications,
        salaryRangeMin,
        salaryRangeMax,
        isActive
      } = req.body;
      
      // Check if position exists in same company
      const posExists = await pool.query(
        'SELECT id, salary_range_min, salary_range_max FROM job_positions WHERE id = $1 AND company_id = $2',
        [id, companyId]
      );
      
      if (posExists.rows.length === 0) {
        return res.status(404).json({ error: 'Job position not found' });
      }
      
      const currentPosition = posExists.rows[0];
      
      // Validate salary range
      const newMin = salaryRangeMin !== undefined ? salaryRangeMin : currentPosition.salary_range_min;
      const newMax = salaryRangeMax !== undefined ? salaryRangeMax : currentPosition.salary_range_max;
      
      if (newMin && newMax && newMin > newMax) {
        return res.status(400).json({ 
          error: 'Minimum salary cannot be greater than maximum salary' 
        });
      }
      
      // Check for duplicate code in same company (excluding current position)
      if (code) {
        const duplicateCode = await pool.query(
          'SELECT id FROM job_positions WHERE code = $1 AND id != $2 AND company_id = $3',
          [code, id, companyId]
        );
        
        if (duplicateCode.rows.length > 0) {
          return res.status(400).json({ error: 'Job position code already exists' });
        }
      }
      
      // Validate department is in same company (if provided)
      if (departmentId) {
        const deptCheck = await pool.query(
          'SELECT id FROM departments WHERE id = $1 AND company_id = $2',
          [departmentId, companyId]
        );
        
        if (deptCheck.rows.length === 0) {
          return res.status(400).json({ error: 'Department not found' });
        }
      }
      
      // Build update query dynamically
      const updates = [];
      const values = [];
      let paramCount = 1;
      
      if (title !== undefined) {
        updates.push(`title = $${paramCount}`);
        values.push(title);
        paramCount++;
      }
      
      if (code !== undefined) {
        updates.push(`code = $${paramCount}`);
        values.push(code || null);
        paramCount++;
      }
      
      if (departmentId !== undefined) {
        updates.push(`department_id = $${paramCount}`);
        values.push(departmentId || null);
        paramCount++;
      }
      
      if (jobGrade !== undefined) {
        updates.push(`job_grade = $${paramCount}`);
        values.push(jobGrade || null);
        paramCount++;
      }
      
      if (description !== undefined) {
        updates.push(`description = $${paramCount}`);
        values.push(description || null);
        paramCount++;
      }
      
      if (responsibilities !== undefined) {
        updates.push(`responsibilities = $${paramCount}`);
        values.push(responsibilities || null);
        paramCount++;
      }
      
      if (qualifications !== undefined) {
        updates.push(`qualifications = $${paramCount}`);
        values.push(qualifications || null);
        paramCount++;
      }
      
      if (salaryRangeMin !== undefined) {
        updates.push(`salary_range_min = $${paramCount}`);
        values.push(salaryRangeMin || null);
        paramCount++;
      }
      
      if (salaryRangeMax !== undefined) {
        updates.push(`salary_range_max = $${paramCount}`);
        values.push(salaryRangeMax || null);
        paramCount++;
      }
      
      if (isActive !== undefined) {
        updates.push(`is_active = $${paramCount}`);
        values.push(isActive);
        paramCount++;
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      // Add updated_at
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      
      // Add ID and company_id for WHERE clause
      values.push(id);
      values.push(companyId);
      
      const query = `
        UPDATE job_positions
        SET ${updates.join(', ')}
        WHERE id = $${paramCount} AND company_id = $${paramCount + 1}
        RETURNING 
          id,
          title,
          code,
          department_id as "departmentId",
          job_grade as "jobGrade",
          description,
          responsibilities,
          qualifications,
          salary_range_min as "salaryRangeMin",
          salary_range_max as "salaryRangeMax",
          is_active as "isActive",
          updated_at as "updatedAt"
      `;
      
      const result = await pool.query(query, values);
      
      console.log('✅ Job position updated:', result.rows[0]);
      
      res.json({ 
        message: 'Job position updated successfully',
        position: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Update job position error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Reactivate job position
router.post(
  '/:id/reactivate',
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.companyId;
      
      const result = await pool.query(
        `UPDATE job_positions 
         SET is_active = true, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 AND company_id = $2
         RETURNING id, title`,
        [id, companyId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Job position not found' });
      }
      
      console.log('✅ Job position reactivated:', result.rows[0]);
      
      res.json({ 
        message: 'Job position reactivated successfully',
        position: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Reactivate job position error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete (deactivate) job position
router.delete(
  '/:id',
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.companyId;
      const { force } = req.query; // force=true for hard delete
      
      // Check if position exists in same company
      const posExists = await pool.query(
        'SELECT id, title FROM job_positions WHERE id = $1 AND company_id = $2',
        [id, companyId]
      );
      
      if (posExists.rows.length === 0) {
        return res.status(404).json({ error: 'Job position not found' });
      }
      
      // Check if position has employees in same company
      const employeeCount = await pool.query(
        `SELECT COUNT(*) as count 
         FROM users
         WHERE job_position_id = $1 
           AND employment_status = 'active'
           AND company_id = $2`,
        [id, companyId]
      );
      
      if (parseInt(employeeCount.rows[0].count) > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete job position with active employees',
          employeeCount: employeeCount.rows[0].count
        });
      }
      
      if (force === 'true') {
        // Hard delete (same company)
        await pool.query('DELETE FROM job_positions WHERE id = $1 AND company_id = $2', [id, companyId]);
        console.log('✅ Job position deleted (hard):', id);
        res.json({ message: 'Job position deleted permanently' });
      } else {
        // Soft delete (same company)
        await pool.query(
          'UPDATE job_positions SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND company_id = $2',
          [id, companyId]
        );
        console.log('✅ Job position deactivated:', id);
        res.json({ message: 'Job position deactivated successfully' });
      }
    } catch (error) {
      console.error('❌ Delete job position error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;