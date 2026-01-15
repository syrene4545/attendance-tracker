// server/routes/employeeProfile.routes.js
import express from 'express';
import { pool } from '../index.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';
import { extractTenant, verifyTenantAccess } from '../middleware/tenantMiddleware.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

const router = express.Router();

// ✅ Apply authentication and tenant extraction to ALL routes
router.use(protect);           // 1️⃣ Authenticate user
router.use(extractTenant);     // 2️⃣ Extract tenant context
router.use(verifyTenantAccess); // 3️⃣ Verify tenant access

// ==================== EMPLOYEE PROFILE ROUTES ====================

// Get employee statistics - MUST BE BEFORE /:userId
router.get('/stats/overview', async (req, res) => {
  try {
    const companyId = req.companyId;
    
    // Total employees in company
    const total = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE company_id = $1',
      [companyId]
    );
    
    // By status (scoped to company)
    const statusStats = await pool.query(
      `SELECT 
        employment_status,
        COUNT(*) as count
      FROM users
      WHERE company_id = $1
      GROUP BY employment_status`,
      [companyId]
    );
    
    const byStatus = {};
    statusStats.rows.forEach(row => {
      byStatus[row.employment_status] = parseInt(row.count);
    });
    
    // By department (scoped to company)
    const deptStats = await pool.query(
      `SELECT 
        d.name as department,
        COUNT(u.id) as count
      FROM departments d
      LEFT JOIN users u ON u.department_id = d.id AND u.company_id = $1
      WHERE d.company_id = $1
      GROUP BY d.name
      ORDER BY count DESC`,
      [companyId]
    );
    
    // By employment type (scoped to company)
    const typeStats = await pool.query(
      `SELECT 
        employment_type,
        COUNT(*) as count
      FROM users
      WHERE company_id = $1
      GROUP BY employment_type`,
      [companyId]
    );
    
    res.json({
      totalEmployees: parseInt(total.rows[0].count),
      byStatus,
      byDepartment: deptStats.rows,
      byEmploymentType: typeStats.rows
    });
  } catch (error) {
    console.error('❌ Get employee statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search employees (for quick lookup) - MUST BE BEFORE /:userId
router.get('/search/quick', async (req, res) => {
  try {
    const companyId = req.companyId;
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query too short (minimum 2 characters)' });
    }
    
    const result = await pool.query(
      `SELECT 
        u.id as "userId",
        u.employee_number as "employeeNumber",
        u.name,
        u.email,
        d.name as "departmentName",
        jp.title as "jobTitle"
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id AND d.company_id = $2
      LEFT JOIN job_positions jp ON u.job_position_id = jp.id AND jp.company_id = $2
      WHERE (
        LOWER(u.name) LIKE LOWER($1)
        OR LOWER(u.employee_number) LIKE LOWER($1)
        OR LOWER(u.email) LIKE LOWER($1)
      )
      AND u.employment_status = 'active'
      AND u.company_id = $2
      ORDER BY u.name ASC
      LIMIT 10`,
      [`%${q}%`, companyId]
    );
    
    res.json({ results: result.rows });
  } catch (error) {
    console.error('❌ Quick search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all employee profiles
router.get('/', async (req, res) => {
  try {
    const companyId = req.companyId;
    const { 
      department, 
      position, 
      status,
      employmentType,
      search,
      include_inactive 
    } = req.query;
    
    let query = `
      SELECT 
        u.id as "userId",
        u.email,
        u.role,
        u.employee_number as "employeeNumber",
        u.name,
        u.first_name as "firstName",
        u.middle_name as "middleName",
        u.last_name as "lastName",
        u.date_of_birth as "dateOfBirth",
        u.gender,
        u.marital_status as "maritalStatus",
        u.nationality,
        u.personal_email as "personalEmail",
        u.phone_number as "phoneNumber",
        u.mobile_number as "mobileNumber",
        u.emergency_contact_name as "emergencyContactName",
        u.emergency_contact_phone as "emergencyContactPhone",
        u.emergency_contact_relationship as "emergencyContactRelationship",
        u.street_address as "streetAddress",
        u.city,
        u.state_province as "stateProvince",
        u.postal_code as "postalCode",
        u.country,
        u.job_position_id as "jobPositionId",
        jp.title as "jobTitle",
        u.department_id as "departmentId",
        d.name as "departmentName",
        u.employment_type as "employmentType",
        u.employment_status as "employmentStatus",
        u.hire_date as "hireDate",
        u.work_location as "workLocation",
        u.work_hours_per_week as "workHoursPerWeek",
        u.current_salary as "currentSalary",
        u.payment_frequency as "paymentFrequency",
        u.id_number as "idNumber",
        u.passport_number as "passportNumber",
        u.tax_number as "taxNumber",
        u.bank_name as "bankName",
        u.account_number as "accountNumber",
        u.account_type as "accountType",
        u.branch_code as "branchCode",
        u.created_at as "createdAt",
        u.updated_at as "updatedAt"
      FROM users u
      LEFT JOIN job_positions jp ON u.job_position_id = jp.id AND jp.company_id = $1
      LEFT JOIN departments d ON u.department_id = d.id AND d.company_id = $1
      WHERE u.company_id = $1
    `;
    
    const params = [companyId];
    let paramIndex = 2;
    
    // Check permissions - regular users only see their own profile
    if (!['admin', 'hr'].includes(req.user.role)) {
      query += ` AND u.id = $${paramIndex}`;
      params.push(req.user.id);
      paramIndex++;
    }
    
    // Filter by department
    if (department) {
      query += ` AND u.department_id = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }
    
    // Filter by position
    if (position) {
      query += ` AND u.job_position_id = $${paramIndex}`;
      params.push(position);
      paramIndex++;
    }
    
    // Filter by employment status
    if (status) {
      query += ` AND u.employment_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    } else if (include_inactive !== 'true') {
      // Default: only show active employees
      query += ` AND u.employment_status = 'active'`;
    }

    // Filter by employment type
    if (employmentType) {
      query += ` AND u.employment_type = $${paramIndex}`;
      params.push(employmentType);
      paramIndex++;
    }
    
    // Search by name or employee number
    if (search) {
      query += ` AND (
        LOWER(u.name) LIKE LOWER($${paramIndex})
        OR LOWER(u.employee_number) LIKE LOWER($${paramIndex})
        OR LOWER(u.email) LIKE LOWER($${paramIndex})
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY u.name ASC`;
    
    const result = await pool.query(query, params);
    
    res.json({ 
      employees: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Get employee profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single employee profile by USER_ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const companyId = req.companyId;
    
    // Check permissions
    const canViewAll = ['admin', 'hr'].includes(req.user.role);
    
    // Verify user belongs to same company
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1 AND company_id = $2',
      [userId, companyId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Regular users can only view their own profile
    if (!canViewAll && parseInt(userId) !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get full employee profile
    const query = `
      SELECT 
        u.id as "userId",
        u.email,
        u.role,
        u.employee_number as "employeeNumber",
        u.name,
        u.first_name as "firstName",
        u.middle_name as "middleName",
        u.last_name as "lastName",
        u.date_of_birth as "dateOfBirth",
        u.gender,
        u.marital_status as "maritalStatus",
        u.nationality,
        u.personal_email as "personalEmail",
        u.phone_number as "phoneNumber",
        u.mobile_number as "mobileNumber",
        u.emergency_contact_name as "emergencyContactName",
        u.emergency_contact_phone as "emergencyContactPhone",
        u.emergency_contact_relationship as "emergencyContactRelationship",
        u.street_address as "streetAddress",
        u.city,
        u.state_province as "stateProvince",
        u.postal_code as "postalCode",
        u.country,
        u.job_position_id as "jobPositionId",
        jp.title as "jobTitle",
        u.department_id as "departmentId",
        d.name as "departmentName",
        u.employment_type as "employmentType",
        u.employment_status as "employmentStatus",
        u.hire_date as "hireDate",
        u.work_location as "workLocation",
        u.work_hours_per_week as "workHoursPerWeek",
        u.current_salary as "currentSalary",
        u.payment_frequency as "paymentFrequency",
        u.id_number as "idNumber",
        u.passport_number as "passportNumber",
        u.tax_number as "taxNumber",
        u.bank_name as "bankName",
        u.account_number as "accountNumber",
        u.account_type as "accountType",
        u.branch_code as "branchCode",
        u.notes,
        u.created_at as "createdAt",
        u.updated_at as "updatedAt"
      FROM users u
      LEFT JOIN job_positions jp ON u.job_position_id = jp.id AND jp.company_id = $2
      LEFT JOIN departments d ON u.department_id = d.id AND d.company_id = $2
      WHERE u.id = $1 AND u.company_id = $2
    `;
    
    const result = await pool.query(query, [userId, companyId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }
    
    const employee = result.rows[0];
    
    // ✅ Get leave balances (filter by company AND include company_id)
    const leaveBalances = await pool.query(
      `SELECT 
        leave_type as "leaveType",
        total_days as "totalDays",
        used_days as "usedDays",
        remaining_days as "remainingDays",
        year
      FROM leave_balances
      WHERE user_id = $1 
        AND company_id = $2
        AND year = EXTRACT(YEAR FROM CURRENT_DATE)
      ORDER BY leave_type`,
      [userId, companyId]
    );
    
    employee.leaveBalance = leaveBalances.rows;
    
    res.json({ employee });
  } catch (error) {
    console.error('❌ Get employee profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new employee profile
router.post(
  '/',
  checkPermission('manage_users'),
  body('email').isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('employeeNumber').trim().notEmpty(),
  body('hireDate').isISO8601(),
  body('role').isIn(['admin', 'hr', 'pharmacist', 'assistant']),
  body('departmentId').optional().isInt(),
  body('jobPositionId').optional().isInt(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      console.log('📥 Received employee data:', req.body);
      
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }
      
      const companyId = req.companyId;
      const {
        email,
        password = 'Welcome123!', // Default password
        role,
        employeeNumber,
        firstName,
        middleName,
        lastName,
        dateOfBirth,
        gender,
        maritalStatus,
        nationality,
        personalEmail,
        phoneNumber,
        mobileNumber,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelationship,
        streetAddress,
        city,
        stateProvince,
        postalCode,
        country,
        departmentId,
        jobPositionId,
        employmentType,
        hireDate,
        workLocation,
        workHoursPerWeek,
        idNumber,
        passportNumber,
        taxNumber,
        baseSalary,
        paymentFrequency,
        bankName,
        accountNumber,
        accountType,
        branchCode,
        notes
      } = req.body;
      
      // Check if email already exists in same company
      const emailExists = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND company_id = $2',
        [email, companyId]
      );
      
      if (emailExists.rows.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      
      // Check if employee number already exists in same company
      const empNumExists = await pool.query(
        'SELECT id FROM users WHERE employee_number = $1 AND company_id = $2',
        [employeeNumber, companyId]
      );
      
      if (empNumExists.rows.length > 0) {
        return res.status(400).json({ error: 'Employee number already exists' });
      }
      
      // Validate department exists in same company
      if (departmentId) {
        const deptExists = await pool.query(
          'SELECT id FROM departments WHERE id = $1 AND company_id = $2',
          [departmentId, companyId]
        );
        
        if (deptExists.rows.length === 0) {
          return res.status(400).json({ error: 'Department not found' });
        }
      }
      
      // Validate job position exists in same company
      if (jobPositionId) {
        const posExists = await pool.query(
          'SELECT id FROM job_positions WHERE id = $1 AND company_id = $2',
          [jobPositionId, companyId]
        );
        
        if (posExists.rows.length === 0) {
          return res.status(400).json({ error: 'Job position not found' });
        }
      }
      
      // Begin transaction
      await pool.query('BEGIN');
      
      try {
        // Create user account with all fields
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userResult = await pool.query(
          `INSERT INTO users (
            email, password, name, role, employee_number,
            first_name, middle_name, last_name, date_of_birth, gender, marital_status, nationality,
            personal_email, phone_number, mobile_number,
            emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
            street_address, city, state_province, postal_code, country,
            department_id, job_position_id, employment_type, employment_status, hire_date,
            work_location, work_hours_per_week,
            id_number, passport_number, tax_number,
            current_salary, payment_frequency,
            bank_name, account_number, account_type, branch_code,
            notes, company_id
          )
          VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10, $11, $12,
            $13, $14, $15,
            $16, $17, $18,
            $19, $20, $21, $22, $23,
            $24, $25, $26, $27, $28,
            $29, $30,
            $31, $32, $33,
            $34, $35,
            $36, $37, $38, $39,
            $40, $41
          )
          RETURNING id`,
          [
            email, hashedPassword, `${firstName} ${lastName}`, role, employeeNumber,
            firstName, middleName || null, lastName, dateOfBirth || null, gender || null, maritalStatus || null, nationality || null,
            personalEmail || null, phoneNumber || null, mobileNumber || null,
            emergencyContactName || null, emergencyContactPhone || null, emergencyContactRelationship || null,
            streetAddress || null, city || null, stateProvince || null, postalCode || null, country || 'South Africa',
            departmentId || null, jobPositionId || null, employmentType || 'full-time', 'active', hireDate,
            workLocation || null, workHoursPerWeek || 40,
            idNumber || null, passportNumber || null, taxNumber || null,
            baseSalary || null, paymentFrequency || 'monthly',
            bankName || null, accountNumber || null, accountType || 'cheque', branchCode || null,
            notes || null, companyId
          ]
        );
        
        const userId = userResult.rows[0].id;
        
        // ✅ CRITICAL FIX: Initialize leave balances WITH company_id
        const currentYear = new Date().getFullYear();
        await pool.query(
          `INSERT INTO leave_balances (
            company_id,
            user_id,
            leave_type,
            total_days,
            remaining_days,
            used_days,
            year
          )
          VALUES 
            ($1, $2, 'annual', 21, 21, 0, $3),
            ($1, $2, 'sick', 30, 30, 0, $3),
            ($1, $2, 'family_responsibility', 3, 3, 0, $3)
          ON CONFLICT (company_id, user_id, leave_type, year) DO NOTHING`,
          [companyId, userId, currentYear]
        );
        
        console.log('✅ Leave balances initialized with company_id:', companyId);
        
        // Commit transaction
        await pool.query('COMMIT');
        
        console.log('✅ Employee created:', {
          userId,
          employeeNumber,
          email,
          companyId
        });
        
        res.status(201).json({
          message: 'Employee created successfully',
          employee: {
            userId,
            employeeNumber,
            firstName,
            lastName,
            email,
            role
          }
        });
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('❌ Create employee error:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      res.status(500).json({ 
        error: 'Internal server error', 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Update employee profile by USER_ID
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const companyId = req.companyId;
    const updates = req.body;
    
    // Verify user belongs to same company
    const userCheck = await pool.query(
      'SELECT id, role FROM users WHERE id = $1 AND company_id = $2',
      [userId, companyId]
    );
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Check permissions
    const canEditAll = ['admin', 'hr'].includes(req.user.role);
    const isOwnProfile = parseInt(userId) === req.user.id;
    
    if (!canEditAll && !isOwnProfile) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    console.log('📥 Update request for userId:', userId);
    console.log('👤 Requesting user:', req.user.id, 'Role:', req.user.role);
    
    // Define which fields regular employees can edit
    const employeeEditableFields = [
      'mobileNumber',
      'personalEmail', 
      'phoneNumber',
      'streetAddress',
      'city',
      'stateProvince',
      'postalCode',
      'country',
      'emergencyContactName',
      'emergencyContactPhone',
      'emergencyContactRelationship'
    ];
    
    await pool.query('BEGIN');
    
    // Map of database columns to request body fields
    const fieldMapping = {
      first_name: 'firstName',
      middle_name: 'middleName',
      last_name: 'lastName',
      date_of_birth: 'dateOfBirth',
      gender: 'gender',
      marital_status: 'maritalStatus',
      nationality: 'nationality',
      personal_email: 'personalEmail',
      phone_number: 'phoneNumber',
      mobile_number: 'mobileNumber',
      emergency_contact_name: 'emergencyContactName',
      emergency_contact_phone: 'emergencyContactPhone',
      emergency_contact_relationship: 'emergencyContactRelationship',
      street_address: 'streetAddress',
      city: 'city',
      state_province: 'stateProvince',
      postal_code: 'postalCode',
      country: 'country',
      department_id: 'departmentId',
      job_position_id: 'jobPositionId',
      employment_type: 'employmentType',
      employment_status: 'employmentStatus',
      hire_date: 'hireDate',
      work_location: 'workLocation',
      work_hours_per_week: 'workHoursPerWeek',
      id_number: 'idNumber',
      passport_number: 'passportNumber',
      tax_number: 'taxNumber',
      current_salary: 'baseSalary',
      payment_frequency: 'paymentFrequency',
      bank_name: 'bankName',
      account_number: 'accountNumber',
      account_type: 'accountType',
      branch_code: 'branchCode',
      notes: 'notes'
    };
    
    const updateFields = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [dbField, jsonField] of Object.entries(fieldMapping)) {
      if (updates[jsonField] !== undefined) {
        // If regular employee, only allow editable fields
        if (!canEditAll && !employeeEditableFields.includes(jsonField)) {
          console.log(`⚠️ Skipping restricted field for employee: ${jsonField}`);
          continue;
        }
        
        updateFields.push(`${dbField} = $${paramIndex}`);
        values.push(updates[jsonField] || null);
        paramIndex++;
      }
    }
    
    if (updateFields.length > 0) {
      // Add updated_at
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      
      // Update name if first/last name changed
      if (updates.firstName && updates.lastName) {
        updateFields.push(`name = $${paramIndex}`);
        values.push(`${updates.firstName} ${updates.lastName}`);
        paramIndex++;
      }
      
      // Add userId and companyId for WHERE clause
      values.push(userId);
      values.push(companyId);
      
      const query = `
        UPDATE users
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex} AND company_id = $${paramIndex + 1}
      `;
      
      console.log('🔄 Executing update query:', query);
      console.log('📊 With values:', values);
      
      await pool.query(query, values);
    }
    
    await pool.query('COMMIT');
    
    console.log('✅ Employee profile updated for userId:', userId);
    
    res.json({ 
      message: 'Profile updated successfully',
      updatedFields: updateFields.length 
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('❌ Update employee profile error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update employment status (terminate, suspend, reactivate)
router.put(
  '/:userId/status',
  checkPermission('manage_users'),
  body('status').isIn(['active', 'on-leave', 'suspended', 'terminated']),
  body('reason').optional().trim(),
  body('effectiveDate').optional().isISO8601(),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const companyId = req.companyId;
      const { status, reason, effectiveDate } = req.body;
      
      const updates = ['employment_status = $1', 'updated_at = CURRENT_TIMESTAMP'];
      const values = [status];
      let paramIndex = 2;
      
      if (reason) {
        updates.push(`notes = $${paramIndex}`);
        values.push(reason);
        paramIndex++;
      }
      
      values.push(userId);
      values.push(companyId);
      
      const result = await pool.query(
        `UPDATE users
         SET ${updates.join(', ')}
         WHERE id = $${paramIndex} AND company_id = $${paramIndex + 1}
         RETURNING id, name, employment_status as "employmentStatus"`,
        values
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      console.log('✅ Employment status updated:', result.rows[0]);
      
      res.json({
        message: `Employee status changed to ${status}`,
        employee: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Update employment status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;