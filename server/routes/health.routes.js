import express from 'express';
import { pool } from '../index.js';

const router = express.Router();

// ==================== HEALTH CHECK ====================
// All health check routes are PUBLIC (no authentication required)

// Basic health check (public endpoint - no auth required)
router.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Attendance Tracker API',
    version: '1.0.0'
  });
});

// Detailed health check with database connectivity (public endpoint)
router.get('/detailed', async (req, res) => {
  try {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Attendance Tracker API',
      version: '1.0.0',
      checks: {
        database: 'unknown',
        multiTenancy: 'unknown'
      }
    };

    // Check database connection
    try {
      const dbCheck = await pool.query('SELECT NOW() as current_time');
      healthCheck.checks.database = 'healthy';
      healthCheck.checks.databaseTime = dbCheck.rows[0].current_time;
    } catch (error) {
      healthCheck.checks.database = 'unhealthy';
      healthCheck.checks.databaseError = error.message;
      healthCheck.status = 'DEGRADED';
    }

    // Check multi-tenancy tables
    try {
      const tenancyCheck = await pool.query(`
        SELECT 
          (SELECT COUNT(*) FROM companies) as company_count,
          (SELECT COUNT(*) FROM users) as user_count,
          (SELECT COUNT(*) FROM attendance_logs) as attendance_count
      `);
      
      healthCheck.checks.multiTenancy = 'healthy';
      healthCheck.checks.stats = {
        totalCompanies: parseInt(tenancyCheck.rows[0].company_count),
        totalUsers: parseInt(tenancyCheck.rows[0].user_count),
        totalAttendanceLogs: parseInt(tenancyCheck.rows[0].attendance_count)
      };
    } catch (error) {
      healthCheck.checks.multiTenancy = 'unhealthy';
      healthCheck.checks.multiTenancyError = error.message;
      healthCheck.status = 'DEGRADED';
    }

    // Set appropriate HTTP status code
    const statusCode = healthCheck.status === 'OK' ? 200 : 503;
    
    res.status(statusCode).json(healthCheck);
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Database health check (public endpoint)
router.get('/db', async (req, res) => {
  try {
    const start = Date.now();
    const result = await pool.query('SELECT 1 as healthy');
    const duration = Date.now() - start;

    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: {
        healthy: result.rows[0].healthy === 1,
        responseTime: `${duration}ms`
      }
    });
  } catch (error) {
    console.error('❌ Database health check error:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: {
        healthy: false,
        error: error.message
      }
    });
  }
});

// Multi-tenancy health check (public endpoint)
router.get('/tenancy', async (req, res) => {
  try {
    // Check if companies table exists and has data
    const companiesCheck = await pool.query(`
      SELECT 
        COUNT(*) as total_companies,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_companies
      FROM companies
    `);

    // Check if tenant isolation is working
    const isolationCheck = await pool.query(`
      SELECT 
        company_id,
        COUNT(*) as record_count
      FROM attendance_logs
      GROUP BY company_id
      ORDER BY company_id
      LIMIT 100
    `);

    // Check if critical tables have company_id column
    const schemaCheck = await pool.query(`
      SELECT 
        table_name,
        column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND column_name = 'company_id'
        AND table_name IN (
          'users', 'attendance_logs', 'departments',
          'leave_requests', 'assessments',
          'assessment_attempts', 'employee_compensation',
          'employee_allowances', 'employee_deductions',
          'job_positions', 'badges', 'user_badges',
          'user_certifications', 'company_settings'
        )
      ORDER BY table_name
    `);

    const expectedTables = [
      'users', 'attendance_logs', 'departments',
      'leave_requests', 'assessments',
      'assessment_attempts', 'employee_compensation',
      'employee_allowances', 'employee_deductions',
      'job_positions', 'badges', 'user_badges',
      'user_certifications', 'company_settings'
    ];

    const tablesWithCompanyId = schemaCheck.rows.map(row => row.table_name);
    const missingTables = expectedTables.filter(table => !tablesWithCompanyId.includes(table));

    const healthStatus = {
      status: missingTables.length === 0 ? 'OK' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      multiTenancy: {
        enabled: true,
        totalCompanies: parseInt(companiesCheck.rows[0].total_companies),
        activeCompanies: parseInt(companiesCheck.rows[0].active_companies),
        dataDistribution: isolationCheck.rows.map(row => ({
          companyId: row.company_id,
          attendanceRecords: parseInt(row.record_count)
        })),
        schema: {
          tablesWithCompanyId: tablesWithCompanyId,
          missingCompanyId: missingTables,
          coverage: `${Math.round((tablesWithCompanyId.length / expectedTables.length) * 100)}%`
        }
      }
    };

    const statusCode = healthStatus.status === 'OK' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    console.error('❌ Tenancy health check error:', error);
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      multiTenancy: {
        enabled: false,
        error: error.message
      }
    });
  }
});

// Ready check (for Kubernetes/Docker health probes)
router.get('/ready', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    
    // Check companies table exists
    await pool.query('SELECT COUNT(*) FROM companies');
    
    res.status(200).json({
      status: 'READY',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Readiness check failed:', error);
    res.status(503).json({
      status: 'NOT_READY',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Live check (for Kubernetes/Docker liveness probes)
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'ALIVE',
    timestamp: new Date().toISOString()
  });
});

export default router;