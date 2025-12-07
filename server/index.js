import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import exportRoutes from './routes/export.routes.js';
import healthRoutes from './routes/health.routes.js';
import employeeRoutes from './routes/employee.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://attendance-tracker-app-jnxk.onrender.com', // ✅ Add your Render frontend URL
  ],
  credentials: true
};

app.use(cors(corsOptions));

// Middleware
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : '*', credentials: true }));
app.use(express.json());

// PostgreSQL Connection
const { Pool } = pg;

// ✅ Use DATABASE_URL if available (Render), otherwise use individual variables (local dev)
export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    })
  : new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'attendance_db',
      password: process.env.DB_PASSWORD || 'QweasD#123',
      port: Number(process.env.DB_PORT) || 5432,
    });

pool.connect()
  .then(() => console.log('✅ DB Connected'))
  .catch((err) => console.error('❌ DB Error', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/employees', employeeRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end();
  process.exit(0);
});

app.get('/api/db-health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});