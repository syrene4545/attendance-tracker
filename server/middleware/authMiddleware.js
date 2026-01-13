// server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { pool } from '../index.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user with company info (single query)
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.department, u.company_id,
              c.name AS company_name, c.subdomain, c.is_active AS company_active
       FROM users u
       JOIN companies c ON u.company_id = c.id
       WHERE u.id = $1`,
      [decoded.id]
    );

    if (!result.rows.length) {
      return res.status(401).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Check if company is active
    if (!user.company_active) {
      return res.status(403).json({ error: 'Company account is inactive' });
    }

    // Attach complete user object to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      company_id: user.company_id,
      company_name: user.company_name,
      subdomain: user.subdomain,
      company_active: user.company_active
    };

    console.log(`✅ User authenticated: ${user.email} | Role: ${user.role} | Company: ${user.company_id}`);
    
    next();
  } catch (err) {
    console.error('❌ Auth error:', err.message);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};