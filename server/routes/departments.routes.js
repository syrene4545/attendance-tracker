// server/routes/departments.routes.js
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

// ==================== DEPARTMENT ROUTES ====================

// Get department hierarchy (tree structure) - MUST BE BEFORE /:id
router.get('/hierarchy/tree', async (req, res) => {
  try {
    const companyId = req.companyId;
    
    // Get all active departments for this company
    const result = await pool.query(
      `SELECT 
        d.id,
        d.name,
        d.code,
        d.parent_department_id as "parentDepartmentId",
        d.manager_id as "managerId",
        u.name as "managerName",
        COUNT(DISTINCT ep.user_id) as "employeeCount"
      FROM departments d
      LEFT JOIN users u ON d.manager_id = u.id AND u.company_id = $1
      LEFT JOIN employee_profiles ep ON ep.department_id = d.id 
        AND ep.employment_status = 'active'
        AND ep.company_id = $1
      WHERE d.is_active = true AND d.company_id = $1
      GROUP BY d.id, u.name
      ORDER BY d.name ASC`,
      [companyId]
    );
    
    const departments = result.rows;
    
    // Build tree structure
    const buildTree = (parentId = null) => {
      return departments
        .filter(dept => dept.parentDepartmentId === parentId)
        .map(dept => ({
          ...dept,
          children: buildTree(dept.id)
        }));
    };
    
    const tree = buildTree();
    
    res.json({ hierarchy: tree });
  } catch (error) {
    console.error('❌ Get department hierarchy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all departments
router.get('/', async (req, res) => {
  try {
    const companyId = req.companyId;
    const { include_inactive } = req.query;
    
    let query = `
      SELECT 
        d.id,
        d.name,
        d.code,
        d.description,
        d.parent_department_id as "parentDepartmentId",
        parent.name as "parentDepartmentName",
        d.manager_id as "managerId",
        u.name as "managerName",
        d.cost_center as "costCenter",
        d.is_active as "isActive",
        d.created_at as "createdAt",
        d.updated_at as "updatedAt",
        COUNT(DISTINCT ep.user_id) as "employeeCount"
      FROM departments d
      LEFT JOIN departments parent ON d.parent_department_id = parent.id AND parent.company_id = $1
      LEFT JOIN users u ON d.manager_id = u.id AND u.company_id = $1
      LEFT JOIN employee_profiles ep ON ep.department_id = d.id 
        AND ep.employment_status = 'active'
        AND ep.company_id = $1
      WHERE d.company_id = $1
    `;
    
    // Filter inactive departments unless requested
    if (include_inactive !== 'true') {
      query += ` AND d.is_active = true`;
    }
    
    query += `
      GROUP BY d.id, parent.name, u.name
      ORDER BY d.name ASC
    `;
    
    const result = await pool.query(query, [companyId]);
    
    res.json({ 
      departments: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Get departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single department by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;
    
    const result = await pool.query(
      `SELECT 
        d.id,
        d.name,
        d.code,
        d.description,
        d.parent_department_id as "parentDepartmentId",
        parent.name as "parentDepartmentName",
        d.manager_id as "managerId",
        u.name as "managerName",
        u.email as "managerEmail",
        d.cost_center as "costCenter",
        d.is_active as "isActive",
        d.created_at as "createdAt",
        d.updated_at as "updatedAt"
      FROM departments d
      LEFT JOIN departments parent ON d.parent_department_id = parent.id AND parent.company_id = $2
      LEFT JOIN users u ON d.manager_id = u.id AND u.company_id = $2
      WHERE d.id = $1 AND d.company_id = $2`,
      [id, companyId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    // Get child departments (same company)
    const childrenResult = await pool.query(
      `SELECT id, name, code 
       FROM departments 
       WHERE parent_department_id = $1 
         AND company_id = $2
         AND is_active = true
       ORDER BY name ASC`,
      [id, companyId]
    );
    
    // Get employees in this department (same company)
    const employeesResult = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        ep.employee_number as "employeeNumber",
        ep.employment_status as "employmentStatus",
        jp.title as "jobTitle"
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      LEFT JOIN job_positions jp ON ep.job_position_id = jp.id
      WHERE ep.department_id = $1 
        AND ep.company_id = $2
        AND u.company_id = $2
      ORDER BY u.name ASC`,
      [id, companyId]
    );
    
    const department = result.rows[0];
    department.childDepartments = childrenResult.rows;
    department.employees = employeesResult.rows;
    
    res.json({ department });
  } catch (error) {
    console.error('❌ Get department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get department statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId;
    
    // Verify department exists in same company
    const deptCheck = await pool.query(
      'SELECT id FROM departments WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );
    
    if (deptCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    // Employee count by status (same company)
    const statusStats = await pool.query(
      `SELECT 
        employment_status,
        COUNT(*) as count
      FROM employee_profiles
      WHERE department_id = $1 AND company_id = $2
      GROUP BY employment_status`,
      [id, companyId]
    );
    
    // Employee count by position (same company)
    const positionStats = await pool.query(
      `SELECT 
        jp.title,
        COUNT(*) as count
      FROM employee_profiles ep
      JOIN job_positions jp ON ep.job_position_id = jp.id
      WHERE ep.department_id = $1 
        AND ep.employment_status = 'active'
        AND ep.company_id = $2
        AND jp.company_id = $2
      GROUP BY jp.title
      ORDER BY count DESC`,
      [id, companyId]
    );
    
    // Total compensation (same company)
    const compensationStats = await pool.query(
      `SELECT 
        SUM(ec.base_salary) as "totalSalary",
        AVG(ec.base_salary) as "averageSalary",
        COUNT(DISTINCT ec.user_id) as "employeeCount"
      FROM employee_compensation ec
      JOIN employee_profiles ep ON ec.user_id = ep.user_id
      WHERE ep.department_id = $1 
        AND ec.is_current = true
        AND ep.employment_status = 'active'
        AND ec.company_id = $2
        AND ep.company_id = $2`,
      [id, companyId]
    );
    
    res.json({
      statusBreakdown: statusStats.rows,
      positionBreakdown: positionStats.rows,
      compensation: compensationStats.rows[0]
    });
  } catch (error) {
    console.error('❌ Get department stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new department
router.post(
  '/',
  checkPermission('manage_users'),
  body('name').trim().notEmpty().withMessage('Department name is required'),
  body('code').optional().trim(),
  body('description').optional().trim(),
  body('parentDepartmentId').optional().isInt(),
  body('managerId').optional().isInt(),
  body('costCenter').optional().trim(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }
      
      const companyId = req.companyId;
      const { name, code, description, parentDepartmentId, managerId, costCenter } = req.body;
      
      // Check if department name already exists in this company
      const existingDept = await pool.query(
        'SELECT id FROM departments WHERE name = $1 AND company_id = $2',
        [name, companyId]
      );
      
      if (existingDept.rows.length > 0) {
        return res.status(400).json({ error: 'Department name already exists' });
      }
      
      // Check if code already exists in this company (if provided)
      if (code) {
        const existingCode = await pool.query(
          'SELECT id FROM departments WHERE code = $1 AND company_id = $2',
          [code, companyId]
        );
        
        if (existingCode.rows.length > 0) {
          return res.status(400).json({ error: 'Department code already exists' });
        }
      }
      
      // Validate parent department exists in same company (if provided)
      if (parentDepartmentId) {
        const parentExists = await pool.query(
          'SELECT id FROM departments WHERE id = $1 AND company_id = $2',
          [parentDepartmentId, companyId]
        );
        
        if (parentExists.rows.length === 0) {
          return res.status(400).json({ error: 'Parent department not found' });
        }
      }
      
      // Validate manager exists in same company (if provided)
      if (managerId) {
        const managerExists = await pool.query(
          'SELECT id FROM users WHERE id = $1 AND company_id = $2',
          [managerId, companyId]
        );
        
        if (managerExists.rows.length === 0) {
          return res.status(400).json({ error: 'Manager not found' });
        }
      }
      
      // Insert new department with company_id
      const result = await pool.query(
        `INSERT INTO departments 
         (name, code, description, parent_department_id, manager_id, cost_center, is_active, company_id)
         VALUES ($1, $2, $3, $4, $5, $6, true, $7)
         RETURNING 
           id,
           name,
           code,
           description,
           parent_department_id as "parentDepartmentId",
           manager_id as "managerId",
           cost_center as "costCenter",
           is_active as "isActive",
           created_at as "createdAt"`,
        [name, code || null, description || null, parentDepartmentId || null, managerId || null, costCenter || null, companyId]
      );
      
      console.log('✅ Department created:', result.rows[0]);
      
      res.status(201).json({ 
        message: 'Department created successfully',
        department: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Create department error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update department
router.put(
  '/:id',
  checkPermission('manage_users'),
  body('name').optional().trim().notEmpty(),
  body('code').optional().trim(),
  body('description').optional().trim(),
  body('parentDepartmentId').optional().isInt(),
  body('managerId').optional().isInt(),
  body('costCenter').optional().trim(),
  body('isActive').optional().isBoolean(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid input', details: errors.array() });
      }
      
      const { id } = req.params;
      const companyId = req.companyId;
      const { name, code, description, parentDepartmentId, managerId, costCenter, isActive } = req.body;
      
      // Check if department exists in same company
      const deptExists = await pool.query(
        'SELECT id FROM departments WHERE id = $1 AND company_id = $2',
        [id, companyId]
      );
      
      if (deptExists.rows.length === 0) {
        return res.status(404).json({ error: 'Department not found' });
      }
      
      // Check for duplicate name in same company (excluding current department)
      if (name) {
        const duplicateName = await pool.query(
          'SELECT id FROM departments WHERE name = $1 AND id != $2 AND company_id = $3',
          [name, id, companyId]
        );
        
        if (duplicateName.rows.length > 0) {
          return res.status(400).json({ error: 'Department name already exists' });
        }
      }
      
      // Check for duplicate code in same company (excluding current department)
      if (code) {
        const duplicateCode = await pool.query(
          'SELECT id FROM departments WHERE code = $1 AND id != $2 AND company_id = $3',
          [code, id, companyId]
        );
        
        if (duplicateCode.rows.length > 0) {
          return res.status(400).json({ error: 'Department code already exists' });
        }
      }
      
      // Prevent circular parent relationship (within same company)
      if (parentDepartmentId) {
        // Verify parent is in same company
        const parentCompanyCheck = await pool.query(
          'SELECT id FROM departments WHERE id = $1 AND company_id = $2',
          [parentDepartmentId, companyId]
        );
        
        if (parentCompanyCheck.rows.length === 0) {
          return res.status(400).json({ error: 'Parent department not found' });
        }
        
        // Check if new parent is a child of current department
        const checkCircular = async (deptId, targetParentId) => {
          if (deptId === targetParentId) return true;
          
          const parentResult = await pool.query(
            'SELECT parent_department_id FROM departments WHERE id = $1 AND company_id = $2',
            [targetParentId, companyId]
          );
          
          if (parentResult.rows.length === 0 || !parentResult.rows[0].parent_department_id) {
            return false;
          }
          
          return checkCircular(deptId, parentResult.rows[0].parent_department_id);
        };
        
        const isCircular = await checkCircular(parseInt(id), parentDepartmentId);
        if (isCircular) {
          return res.status(400).json({ error: 'Cannot set parent: circular relationship detected' });
        }
      }
      
      // Validate manager is in same company (if provided)
      if (managerId) {
        const managerCompanyCheck = await pool.query(
          'SELECT id FROM users WHERE id = $1 AND company_id = $2',
          [managerId, companyId]
        );
        
        if (managerCompanyCheck.rows.length === 0) {
          return res.status(400).json({ error: 'Manager not found' });
        }
      }
      
      // Build update query dynamically
      const updates = [];
      const values = [];
      let paramCount = 1;
      
      if (name !== undefined) {
        updates.push(`name = $${paramCount}`);
        values.push(name);
        paramCount++;
      }
      
      if (code !== undefined) {
        updates.push(`code = $${paramCount}`);
        values.push(code || null);
        paramCount++;
      }
      
      if (description !== undefined) {
        updates.push(`description = $${paramCount}`);
        values.push(description || null);
        paramCount++;
      }
      
      if (parentDepartmentId !== undefined) {
        updates.push(`parent_department_id = $${paramCount}`);
        values.push(parentDepartmentId || null);
        paramCount++;
      }
      
      if (managerId !== undefined) {
        updates.push(`manager_id = $${paramCount}`);
        values.push(managerId || null);
        paramCount++;
      }
      
      if (costCenter !== undefined) {
        updates.push(`cost_center = $${paramCount}`);
        values.push(costCenter || null);
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
        UPDATE departments
        SET ${updates.join(', ')}
        WHERE id = $${paramCount} AND company_id = $${paramCount + 1}
        RETURNING 
          id,
          name,
          code,
          description,
          parent_department_id as "parentDepartmentId",
          manager_id as "managerId",
          cost_center as "costCenter",
          is_active as "isActive",
          updated_at as "updatedAt"
      `;
      
      const result = await pool.query(query, values);
      
      console.log('✅ Department updated:', result.rows[0]);
      
      res.json({ 
        message: 'Department updated successfully',
        department: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Update department error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Reactivate department
router.post(
  '/:id/reactivate',
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.companyId;
      
      const result = await pool.query(
        `UPDATE departments 
         SET is_active = true, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 AND company_id = $2
         RETURNING id, name`,
        [id, companyId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Department not found' });
      }
      
      console.log('✅ Department reactivated:', result.rows[0]);
      
      res.json({ 
        message: 'Department reactivated successfully',
        department: result.rows[0]
      });
    } catch (error) {
      console.error('❌ Reactivate department error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete (deactivate) department
router.delete(
  '/:id',
  checkPermission('manage_users'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const companyId = req.companyId;
      const { force } = req.query; // force=true for hard delete
      
      // Check if department exists in same company
      const deptExists = await pool.query(
        'SELECT id, name FROM departments WHERE id = $1 AND company_id = $2',
        [id, companyId]
      );
      
      if (deptExists.rows.length === 0) {
        return res.status(404).json({ error: 'Department not found' });
      }
      
      // Check if department has employees in same company
      const employeeCount = await pool.query(
        `SELECT COUNT(*) as count 
         FROM employee_profiles 
         WHERE department_id = $1 
           AND employment_status = 'active'
           AND company_id = $2`,
        [id, companyId]
      );
      
      if (parseInt(employeeCount.rows[0].count) > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete department with active employees',
          employeeCount: employeeCount.rows[0].count
        });
      }
      
      // Check if department has child departments in same company
      const childCount = await pool.query(
        'SELECT COUNT(*) as count FROM departments WHERE parent_department_id = $1 AND company_id = $2',
        [id, companyId]
      );
      
      if (parseInt(childCount.rows[0].count) > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete department with sub-departments',
          childCount: childCount.rows[0].count
        });
      }
      
      if (force === 'true') {
        // Hard delete (same company)
        await pool.query('DELETE FROM departments WHERE id = $1 AND company_id = $2', [id, companyId]);
        console.log('✅ Department deleted (hard):', id);
        res.json({ message: 'Department deleted permanently' });
      } else {
        // Soft delete (deactivate, same company)
        await pool.query(
          'UPDATE departments SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND company_id = $2',
          [id, companyId]
        );
        console.log('✅ Department deactivated:', id);
        res.json({ message: 'Department deactivated successfully' });
      }
    } catch (error) {
      console.error('❌ Delete department error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;