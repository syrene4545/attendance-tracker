process.env.TZ = 'Africa/Harare';

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import pool from config instead of creating it here
import { pool } from './config/database.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import exportRoutes from './routes/export.routes.js';
import healthRoutes from './routes/health.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import passwordResetRoutes from './routes/passwordReset.routes.js';
import signupRequestRoutes from './routes/signupRequest.routes.js';
import departmentRoutes from './routes/departments.routes.js';
import jobPositionRoutes from './routes/jobPositions.routes.js';
import employeeProfileRoutes from './routes/employeeProfile.routes.js';
import compensationRoutes from './routes/compensation.routes.js';
import leaveRoutes from './routes/leave.routes.js';
import payrollRoutes from './routes/payroll.routes.js';
import assessmentAnalyticsRoutes from './routes/assessmentAnalytics.js';
import assessmentRoutes from './routes/assessments.js';

import companiesRoutes from './routes/companies.routes.js';
import subscriptionRoutes from './routes/subscriptions.routes.js';
import sopRoutes from './routes/sop.routes.js';


import { extractTenant } from './middleware/tenantMiddleware.js';

// Export pool so other files can still import from index.js if needed
export { pool };

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ✅ CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://attendance-tracker-app-jnxk.onrender.com',
];

app.use(cors({ 
  origin: allowedOrigins,
  credentials: true 
}));

// Body parser middleware
app.use(express.json());

// ✅ Apply tenant extraction to ALL routes (except auth registration)
app.use('/api', extractTenant);

// ==================== API Routes ====================
app.use('/api/companies', companiesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/signup-request', signupRequestRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/job-positions', jobPositionRoutes);
app.use('/api/employee-profiles', employeeProfileRoutes);
app.use('/api/compensation', compensationRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/assessment-analytics', assessmentAnalyticsRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/sops', sopRoutes);

// Health check endpoint
app.get('/api/db-health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// ==================== Start Server ====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
});

// ==================== Graceful Shutdown ====================
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end();
  process.exit(0);
});