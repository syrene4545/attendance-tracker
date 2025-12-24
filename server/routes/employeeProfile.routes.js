// server/routes/employeeProfile.routes.js
import express from 'express';
import { pool } from '../index.js';
import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

const router = express.Router();

// ==================== EMPLOYEE PROFILE ROUTES ====================

// Get all employee profiles
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      department_id, 
      position_id, 
      employment_status, 
      search,
      include_inactive 
    } = req.query;
    
    let query = `
      SELECT 
        ep.id,
        ep.user_id as "userId",
        u.email,
        u.role,
        ep.employee_number as "employeeNumber",
        ep.first_name as "firstName",
        ep.middle_name as "middleName",
        ep.last_name as "lastName",
        CONCAT(ep.first_name, ' ', ep.last_name) as "fullName",
        ep.date_of_birth as "dateOfBirth",
        ep.gender,
        ep.phone_number as "phoneNumber",
        ep.mobile_number as "mobileNumber",
        ep.job_position_id as "jobPositionId",
        jp.title as "jobTitle",
        jp.job_grade as "jobGrade",
        ep.department_id as "departmentId",
        d.name as "departmentName",
        ep.reports_to_id as "reportsToId",
        manager.name as "managerName",
        ep.employment_type as "employmentType",
        ep.employment_status as "employmentStatus",
        ep.hire_date as "hireDate",
        ep.work_location as "workLocation",
        ec.base_salary as "baseSalary",
        ep.profile_photo_url as "profilePhotoUrl",
        ep.created_at as "createdAt",
        ep.updated_at as "updatedAt"
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      LEFT JOIN job_positions jp ON ep.job_position_id = jp.id
      LEFT JOIN departments d ON ep.department_id = d.id
      LEFT JOIN users manager ON ep.reports_to_id = manager.id
      LEFT JOIN employee_compensation ec ON ec.user_id = ep.user_id AND ec.is_current = true
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Check permissions - regular users only see their own profile
    if (!['admin', 'hr'].includes(req.user.role)) {
      query += ` AND ep.user_id = $${paramIndex}`;
      params.push(req.user.id);
      paramIndex++;
    }
    
    // Filter by department
    if (department_id) {
      query += ` AND ep.department_id = $${paramIndex}`;
      params.push(department_id);
      paramIndex++;
    }
    
    // Filter by position
    if (position_id) {
      query += ` AND ep.job_position_id = $${paramIndex}`;
      params.push(position_id);
      paramIndex++;
    }
    
    // Filter by employment status
    if (employment_status) {
      query += ` AND ep.employment_status = $${paramIndex}`;
      params.push(employment_status);
      paramIndex++;
    } else if (include_inactive !== 'true') {
      // Default: only show active employees
      query += ` AND ep.employment_status = 'active'`;
    }
    
    // Search by name or employee number
    if (search) {
      query += ` AND (
        LOWER(CONCAT(ep.first_name, ' ', ep.last_name)) LIKE LOWER($${paramIndex})
        OR LOWER(ep.employee_number) LIKE LOWER($${paramIndex})
        OR LOWER(u.email) LIKE LOWER($${paramIndex})
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY ep.first_name ASC, ep.last_name ASC`;
    
    const result = await pool.query(query, params);
    
    res.json({ 
      employees: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get employee profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single employee profile

// Get single employee profile by USER_ID
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check permissions
    const canViewAll = ['admin', 'hr'].includes(req.user.role);
    
    let query = `
      SELECT 
        ep.*,
        ep.user_id as "userId",
        u.email,
        u.role,
        u.name as "userName",
        jp.title as "jobTitle",
        jp.code as "jobCode",
        jp.job_grade as "jobGrade",
        d.name as "departmentName",
        d.code as "departmentCode",
        manager.name as "managerName",
        manager.email as "managerEmail"
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      LEFT JOIN job_positions jp ON ep.job_position_id = jp.id
      LEFT JOIN departments d ON ep.department_id = d.id
      LEFT JOIN users manager ON ep.reports_to_id = manager.id
      WHERE ep.user_id = $1
    `;
    
    const params = [userId];
    
    // Regular users can only view their own profile
    if (!canViewAll) {
      if (parseInt(userId) !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }
    
    const profile = result.rows[0];
    
    // Format for frontend (flatten the structure)
    const formattedProfile = {
      userId: profile.user_id,
      name: `${profile.first_name} ${profile.last_name}`,
      email: profile.email,
      employeeNumber: profile.employee_number,
      firstName: profile.first_name,
      middleName: profile.middle_name,
      lastName: profile.last_name,
      dateOfBirth: profile.date_of_birth,
      gender: profile.gender,
      maritalStatus: profile.marital_status,
      nationality: profile.nationality,
      personalEmail: profile.personal_email,
      phoneNumber: profile.phone_number,
      mobileNumber: profile.mobile_number,
      emergencyContactName: profile.emergency_contact_name,
      emergencyContactPhone: profile.emergency_contact_phone,
      emergencyContactRelationship: profile.emergency_contact_relationship,
      streetAddress: profile.street_address,
      city: profile.city,
      stateProvince: profile.state_province,
      postalCode: profile.postal_code,
      country: profile.country,
      jobPositionId: profile.job_position_id,
      jobTitle: profile.jobTitle,
      jobCode: profile.jobCode,
      jobGrade: profile.jobGrade,
      departmentId: profile.department_id,
      departmentName: profile.departmentName,
      departmentCode: profile.departmentCode,
      reportsToId: profile.reports_to_id,
      managerName: profile.managerName,
      managerEmail: profile.managerEmail,
      employmentType: profile.employment_type,
      employmentStatus: profile.employment_status,
      hireDate: profile.hire_date,
      probationEndDate: profile.probation_end_date,
      confirmationDate: profile.confirmation_date,
      terminationDate: profile.termination_date,
      terminationReason: profile.termination_reason,
      workLocation: profile.work_location,
      shiftType: profile.shift_type,
      workHoursPerWeek: profile.work_hours_per_week,
      idNumber: profile.id_number,
      passportNumber: profile.passport_number,
      taxNumber: profile.tax_number,
      socialSecurityNumber: profile.social_security_number,
      profilePhotoUrl: profile.profile_photo_url,
      notes: profile.notes,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at
    };
    
    // Get compensation if admin/hr or own profile
    if (canViewAll || parseInt(userId) === req.user.id) {
      const compensation = await pool.query(
        `SELECT 
          base_salary as "baseSalary",
          salary_type as "salaryType",
          currency,
          payment_frequency as "paymentFrequency",
          payment_method as "paymentMethod",
          bank_name as "bankName",
          bank_account_number as "bankAccountNumber",
          effective_from as "effectiveFrom"
        FROM employee_compensation
        WHERE user_id = $1 AND is_current = true`,
        [userId]
      );
      
      if (compensation.rows.length > 0) {
        formattedProfile.currentSalary = compensation.rows[0].baseSalary;
        formattedProfile.paymentFrequency = compensation.rows[0].paymentFrequency;
      }
    }
    
    // Get leave balances
    const leaveBalances = await pool.query(
      `SELECT 
        leave_type as "leaveType",
        total_days as "totalDays",
        used_days as "usedDays",
        remaining_days as "remainingDays",
        year
      FROM employee_leave_balances
      WHERE user_id = $1 AND year = EXTRACT(YEAR FROM CURRENT_DATE)
      ORDER BY leave_type`,
      [userId]
    );
    
    formattedProfile.leaveBalance = leaveBalances.rows;
    
    res.json({ employee: formattedProfile });
  } catch (error) {
    console.error('Get employee profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new employee profile
router.post(
  '/',
  authenticateToken,
  checkPermission('manage_employees'),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
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
      console.log('📥 Received employee data:', req.body); // ✅ ADD THIS
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array()); // ✅ ADD THIS
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }
      
      const {
        email,
        password,
        role,
        firstName,
        middleName,
        lastName,
        employeeNumber,
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
        reportsToId,
        employmentType,
        hireDate,
        probationEndDate,
        workLocation,
        shiftType,
        workHoursPerWeek,
        idNumber,
        passportNumber,
        taxNumber,
        socialSecurityNumber,
        baseSalary,
        salaryType,
        paymentFrequency
      } = req.body;
      
      // Check if email already exists
      const emailExists = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      
      if (emailExists.rows.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      
      // Check if employee number already exists
      const empNumExists = await pool.query(
        'SELECT id FROM employee_profiles WHERE employee_number = $1',
        [employeeNumber]
      );
      
      if (empNumExists.rows.length > 0) {
        return res.status(400).json({ error: 'Employee number already exists' });
      }
      
      // Validate department exists
      if (departmentId) {
        const deptExists = await pool.query(
          'SELECT id FROM departments WHERE id = $1 AND is_active = true',
          [departmentId]
        );
        
        if (deptExists.rows.length === 0) {
          return res.status(400).json({ error: 'Department not found or inactive' });
        }
      }
      
      // Validate job position exists
      if (jobPositionId) {
        const posExists = await pool.query(
          'SELECT id FROM job_positions WHERE id = $1 AND is_active = true',
          [jobPositionId]
        );
        
        if (posExists.rows.length === 0) {
          return res.status(400).json({ error: 'Job position not found or inactive' });
        }
      }
      
      // Begin transaction
      await pool.query('BEGIN');
      
      try {
        // 1. Create user account
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userResult = await pool.query(
          `INSERT INTO users (email, password, name, role, department)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [email, hashedPassword, `${firstName} ${lastName}`, role, departmentId || null]
        );
        
        const userId = userResult.rows[0].id;
        
        // 2. Create employee profile
        const profileResult = await pool.query(
          `INSERT INTO employee_profiles (
            user_id, employee_number, first_name, middle_name, last_name,
            date_of_birth, gender, marital_status, nationality,
            personal_email, phone_number, mobile_number,
            emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
            street_address, city, state_province, postal_code, country,
            job_position_id, department_id, reports_to_id,
            employment_type, employment_status, hire_date, probation_end_date,
            work_location, shift_type, work_hours_per_week,
            id_number, passport_number, tax_number, social_security_number
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 
                  $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, 
                  $29, $30, $31, $32, $33, $34)
          RETURNING id`,
          [
            userId, employeeNumber, firstName, middleName || null, lastName,
            dateOfBirth || null, gender || null, maritalStatus || null, nationality || null,
            personalEmail || null, phoneNumber || null, mobileNumber || null,
            emergencyContactName || null, emergencyContactPhone || null, emergencyContactRelationship || null,
            streetAddress || null, city || null, stateProvince || null, postalCode || null, country || null,
            jobPositionId || null, departmentId || null, reportsToId || null,
            employmentType || 'full-time', 'active', hireDate, probationEndDate || null,
            workLocation || null, shiftType || 'day', workHoursPerWeek || 40,
            idNumber || null, passportNumber || null, taxNumber || null, socialSecurityNumber || null
          ]
        );
        
        const profileId = profileResult.rows[0].id;
        
        // 3. Create compensation record if salary provided
        if (baseSalary) {
          await pool.query(
            `INSERT INTO employee_compensation (
              user_id, salary_type, base_salary, currency, payment_frequency,
              effective_from, is_current, created_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, true, $7)`,
            [
              userId,
              salaryType || 'monthly',
              baseSalary,
              'ZAR',
              paymentFrequency || 'monthly',
              hireDate,
              req.user.id
            ]
          );
        }
        
        // 4. Initialize leave balances (annual leave - 21 days for South Africa)
        const currentYear = new Date().getFullYear();
        await pool.query(
          `INSERT INTO employee_leave_balances (user_id, leave_type, total_days, remaining_days, year)
           VALUES 
             ($1, 'annual', 21, 21, $2),
             ($1, 'sick', 30, 30, $2),
             ($1, 'unpaid', 0, 0, $2)`,
          [userId, currentYear]
        );
        
        // Commit transaction
        await pool.query('COMMIT');
        
        console.log('✅ Employee profile created:', {
          userId,
          profileId,
          employeeNumber
        });
        
        res.status(201).json({
          message: 'Employee profile created successfully',
          employee: {
            id: profileId,
            userId,
            employeeNumber,
            firstName,
            lastName,
            email,
            role
          }
        });
      } catch (error) {
        // Rollback transaction on error
        await pool.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Create employee profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update employee profile

// Update employee profile by USER_ID

router.put(
  '/:userId',
  authenticateToken,
  // ✅ Remove the permission check or add custom logic
  async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;
      
      // ✅ Check if user can edit this profile
      const canEditAll = ['admin', 'hr'].includes(req.user.role);
      const isOwnProfile = parseInt(userId) === req.user.id;
      
      if (!canEditAll && !isOwnProfile) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      console.log('📥 Update request for userId:', userId);
      console.log('📥 Update data:', updates);
      console.log('👤 Requesting user:', req.user.id, 'Role:', req.user.role);
      
      // ✅ Define which fields regular employees can edit
      const employeeEditableFields = [
        'mobileNumber',
        'personalEmail', 
        'phoneNumber',
        'streetAddress',
        'city',
        'stateProvince',
        'postalCode',
        'emergencyContactName',
        'emergencyContactPhone',
        'emergencyContactRelationship'
      ];
      
      // Check if profile exists
      const profileExists = await pool.query(
        'SELECT id FROM employee_profiles WHERE user_id = $1',
        [userId]
      );
      
      if (profileExists.rows.length === 0) {
        return res.status(404).json({ error: 'Employee profile not found' });
      }
      
      await pool.query('BEGIN');
      
      // Build dynamic update query for employee_profiles
      const allowedFields = {
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
        job_position_id: 'jobPositionId',
        department_id: 'departmentId',
        reports_to_id: 'reportsToId',
        employment_type: 'employmentType',
        employment_status: 'employmentStatus',
        hire_date: 'hireDate',
        probation_end_date: 'probationEndDate',
        confirmation_date: 'confirmationDate',
        termination_date: 'terminationDate',
        termination_reason: 'terminationReason',
        work_location: 'workLocation',
        shift_type: 'shiftType',
        work_hours_per_week: 'workHoursPerWeek',
        id_number: 'idNumber',
        passport_number: 'passportNumber',
        tax_number: 'taxNumber',
        social_security_number: 'socialSecurityNumber',
        profile_photo_url: 'profilePhotoUrl',
        notes: 'notes'
      };
      
      const updateFields = [];
      const values = [];
      let paramIndex = 1;
      
      for (const [dbField, jsonField] of Object.entries(allowedFields)) {
        if (updates[jsonField] !== undefined) {
          // ✅ If regular employee, only allow editable fields
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
        
        // Add userId for WHERE clause
        values.push(userId);
        
        const query = `
          UPDATE employee_profiles
          SET ${updateFields.join(', ')}
          WHERE user_id = $${paramIndex}
        `;
        
        await pool.query(query, values);
      }
      
      // ✅ Only admins can update user table name
      if (canEditAll && (updates.firstName || updates.lastName)) {
        const firstName = updates.firstName;
        const lastName = updates.lastName;
        
        if (firstName && lastName) {
          await pool.query(
            'UPDATE users SET name = $1 WHERE id = $2',
            [`${firstName} ${lastName}`, userId]
          );
        }
      }
      
      // ✅ Only admins can update compensation
      if (canEditAll && updates.baseSalary) {
        // Mark old compensation as not current
        await pool.query(
          `UPDATE employee_compensation 
           SET is_current = false, effective_to = CURRENT_DATE
           WHERE user_id = $1 AND is_current = true`,
          [userId]
        );
        
        // Insert new compensation
        await pool.query(
          `INSERT INTO employee_compensation (
            user_id, base_salary, salary_type, payment_frequency,
            currency, effective_from, is_current, created_by
          ) VALUES ($1, $2, 'monthly', 'monthly', 'ZAR', CURRENT_DATE, true, $3)`,
          [userId, updates.baseSalary, req.user.id]
        );
      }
      
      await pool.query('COMMIT');
      
      console.log('✅ Employee profile updated for userId:', userId);
      
      res.json({ 
        message: 'Profile updated successfully',
        updatedFields: updateFields.length 
      });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Update employee profile error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update employment status (terminate, suspend, reactivate)
router.put(
  '/:id/status',
  authenticateToken,
  checkPermission('manage_employees'),
  body('status').isIn(['active', 'on-leave', 'suspended', 'terminated']),
  body('reason').optional().trim(),
  body('effectiveDate').optional().isISO8601(),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reason, effectiveDate } = req.body;
      
      const updates = ['employment_status = $1', 'updated_at = CURRENT_TIMESTAMP'];
      const values = [status];
      let paramIndex = 2;
      
      if (status === 'terminated') {
        updates.push(`termination_date = $${paramIndex}`);
        values.push(effectiveDate || new Date().toISOString().split('T')[0]);
        paramIndex++;
        
        if (reason) {
          updates.push(`termination_reason = $${paramIndex}`);
          values.push(reason);
          paramIndex++;
        }
      }
      
      values.push(id);
      
      const result = await pool.query(
        `UPDATE employee_profiles
         SET ${updates.join(', ')}
         WHERE id = $${paramIndex}
         RETURNING user_id, first_name, last_name, employment_status`,
        values
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Employee profile not found' });
      }
      
      console.log('✅ Employment status updated:', result.rows[0]);
      
      res.json({
        message: `Employee status changed to ${status}`,
        employee: result.rows[0]
      });
    } catch (error) {
      console.error('Update employment status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get employee statistics

// Get employee statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    // Total employees
    const total = await pool.query(
      'SELECT COUNT(*) as count FROM employee_profiles WHERE employment_status = $1',
      ['active']
    );
    
    // By status
    const statusStats = await pool.query(
      `SELECT 
        employment_status,
        COUNT(*) as count
      FROM employee_profiles
      GROUP BY employment_status`
    );
    
    const byStatus = {};
    statusStats.rows.forEach(row => {
      byStatus[row.employment_status] = parseInt(row.count);
    });
    
    // By department
    const deptStats = await pool.query(
      `SELECT 
        d.name as department,
        COUNT(ep.id) as count
      FROM departments d
      LEFT JOIN employee_profiles ep ON ep.department_id = d.id 
        AND ep.employment_status = 'active'
      WHERE d.is_active = true
      GROUP BY d.name
      ORDER BY count DESC`
    );
    
    // By employment type
    const typeStats = await pool.query(
      `SELECT 
        employment_type,
        COUNT(*) as count
      FROM employee_profiles
      WHERE employment_status = 'active'
      GROUP BY employment_type`
    );
    
    res.json({
      totalEmployees: parseInt(total.rows[0].count),
      byStatus,
      byDepartment: deptStats.rows,
      byEmploymentType: typeStats.rows
    });
  } catch (error) {
    console.error('Get employee statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get employees with birthdays this month
router.get('/birthdays/this-month', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        ep.id,
        ep.first_name as "firstName",
        ep.last_name as "lastName",
        ep.date_of_birth as "dateOfBirth",
        EXTRACT(DAY FROM ep.date_of_birth) as "day",
        d.name as "departmentName"
      FROM employee_profiles ep
      LEFT JOIN departments d ON ep.department_id = d.id
      WHERE EXTRACT(MONTH FROM ep.date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND ep.employment_status = 'active'
      ORDER BY EXTRACT(DAY FROM ep.date_of_birth) ASC`
    );
    
    res.json({ birthdays: result.rows });
  } catch (error) {
    console.error('Get birthdays error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get employees on probation
router.get('/probation/list', authenticateToken, checkPermission('view_employees'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        ep.id,
        ep.employee_number as "employeeNumber",
        ep.first_name as "firstName",
        ep.last_name as "lastName",
        u.email,
        ep.hire_date as "hireDate",
        ep.probation_end_date as "probationEndDate",
        d.name as "departmentName",
        jp.title as "jobTitle"
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      LEFT JOIN departments d ON ep.department_id = d.id
      LEFT JOIN job_positions jp ON ep.job_position_id = jp.id
      WHERE ep.probation_end_date >= CURRENT_DATE
        AND ep.employment_status = 'active'
        AND ep.confirmation_date IS NULL
      ORDER BY ep.probation_end_date ASC`
    );
    
    res.json({ employees: result.rows });
  } catch (error) {
    console.error('Get probation list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search employees (for quick lookup)
router.get('/search/quick', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query too short (minimum 2 characters)' });
    }
    
    const result = await pool.query(
      `SELECT 
        ep.id,
        ep.user_id as "userId",
        ep.employee_number as "employeeNumber",
        ep.first_name as "firstName",
        ep.last_name as "lastName",
        u.email,
        d.name as "departmentName",
        jp.title as "jobTitle"
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      LEFT JOIN departments d ON ep.department_id = d.id
      LEFT JOIN job_positions jp ON ep.job_position_id = jp.id
      WHERE (
        LOWER(CONCAT(ep.first_name, ' ', ep.last_name)) LIKE LOWER($1)
        OR LOWER(ep.employee_number) LIKE LOWER($1)
        OR LOWER(u.email) LIKE LOWER($1)
      )
      AND ep.employment_status = 'active'
      ORDER BY ep.first_name ASC
      LIMIT 10`,
      [`%${q}%`]
    );
    
    res.json({ results: result.rows });
  } catch (error) {
    console.error('Quick search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;