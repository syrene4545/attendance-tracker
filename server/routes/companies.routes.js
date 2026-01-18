import express from 'express';
import { pool } from '../index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/authMiddleware.js';
import { extractTenant, verifyTenantAccess } from '../middleware/tenantMiddleware.js';
import { onboardNewCompany } from '../services/onboarding.service.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Register new company (public endpoint)
router.post('/register', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      companyName,
      subdomain,
      email,
      password,
      firstName,
      lastName,
      phone
    } = req.body;

    // Validate required fields
    if (!companyName || !subdomain || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate subdomain format (alphanumeric and hyphens only)
    const subdomainRegex = /^[a-z0-9-]+$/;
    if (!subdomainRegex.test(subdomain)) {
      return res.status(400).json({ 
        error: 'Subdomain must contain only lowercase letters, numbers, and hyphens' 
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    await client.query('BEGIN');

    // 1. Check if subdomain is available
    const existingCompany = await client.query(
      'SELECT id FROM companies WHERE subdomain = $1',
      [subdomain.toLowerCase()]
    );

    if (existingCompany.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Subdomain already taken' });
    }

    // 2. Check if email is already used (globally across all companies)
    const existingEmail = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingEmail.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Email already registered' });
    }

    // ✅ 3. Create company with CORRECT column names
    const companyResult = await client.query(
      `INSERT INTO companies (
        name,
        subdomain,
        email,
        phone,
        subscription_plan,
        subscription_status,
        subscription_starts_at,
        subscription_ends_at,
        trial_ends_at,
        is_active,
        address,
        branding,
        settings,
        features
      ) VALUES (
        $1, $2, $3, $4,
        'trial',
        'active',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '14 days',
        CURRENT_DATE + INTERVAL '14 days',
        true,
        $5::jsonb,
        $6::jsonb,
        $7::jsonb,
        $8::jsonb
      )
      RETURNING id, name, subdomain`,
      [
        companyName, 
        subdomain.toLowerCase(), 
        email, 
        phone || null,
        JSON.stringify({}), // address
        JSON.stringify({ primaryColor: '#4f46e5', secondaryColor: '#7c3aed' }), // branding
        JSON.stringify({}), // settings
        JSON.stringify({}) // features
      ]
    );

    const company = companyResult.rows[0];
    const companyId = company.id;

    console.log('✅ Company created:', company.subdomain);

    // 4. Create admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (
        company_id, name, email, password, role
      ) VALUES ($1, $2, $3, $4, 'admin')
      RETURNING id, name, email, role`,
      [companyId, `${firstName} ${lastName}`, email, hashedPassword]
    );

    const user = userResult.rows[0];

    console.log('✅ Admin user created:', user.email);

    // 5. Create default company settings
    await client.query(
      'INSERT INTO company_settings (company_id) VALUES ($1)',
      [companyId]
    );

    // 6. Create default departments
    await client.query(
      `INSERT INTO departments (company_id, name, description) VALUES 
        ($1, 'Administration', 'Administrative and management staff'),
        ($1, 'Operations', 'Operations and support team'),
        ($1, 'Sales', 'Sales and customer relations')`,
      [companyId]
    );

    // 7. Create default job positions
    await client.query(
      `INSERT INTO job_positions (company_id, title, description) VALUES 
        ($1, 'Administrator', 'System administrator'),
        ($1, 'Manager', 'Department manager'),
        ($1, 'Employee', 'General employee')`,
      [companyId]
    );

    console.log('✅ Default data created');

    await client.query('COMMIT');

    // ✅ TRIGGER ONBOARDING AUTOMATION
    if (newCompany && newCompany.id) {
      // Run onboarding asynchronously (don't block response)
      onboardNewCompany({
        companyId: newCompany.id,
        adminId: adminUser.id,
        seedSOPs: true
      }).catch(error => {
        console.error('❌ Async onboarding failed:', error);
        // Log but don't fail the request
      });
      
      // OR run synchronously (wait for completion):
      // const onboardingResult = await onboardNewCompany({
      //   companyId: newCompany.id,
      //   adminId: adminUser.id,
      //   seedSOPs: true
      // });
    }

    // 8. Generate JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role,
        company_id: companyId 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('🎉 Company registration complete:', company.subdomain);

    res.status(201).json({
      message: 'Company registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId
      },
      company: {
        id: companyId,
        name: companyName,
        subdomain: company.subdomain,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Company registration error:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    client.release();
  }
});

// Check subdomain availability (public)
router.get('/check-subdomain/:subdomain', async (req, res) => {
  try {
    const { subdomain } = req.params;

    const result = await pool.query(
      'SELECT id FROM companies WHERE subdomain = $1',
      [subdomain.toLowerCase()]
    );

    res.json({ 
      available: result.rows.length === 0,
      subdomain: subdomain.toLowerCase()
    });
  } catch (error) {
    console.error('Check subdomain error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== PROTECTED ROUTES ====================

// Apply authentication and tenant extraction to all protected routes
router.use(protect);           // 1️⃣ Authenticate user
router.use(extractTenant);     // 2️⃣ Extract tenant context
router.use(verifyTenantAccess); // 3️⃣ Verify tenant access

// ✅ FIXED: Get current company details (reads JSON columns properly + correct column names)
router.get('/me', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        c.*,
        (SELECT COUNT(*) FROM users WHERE company_id = c.id) as employee_count,
        (SELECT COUNT(*) FROM departments WHERE company_id = c.id) as department_count
       FROM companies c
       WHERE c.id = $1`,
      [req.companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = result.rows[0];

    // ✅ Parse JSON columns properly
    const address = typeof company.address === 'string' 
      ? JSON.parse(company.address) 
      : company.address || {};
    
    const branding = typeof company.branding === 'string'
      ? JSON.parse(company.branding)
      : company.branding || {};
    
    const settings = typeof company.settings === 'string'
      ? JSON.parse(company.settings)
      : company.settings || {};
    
    const features = typeof company.features === 'string'
      ? JSON.parse(company.features)
      : company.features || {};

    res.json({
      id: company.id,
      name: company.name,
      subdomain: company.subdomain,
      domain: company.domain,
      email: company.email,
      phone: company.phone,
      address: address,
      branding: branding,
      settings: settings,
      features: features,
      subscription: {
        plan: company.subscription_plan,
        status: company.subscription_status, // ✅ Use correct column
        maxEmployees: company.max_employees,
        startDate: company.subscription_starts_at, // ✅ Use correct column
        endDate: company.subscription_ends_at,     // ✅ Use correct column
        trialEndsAt: company.trial_ends_at,        // ✅ Use correct column
        isActive: company.is_active
      },
      stats: {
        employeeCount: parseInt(company.employee_count),
        departmentCount: parseInt(company.department_count)
      },
      createdAt: company.created_at
    });
  } catch (error) {
    console.error('❌ Get company error:', error);
    console.error('❌ Error details:', error.message);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ✅ Update company details (Admin only)
router.put('/me', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update company details' });
    }

    const {
      companyName,
      email,
      phone,
      address,
      branding
    } = req.body;

    const updates = [];
    const params = [req.companyId];
    let idx = 2;

    if (companyName) {
      updates.push(`name = $${idx}`);
      params.push(companyName);
      idx++;
    }

    if (email) {
      updates.push(`email = $${idx}`);
      params.push(email);
      idx++;
    }

    if (phone !== undefined) {
      updates.push(`phone = $${idx}`);
      params.push(phone);
      idx++;
    }

    // ✅ Update address as JSON
    if (address) {
      updates.push(`address = $${idx}::jsonb`);
      params.push(JSON.stringify(address));
      idx++;
    }

    // ✅ Update branding as JSON
    if (branding) {
      updates.push(`branding = $${idx}::jsonb`);
      params.push(JSON.stringify(branding));
      idx++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);

    const query = `
      UPDATE companies 
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, params);

    console.log('✅ Company updated:', result.rows[0].subdomain);

    res.json({
      message: 'Company updated successfully',
      company: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Update company error:', error);
    console.error('❌ Error details:', error.message);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get company settings
router.get('/settings', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM company_settings WHERE company_id = $1',
      [req.companyId]
    );

    if (result.rows.length === 0) {
      // Create default settings if they don't exist
      const createResult = await pool.query(
        'INSERT INTO company_settings (company_id) VALUES ($1) RETURNING *',
        [req.companyId]
      );
      return res.json(createResult.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Get settings error:', error);
    console.error('❌ Error details:', error.message);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update company settings (Admin only)
router.put('/settings', async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update settings' });
    }

    const {
      workStartTime,
      workEndTime,
      timezone,
      annualLeaveDays,
      sickLeaveDays,
      lateThresholdMinutes,
      earlyLeaveThresholdMinutes,
      requireClockOut,
      enableEmailNotifications,
      enableSmsNotifications,
      features
    } = req.body;

    const updates = [];
    const params = [req.companyId];
    let idx = 2;

    if (workStartTime) {
      updates.push(`work_start_time = $${idx}`);
      params.push(workStartTime);
      idx++;
    }

    if (workEndTime) {
      updates.push(`work_end_time = $${idx}`);
      params.push(workEndTime);
      idx++;
    }

    if (timezone) {
      updates.push(`timezone = $${idx}`);
      params.push(timezone);
      idx++;
    }

    if (annualLeaveDays !== undefined) {
      updates.push(`annual_leave_days = $${idx}`);
      params.push(annualLeaveDays);
      idx++;
    }

    if (sickLeaveDays !== undefined) {
      updates.push(`sick_leave_days = $${idx}`);
      params.push(sickLeaveDays);
      idx++;
    }

    if (lateThresholdMinutes !== undefined) {
      updates.push(`late_threshold_minutes = $${idx}`);
      params.push(lateThresholdMinutes);
      idx++;
    }

    if (earlyLeaveThresholdMinutes !== undefined) {
      updates.push(`early_leave_threshold_minutes = $${idx}`);
      params.push(earlyLeaveThresholdMinutes);
      idx++;
    }

    if (requireClockOut !== undefined) {
      updates.push(`require_clock_out = $${idx}`);
      params.push(requireClockOut);
      idx++;
    }

    if (enableEmailNotifications !== undefined) {
      updates.push(`enable_email_notifications = $${idx}`);
      params.push(enableEmailNotifications);
      idx++;
    }

    if (enableSmsNotifications !== undefined) {
      updates.push(`enable_sms_notifications = $${idx}`);
      params.push(enableSmsNotifications);
      idx++;
    }

    if (features) {
      updates.push(`features = $${idx}::jsonb`);
      params.push(JSON.stringify(features));
      idx++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);

    const query = `
      UPDATE company_settings 
      SET ${updates.join(', ')}
      WHERE company_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, params);

    console.log('✅ Company settings updated');

    res.json({
      message: 'Settings updated successfully',
      settings: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Update settings error:', error);
    console.error('❌ Error details:', error.message);
    res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;