// server/routes/compensation.routes.js
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

// ==================== COMPENSATION ROUTES ====================

// ==================== SALARY MANAGEMENT ====================

// Get employee's compensation history
router.get('/salary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const companyId = req.companyId;
    
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
    
    const result = await pool.query(
      `SELECT 
        ec.id,
        ec.salary_type as "salaryType",
        ec.base_salary as "baseSalary",
        ec.currency,
        ec.payment_frequency as "paymentFrequency",
        ec.payment_method as "paymentMethod",
        ec.bank_name as "bankName",
        ec.bank_account_number as "bankAccountNumber",
        ec.bank_branch_code as "bankBranchCode",
        ec.bank_account_type as "bankAccountType",
        ec.effective_from as "effectiveFrom",
        ec.effective_to as "effectiveTo",
        ec.is_current as "isCurrent",
        ec.created_by as "createdBy",
        creator.name as "createdByName",
        ec.created_at as "createdAt"
      FROM employee_compensation ec
      LEFT JOIN users creator ON ec.created_by = creator.id
      WHERE ec.user_id = $1 AND ec.company_id = $2
      ORDER BY ec.effective_from DESC`,
      [userId, companyId]
    );
    
    res.json({ salaryHistory: result.rows });
  } catch (error) {
    console.error('❌ Get salary history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current compensation for employee
router.get('/salary/:userId/current', async (req, res) => {
  try {
    const { userId } = req.params;
    const companyId = req.companyId;
    
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
    
    const result = await pool.query(
      `SELECT 
        ec.id,
        ec.salary_type as "salaryType",
        ec.base_salary as "baseSalary",
        ec.currency,
        ec.payment_frequency as "paymentFrequency",
        ec.payment_method as "paymentMethod",
        ec.bank_name as "bankName",
        ec.bank_account_number as "bankAccountNumber",
        ec.bank_branch_code as "bankBranchCode",
        ec.bank_account_type as "bankAccountType",
        ec.effective_from as "effectiveFrom"
      FROM employee_compensation ec
      WHERE ec.user_id = $1 AND ec.is_current = true AND ec.company_id = $2`,
      [userId, companyId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No current compensation found' });
    }
    
    res.json({ compensation: result.rows[0] });
  } catch (error) {
    console.error('❌ Get current compensation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new salary record (creates new, marks old as historical)
router.post(
  '/salary/:userId',
  checkPermission('manage_payroll'),
  body('baseSalary').isFloat({ min: 0 }).withMessage('Base salary must be a positive number'),
  body('salaryType').isIn(['hourly', 'monthly', 'annual']),
  body('paymentFrequency').isIn(['weekly', 'bi-weekly', 'monthly']),
  body('effectiveFrom').isISO8601(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }
      
      const { userId } = req.params;
      const companyId = req.companyId;
      const {
        baseSalary,
        salaryType,
        currency,
        paymentFrequency,
        paymentMethod,
        bankName,
        bankAccountNumber,
        bankBranchCode,
        bankAccountType,
        effectiveFrom
      } = req.body;
      
      // Verify user exists in same company
      const userExists = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND company_id = $2',
        [userId, companyId]
      );
      
      if (userExists.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Begin transaction
      await pool.query('BEGIN');
      
      try {
        // Mark current compensation as historical (within same company)
        await pool.query(
          `UPDATE employee_compensation 
           SET is_current = false, 
               effective_to = $1
           WHERE user_id = $2 AND is_current = true AND company_id = $3`,
          [effectiveFrom, userId, companyId]
        );
        
        // Insert new compensation record with company_id
        const result = await pool.query(
          `INSERT INTO employee_compensation (
            user_id, salary_type, base_salary, currency, payment_frequency,
            payment_method, bank_name, bank_account_number, bank_branch_code,
            bank_account_type, effective_from, is_current, created_by, company_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12, $13)
          RETURNING 
            id,
            base_salary as "baseSalary",
            salary_type as "salaryType",
            effective_from as "effectiveFrom"`,
          [
            userId,
            salaryType,
            baseSalary,
            currency || 'ZAR',
            paymentFrequency,
            paymentMethod || 'bank-transfer',
            bankName || null,
            bankAccountNumber || null,
            bankBranchCode || null,
            bankAccountType || null,
            effectiveFrom,
            req.user.id,
            companyId
          ]
        );
        
        await pool.query('COMMIT');
        
        console.log('✅ New salary record created:', result.rows[0]);
        
        res.status(201).json({
          message: 'Salary updated successfully',
          compensation: result.rows[0]
        });
      } catch (error) {
        await pool.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('❌ Add salary record error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update current salary (bank details, payment method, etc.)
router.put(
  '/salary/:userId/current',
  checkPermission('manage_payroll'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const companyId = req.companyId;
      const {
        paymentMethod,
        bankName,
        bankAccountNumber,
        bankBranchCode,
        bankAccountType
      } = req.body;
      
      const updates = [];
      const values = [];
      let paramIndex = 1;
      
      if (paymentMethod !== undefined) {
        updates.push(`payment_method = $${paramIndex}`);
        values.push(paymentMethod);
        paramIndex++;
      }
      
      if (bankName !== undefined) {
        updates.push(`bank_name = $${paramIndex}`);
        values.push(bankName);
        paramIndex++;
      }
      
      if (bankAccountNumber !== undefined) {
        updates.push(`bank_account_number = $${paramIndex}`);
        values.push(bankAccountNumber);
        paramIndex++;
      }
      
      if (bankBranchCode !== undefined) {
        updates.push(`bank_branch_code = $${paramIndex}`);
        values.push(bankBranchCode);
        paramIndex++;
      }
      
      if (bankAccountType !== undefined) {
        updates.push(`bank_account_type = $${paramIndex}`);
        values.push(bankAccountType);
        paramIndex++;
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(userId);
      values.push(companyId);
      
      const result = await pool.query(
        `UPDATE employee_compensation
         SET ${updates.join(', ')}
         WHERE user_id = $${paramIndex} AND is_current = true AND company_id = $${paramIndex + 1}
         RETURNING id`,
        values
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'No current compensation found' });
      }
      
      res.json({ message: 'Bank details updated successfully' });
    } catch (error) {
      console.error('❌ Update bank details error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ==================== ALLOWANCES MANAGEMENT ====================

// Get all allowances for an employee
router.get('/allowances/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const companyId = req.companyId;
    const { include_inactive } = req.query;
    
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
    
    let query = `
      SELECT 
        id,
        allowance_type as "allowanceType",
        amount,
        is_taxable as "isTaxable",
        is_recurring as "isRecurring",
        frequency,
        effective_from as "effectiveFrom",
        effective_to as "effectiveTo",
        is_active as "isActive",
        notes,
        created_at as "createdAt"
      FROM employee_allowances
      WHERE user_id = $1 AND company_id = $2
    `;
    
    const queryParams = [userId, companyId];
    
    if (include_inactive !== 'true') {
      query += ` AND is_active = true`;
    }
    
    query += ` ORDER BY allowance_type ASC`;
    
    const result = await pool.query(query, queryParams);
    
    res.json({ allowances: result.rows });
  } catch (error) {
    console.error('❌ Get allowances error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active allowances summary
router.get('/allowances/:userId/summary', async (req, res) => {
  try {
    const { userId } = req.params;
    const companyId = req.companyId;
    
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
    
    const result = await pool.query(
      `SELECT 
        SUM(CASE WHEN is_taxable = true THEN amount ELSE 0 END) as "totalTaxable",
        SUM(CASE WHEN is_taxable = false THEN amount ELSE 0 END) as "totalNonTaxable",
        SUM(amount) as "totalAllowances",
        COUNT(*) as "count"
      FROM employee_allowances
      WHERE user_id = $1 AND is_active = true AND company_id = $2`,
      [userId, companyId]
    );
    
    res.json({ summary: result.rows[0] });
  } catch (error) {
    console.error('❌ Get allowances summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new allowance
router.post(
  '/allowances/:userId',
  checkPermission('manage_payroll'),
  body('allowanceType').trim().notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('isTaxable').isBoolean(),
  body('isRecurring').isBoolean(),
  body('frequency').optional().isIn(['monthly', 'quarterly', 'annual', 'once-off']),
  body('effectiveFrom').isISO8601(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }
      
      const { userId } = req.params;
      const companyId = req.companyId;
      const {
        allowanceType,
        amount,
        isTaxable,
        isRecurring,
        frequency,
        effectiveFrom,
        effectiveTo,
        notes
      } = req.body;
      
      const result = await pool.query(
        `INSERT INTO employee_allowances (
          user_id, allowance_type, amount, is_taxable, is_recurring,
          frequency, effective_from, effective_to, is_active, notes, company_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, $10)
        RETURNING 
          id,
          allowance_type as "allowanceType",
          amount,
          is_taxable as "isTaxable",
          frequency,
          effective_from as "effectiveFrom"`,
        [
          userId,
          allowanceType,
          amount,
          isTaxable,
          isRecurring,
          frequency || 'monthly',
          effectiveFrom,
          effectiveTo || null,
          notes || null,
          companyId
        ]
      );
      
      console.log('✅ Allowance added:', result.rows[0]);
      
      res.status(201).json({
        message: 'Allowance added successfully',
        allowance: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Add allowance error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update allowance
router.put(
  '/allowances/:id',
  checkPermission('manage_payroll'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.companyId;
      const {
        amount,
        isTaxable,
        isRecurring,
        frequency,
        effectiveTo,
        isActive,
        notes
      } = req.body;
      
      const updates = [];
      const values = [];
      let paramIndex = 1;
      
      if (amount !== undefined) {
        updates.push(`amount = $${paramIndex}`);
        values.push(amount);
        paramIndex++;
      }
      
      if (isTaxable !== undefined) {
        updates.push(`is_taxable = $${paramIndex}`);
        values.push(isTaxable);
        paramIndex++;
      }
      
      if (isRecurring !== undefined) {
        updates.push(`is_recurring = $${paramIndex}`);
        values.push(isRecurring);
        paramIndex++;
      }
      
      if (frequency !== undefined) {
        updates.push(`frequency = $${paramIndex}`);
        values.push(frequency);
        paramIndex++;
      }
      
      if (effectiveTo !== undefined) {
        updates.push(`effective_to = $${paramIndex}`);
        values.push(effectiveTo);
        paramIndex++;
      }
      
      if (isActive !== undefined) {
        updates.push(`is_active = $${paramIndex}`);
        values.push(isActive);
        paramIndex++;
      }
      
      if (notes !== undefined) {
        updates.push(`notes = $${paramIndex}`);
        values.push(notes);
        paramIndex++;
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      values.push(companyId);
      
      const result = await pool.query(
        `UPDATE employee_allowances
         SET ${updates.join(', ')}
         WHERE id = $${paramIndex} AND company_id = $${paramIndex + 1}
         RETURNING id`,
        values
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Allowance not found' });
      }
      
      res.json({ message: 'Allowance updated successfully' });
    } catch (error) {
      console.error('❌ Update allowance error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Deactivate allowance
router.delete(
  '/allowances/:id',
  checkPermission('manage_payroll'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.companyId;
      
      const result = await pool.query(
        `UPDATE employee_allowances
         SET is_active = false, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND company_id = $2
         RETURNING id, allowance_type`,
        [id, companyId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Allowance not found' });
      }
      
      console.log('✅ Allowance deactivated:', result.rows[0]);
      
      res.json({ message: 'Allowance deactivated successfully' });
    } catch (error) {
      console.error('❌ Deactivate allowance error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ==================== DEDUCTIONS MANAGEMENT ====================

// Get all deductions for an employee
router.get('/deductions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const companyId = req.companyId;
    const { include_inactive } = req.query;
    
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
    
    let query = `
      SELECT 
        id,
        deduction_type as "deductionType",
        amount,
        percentage,
        is_percentage as "isPercentage",
        is_mandatory as "isMandatory",
        is_recurring as "isRecurring",
        frequency,
        effective_from as "effectiveFrom",
        effective_to as "effectiveTo",
        remaining_installments as "remainingInstallments",
        is_active as "isActive",
        notes,
        created_at as "createdAt"
      FROM employee_deductions
      WHERE user_id = $1 AND company_id = $2
    `;
    
    const queryParams = [userId, companyId];
    
    if (include_inactive !== 'true') {
      query += ` AND is_active = true`;
    }
    
    query += ` ORDER BY is_mandatory DESC, deduction_type ASC`;
    
    const result = await pool.query(query, queryParams);
    
    res.json({ deductions: result.rows });
  } catch (error) {
    console.error('❌ Get deductions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get active deductions summary
router.get('/deductions/:userId/summary', async (req, res) => {
  try {
    const { userId } = req.params;
    const companyId = req.companyId;
    
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
    
    const result = await pool.query(
      `SELECT 
        SUM(CASE WHEN is_percentage = false THEN amount ELSE 0 END) as "totalFixedDeductions",
        SUM(CASE WHEN is_mandatory = true THEN amount ELSE 0 END) as "totalMandatory",
        COUNT(*) as "count"
      FROM employee_deductions
      WHERE user_id = $1 AND is_active = true AND company_id = $2`,
      [userId, companyId]
    );
    
    res.json({ summary: result.rows[0] });
  } catch (error) {
    console.error('❌ Get deductions summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new deduction
router.post(
  '/deductions/:userId',
  checkPermission('manage_payroll'),
  body('deductionType').trim().notEmpty(),
  body('isPercentage').isBoolean(),
  body('isMandatory').isBoolean(),
  body('isRecurring').isBoolean(),
  body('effectiveFrom').isISO8601(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }
      
      const { userId } = req.params;
      const companyId = req.companyId;
      const {
        deductionType,
        amount,
        percentage,
        isPercentage,
        isMandatory,
        isRecurring,
        frequency,
        effectiveFrom,
        effectiveTo,
        remainingInstallments,
        notes
      } = req.body;
      
      // Validate amount or percentage provided
      if (!isPercentage && !amount) {
        return res.status(400).json({ error: 'Amount is required for fixed deductions' });
      }
      
      if (isPercentage && !percentage) {
        return res.status(400).json({ error: 'Percentage is required for percentage-based deductions' });
      }
      
      const result = await pool.query(
        `INSERT INTO employee_deductions (
          user_id, deduction_type, amount, percentage, is_percentage,
          is_mandatory, is_recurring, frequency, effective_from, effective_to,
          remaining_installments, is_active, notes, company_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12, $13)
        RETURNING 
          id,
          deduction_type as "deductionType",
          amount,
          percentage,
          is_percentage as "isPercentage",
          effective_from as "effectiveFrom"`,
        [
          userId,
          deductionType,
          amount || null,
          percentage || null,
          isPercentage,
          isMandatory,
          isRecurring,
          frequency || 'monthly',
          effectiveFrom,
          effectiveTo || null,
          remainingInstallments || null,
          notes || null,
          companyId
        ]
      );
      
      console.log('✅ Deduction added:', result.rows[0]);
      
      res.status(201).json({
        message: 'Deduction added successfully',
        deduction: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Add deduction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update deduction
router.put(
  '/deductions/:id',
  checkPermission('manage_payroll'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.companyId;
      const {
        amount,
        percentage,
        effectiveTo,
        remainingInstallments,
        isActive,
        notes
      } = req.body;
      
      const updates = [];
      const values = [];
      let paramIndex = 1;
      
      if (amount !== undefined) {
        updates.push(`amount = $${paramIndex}`);
        values.push(amount);
        paramIndex++;
      }
      
      if (percentage !== undefined) {
        updates.push(`percentage = $${paramIndex}`);
        values.push(percentage);
        paramIndex++;
      }
      
      if (effectiveTo !== undefined) {
        updates.push(`effective_to = $${paramIndex}`);
        values.push(effectiveTo);
        paramIndex++;
      }
      
      if (remainingInstallments !== undefined) {
        updates.push(`remaining_installments = $${paramIndex}`);
        values.push(remainingInstallments);
        paramIndex++;
      }
      
      if (isActive !== undefined) {
        updates.push(`is_active = $${paramIndex}`);
        values.push(isActive);
        paramIndex++;
      }
      
      if (notes !== undefined) {
        updates.push(`notes = $${paramIndex}`);
        values.push(notes);
        paramIndex++;
      }
      
      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }
      
      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      values.push(companyId);
      
      const result = await pool.query(
        `UPDATE employee_deductions
         SET ${updates.join(', ')}
         WHERE id = $${paramIndex} AND company_id = $${paramIndex + 1}
         RETURNING id`,
        values
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Deduction not found' });
      }
      
      res.json({ message: 'Deduction updated successfully' });
    } catch (error) {
      console.error('❌ Update deduction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Deactivate deduction
router.delete(
  '/deductions/:id',
  checkPermission('manage_payroll'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.companyId;
      
      const result = await pool.query(
        `UPDATE employee_deductions
         SET is_active = false, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND company_id = $2
         RETURNING id, deduction_type`,
        [id, companyId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Deduction not found' });
      }
      
      console.log('✅ Deduction deactivated:', result.rows[0]);
      
      res.json({ message: 'Deduction deactivated successfully' });
    } catch (error) {
      console.error('❌ Deactivate deduction error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// ==================== COMPLETE COMPENSATION PACKAGE ====================

// Get complete compensation package for an employee
router.get('/package/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const companyId = req.companyId;
    
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
    
    // Get current salary
    const salary = await pool.query(
      `SELECT 
        base_salary as "baseSalary",
        salary_type as "salaryType",
        payment_frequency as "paymentFrequency"
      FROM employee_compensation
      WHERE user_id = $1 AND is_current = true AND company_id = $2`,
      [userId, companyId]
    );
    
    // Get active allowances
    const allowances = await pool.query(
      `SELECT 
        allowance_type as "allowanceType",
        amount,
        is_taxable as "isTaxable",
        frequency
      FROM employee_allowances
      WHERE user_id = $1 AND is_active = true AND company_id = $2`,
      [userId, companyId]
    );
    
    // Get active deductions
    const deductions = await pool.query(
      `SELECT 
        deduction_type as "deductionType",
        amount,
        percentage,
        is_percentage as "isPercentage",
        is_mandatory as "isMandatory",
        frequency
      FROM employee_deductions
      WHERE user_id = $1 AND is_active = true AND company_id = $2`,
      [userId, companyId]
    );
    
    // Calculate totals
    const baseSalary = salary.rows[0] ? parseFloat(salary.rows[0].baseSalary) : 0;
    const totalAllowances = allowances.rows.reduce((sum, a) => sum + parseFloat(a.amount), 0);
    const totalTaxableAllowances = allowances.rows
      .filter(a => a.isTaxable)
      .reduce((sum, a) => sum + parseFloat(a.amount), 0);
    
    const fixedDeductions = deductions.rows
      .filter(d => !d.isPercentage)
      .reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
    
    const percentageDeductions = deductions.rows
      .filter(d => d.isPercentage)
      .reduce((sum, d) => sum + (baseSalary * parseFloat(d.percentage || 0) / 100), 0);
    
    const totalDeductions = fixedDeductions + percentageDeductions;
    
    const grossPay = baseSalary + totalAllowances;
    const netPay = grossPay - totalDeductions;
    
    res.json({
      package: {
        baseSalary,
        allowances: allowances.rows,
        deductions: deductions.rows,
        summary: {
          baseSalary,
          totalAllowances,
          totalTaxableAllowances,
          totalDeductions,
          fixedDeductions,
          percentageDeductions,
          grossPay,
          netPay
        }
      }
    });
  } catch (error) {
    console.error('❌ Get compensation package error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== SALARY STATISTICS ====================

// Get salary statistics for department
router.get('/stats/department/:departmentId', checkPermission('view_analytics'), async (req, res) => {
  try {
    const { departmentId } = req.params;
    const companyId = req.companyId;
    
    const result = await pool.query(
      `SELECT 
        COUNT(DISTINCT ec.user_id) as "employeeCount",
        MIN(ec.base_salary) as "minSalary",
        MAX(ec.base_salary) as "maxSalary",
        AVG(ec.base_salary) as "avgSalary",
        SUM(ec.base_salary) as "totalSalary"
      FROM employee_compensation ec
      JOIN employee_profiles ep ON ec.user_id = ep.user_id
      WHERE ep.department_id = $1 
        AND ec.is_current = true
        AND ep.employment_status = 'active'
        AND ec.company_id = $2
        AND ep.company_id = $2`,
      [departmentId, companyId]
    );
    
    res.json({ statistics: result.rows[0] });
  } catch (error) {
    console.error('❌ Get department salary stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get company-wide salary statistics
router.get('/stats/company', checkPermission('view_analytics'), async (req, res) => {
  try {
    const companyId = req.companyId;
    
    const result = await pool.query(
      `SELECT 
        COUNT(DISTINCT ec.user_id) as "employeeCount",
        SUM(ec.base_salary) as "totalPayroll",
        AVG(ec.base_salary) as "avgSalary",
        MIN(ec.base_salary) as "minSalary",
        MAX(ec.base_salary) as "maxSalary"
      FROM employee_compensation ec
      JOIN employee_profiles ep ON ec.user_id = ep.user_id
      WHERE ec.is_current = true
        AND ep.employment_status = 'active'
        AND ec.company_id = $1
        AND ep.company_id = $1`,
      [companyId]
    );
    
    res.json({ statistics: result.rows[0] });
  } catch (error) {
    console.error('❌ Get company salary stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;