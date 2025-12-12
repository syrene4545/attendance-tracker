// server/routes/departments.routes.js
import express from 'express';
import { pool } from '../index.js';
import { authenticateToken, checkPermission } from '../middleware/permissionMiddleware.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// ==================== DEPARTMENT ROUTES ====================

// Get all departments
router.get('/', authenticateToken, async (req, res) => {
  try {
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
      LEFT JOIN departments parent ON d.parent_department_id = parent.id
      LEFT JOIN users u ON d.manager_id = u.id
      LEFT JOIN employee_profiles ep ON ep.department_id = d.id 
        AND ep.employment_status = 'active'
      WHERE 1=1
    `;
    
    // Filter inactive departments unless requested
    if (include_inactive !== 'true') {
      query += ` AND d.is_active = true`;
    }
    
    query += `
      GROUP BY d.id, parent.name, u.name
      ORDER BY d.name ASC
    `;
    
    const result = await pool.query(query);
    
    res.json({ 
      departments: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single department by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
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
      LEFT JOIN departments parent ON d.parent_department_id = parent.id
      LEFT JOIN users u ON d.manager_id = u.id
      WHERE d.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    // Get child departments
    const childrenResult = await pool.query(
      `SELECT id, name, code 
       FROM departments 
       WHERE parent_department_id = $1 
         AND is_active = true
       ORDER BY name ASC`,
      [id]
    );
    
    // Get employees in this department
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
      ORDER BY u.name ASC`,
      [id]
    );
    
    const department = result.rows[0];
    department.childDepartments = childrenResult.rows;
    department.employees = employeesResult.rows;
    
    res.json({ department });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get department hierarchy (tree structure)
router.get('/hierarchy/tree', authenticateToken, async (req, res) => {
  try {
    // Get all active departments
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
      LEFT JOIN users u ON d.manager_id = u.id
      LEFT JOIN employee_profiles ep ON ep.department_id = d.id 
        AND ep.employment_status = 'active'
      WHERE d.is_active = true
      GROUP BY d.id, u.name
      ORDER BY d.name ASC`
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
    console.error('Get department hierarchy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new department
router.post(
  '/',
  authenticateToken,
  checkPermission('manage_employees'),
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
      
      const { name, code, description, parentDepartmentId, managerId, costCenter } = req.body;
      
      // Check if department name already exists
      const existingDept = await pool.query(
        'SELECT id FROM departments WHERE name = $1',
        [name]
      );
      
      if (existingDept.rows.length > 0) {
        return res.status(400).json({ error: 'Department name already exists' });
      }
      
      // Check if code already exists (if provided)
      if (code) {
        const existingCode = await pool.query(
          'SELECT id FROM departments WHERE code = $1',
          [code]
        );
        
        if (existingCode.rows.length > 0) {
          return res.status(400).json({ error: 'Department code already exists' });
        }
      }
      
      // Validate parent department exists (if provided)
      if (parentDepartmentId) {
        const parentExists = await pool.query(
          'SELECT id FROM departments WHERE id = $1',
          [parentDepartmentId]
        );
        
        if (parentExists.rows.length === 0) {
          return res.status(400).json({ error: 'Parent department not found' });
        }
      }
      
      // Validate manager exists (if provided)
      if (managerId) {
        const managerExists = await pool.query(
          'SELECT id FROM users WHERE id = $1',
          [managerId]
        );
        
        if (managerExists.rows.length === 0) {
          return res.status(400).json({ error: 'Manager not found' });
        }
      }
      
      // Insert new department
      const result = await pool.query(
        `INSERT INTO departments 
         (name, code, description, parent_department_id, manager_id, cost_center, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)
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
        [name, code || null, description || null, parentDepartmentId || null, managerId || null, costCenter || null]
      );
      
      console.log('✅ Department created:', result.rows[0]);
      
      res.status(201).json({ 
        message: 'Department created successfully',
        department: result.rows[0]
      });
    } catch (error) {
      console.error('Create department error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update department
router.put(
  '/:id',
  authenticateToken,
  checkPermission('manage_employees'),
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
      const { name, code, description, parentDepartmentId, managerId, costCenter, isActive } = req.body;
      
      // Check if department exists
      const deptExists = await pool.query(
        'SELECT id FROM departments WHERE id = $1',
        [id]
      );
      
      if (deptExists.rows.length === 0) {
        return res.status(404).json({ error: 'Department not found' });
      }
      
      // Check for duplicate name (excluding current department)
      if (name) {
        const duplicateName = await pool.query(
          'SELECT id FROM departments WHERE name = $1 AND id != $2',
          [name, id]
        );
        
        if (duplicateName.rows.length > 0) {
          return res.status(400).json({ error: 'Department name already exists' });
        }
      }
      
      // Check for duplicate code (excluding current department)
      if (code) {
        const duplicateCode = await pool.query(
          'SELECT id FROM departments WHERE code = $1 AND id != $2',
          [code, id]
        );
        
        if (duplicateCode.rows.length > 0) {
          return res.status(400).json({ error: 'Department code already exists' });
        }
      }
      
      // Prevent circular parent relationship
      if (parentDepartmentId) {
        // Check if new parent is a child of current department
        const checkCircular = async (deptId, targetParentId) => {
          if (deptId === targetParentId) return true;
          
          const parentResult = await pool.query(
            'SELECT parent_department_id FROM departments WHERE id = $1',
            [targetParentId]
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
      
      // Add ID for WHERE clause
      values.push(id);
      
      const query = `
        UPDATE departments
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
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
      console.error('Update department error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete (deactivate) department
router.delete(
  '/:id',
  authenticateToken,
  checkPermission('manage_employees'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { force } = req.query; // force=true for hard delete
      
      // Check if department exists
      const deptExists = await pool.query(
        'SELECT id, name FROM departments WHERE id = $1',
        [id]
      );
      
      if (deptExists.rows.length === 0) {
        return res.status(404).json({ error: 'Department not found' });
      }
      
      // Check if department has employees
      const employeeCount = await pool.query(
        `SELECT COUNT(*) as count 
         FROM employee_profiles 
         WHERE department_id = $1 
           AND employment_status = 'active'`,
        [id]
      );
      
      if (parseInt(employeeCount.rows[0].count) > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete department with active employees',
          employeeCount: employeeCount.rows[0].count
        });
      }
      
      // Check if department has child departments
      const childCount = await pool.query(
        'SELECT COUNT(*) as count FROM departments WHERE parent_department_id = $1',
        [id]
      );
      
      if (parseInt(childCount.rows[0].count) > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete department with sub-departments',
          childCount: childCount.rows[0].count
        });
      }
      
      if (force === 'true') {
        // Hard delete
        await pool.query('DELETE FROM departments WHERE id = $1', [id]);
        console.log('✅ Department deleted (hard):', id);
        res.json({ message: 'Department deleted permanently' });
      } else {
        // Soft delete (deactivate)
        await pool.query(
          'UPDATE departments SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
          [id]
        );
        console.log('✅ Department deactivated:', id);
        res.json({ message: 'Department deactivated successfully' });
      }
    } catch (error) {
      console.error('Delete department error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get department statistics
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Employee count by status
    const statusStats = await pool.query(
      `SELECT 
        employment_status,
        COUNT(*) as count
      FROM employee_profiles
      WHERE department_id = $1
      GROUP BY employment_status`,
      [id]
    );
    
    // Employee count by position
    const positionStats = await pool.query(
      `SELECT 
        jp.title,
        COUNT(*) as count
      FROM employee_profiles ep
      JOIN job_positions jp ON ep.job_position_id = jp.id
      WHERE ep.department_id = $1 
        AND ep.employment_status = 'active'
      GROUP BY jp.title
      ORDER BY count DESC`,
      [id]
    );
    
    // Total compensation
    const compensationStats = await pool.query(
      `SELECT 
        SUM(ec.base_salary) as "totalSalary",
        AVG(ec.base_salary) as "averageSalary",
        COUNT(DISTINCT ec.user_id) as "employeeCount"
      FROM employee_compensation ec
      JOIN employee_profiles ep ON ec.user_id = ep.user_id
      WHERE ep.department_id = $1 
        AND ec.is_current = true
        AND ep.employment_status = 'active'`,
      [id]
    );
    
    res.json({
      statusBreakdown: statusStats.rows,
      positionBreakdown: positionStats.rows,
      compensation: compensationStats.rows[0]
    });
  } catch (error) {
    console.error('Get department stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reactivate department
router.post(
  '/:id/reactivate',
  authenticateToken,
  checkPermission('manage_employees'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await pool.query(
        `UPDATE departments 
         SET is_active = true, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 
         RETURNING id, name`,
        [id]
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
      console.error('Reactivate department error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;