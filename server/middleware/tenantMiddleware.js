// import { pool } from '../index.js';

// // Extract company from subdomain, domain, or header (for development)
// export const extractTenant = async (req, res, next) => {
//   try {
//     // Skip tenant extraction for certain public routes
//     const publicRoutes = ['/api/auth/register', '/api/auth/login', '/api/companies/register'];
//     if (publicRoutes.includes(req.path)) {
//       return next();
//     }

//     let companyId = null;
//     let company = null;
    
//     const host = req.get('host') || '';
    
//     // Development: Use header or default company
//     if (host.includes('localhost') || host.includes('127.0.0.1')) {
//       // Check for X-Company-Id header (for development)
//       companyId = req.headers['x-company-id'] || process.env.DEFAULT_COMPANY_ID || 2;
      
//       console.log(`🔧 DEV MODE: Using company_id: ${companyId}`);
      
//     } else {
//       // Production: Extract subdomain (e.g., acme.yourapp.com)
//       const subdomain = host.split('.')[0];
      
//       if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
//         const result = await pool.query(
//           'SELECT * FROM companies WHERE subdomain = $1 AND is_active = true',
//           [subdomain]
//         );
        
//         if (result.rows.length === 0) {
//           return res.status(404).json({ error: 'Company not found' });
//         }
        
//         company = result.rows[0];
//         companyId = company.id;
//       } else {
//         // Try custom domain
//         const domainResult = await pool.query(
//           'SELECT * FROM companies WHERE domain = $1 AND is_active = true',
//           [host]
//         );
        
//         if (domainResult.rows.length > 0) {
//           company = domainResult.rows[0];
//           companyId = company.id;
//         }
//       }
//     }
    
//     if (!companyId) {
//       return res.status(400).json({ error: 'Could not determine company context' });
//     }
    
//     // Attach to request
//     req.companyId = parseInt(companyId);
//     req.company = company;
    
//     next();
//   } catch (error) {
//     console.error('Tenant extraction error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // Verify user belongs to the current company (use after protect middleware)
// export const verifyTenantAccess = (req, res, next) => {
//   if (!req.user) {
//     return res.status(401).json({ error: 'Authentication required' });
//   }
  
//   if (!req.user.company_id) {
//     return res.status(403).json({ error: 'User not associated with any company' });
//   }
  
//   if (req.user.company_id !== req.companyId) {
//     console.error(`⚠️ Tenant mismatch: User company ${req.user.company_id} !== Request company ${req.companyId}`);
//     return res.status(403).json({ error: 'Access denied: Company mismatch' });
//   }
  
//   next();
// };

import { pool } from '../index.js';

// Extract company from subdomain, domain, or header (for development)
export const extractTenant = async (req, res, next) => {
  try {
    // ✅ Skip tenant extraction for certain public routes
    // Use originalUrl to get the full path including /api
    const publicPaths = [
      '/api/auth/register',
      '/api/auth/login',
      '/api/companies/register',
      '/api/companies/check-subdomain'
    ];
    
    // Check if current path starts with any public path
    const isPublicRoute = publicPaths.some(path => 
      req.originalUrl.startsWith(path) || req.path.startsWith(path.replace('/api', ''))
    );
    
    if (isPublicRoute) {
      console.log('🔓 Public route, skipping tenant extraction:', req.originalUrl);
      return next();
    }

    let companyId = null;
    let company = null;
    
    const host = req.get('host') || '';
    
    // Development: Use header or default company
    if (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('render.com')) {
      // ✅ Check for X-Company-Id header (for development)
      companyId = req.headers['x-company-id'];
      
      if (!companyId) {
        // ✅ Try to get from JWT token
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          try {
            const token = authHeader.substring(7);
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            companyId = decoded.company_id;
            console.log('🔑 Extracted company_id from JWT:', companyId);
          } catch (err) {
            console.log('⚠️ Could not decode JWT:', err.message);
          }
        }
      }
      
      // ✅ Fall back to default company
      if (!companyId) {
        companyId = process.env.DEFAULT_COMPANY_ID || 1;
      }
      
      console.log(`🔧 DEV MODE: Using company_id: ${companyId}`);
      
    } else {
      // Production: Extract subdomain (e.g., acme.yourapp.com)
      const subdomain = host.split('.')[0];
      
      if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
        const result = await pool.query(
          'SELECT * FROM companies WHERE subdomain = $1 AND is_active = true',
          [subdomain]
        );
        
        if (result.rows.length === 0) {
          return res.status(404).json({ error: 'Company not found' });
        }
        
        company = result.rows[0];
        companyId = company.id;
      } else {
        // Try custom domain
        const domainResult = await pool.query(
          'SELECT * FROM companies WHERE domain = $1 AND is_active = true',
          [host]
        );
        
        if (domainResult.rows.length > 0) {
          company = domainResult.rows[0];
          companyId = company.id;
        }
      }
    }
    
    if (!companyId) {
      return res.status(400).json({ error: 'Could not determine company context' });
    }
    
    // Attach to request
    req.companyId = parseInt(companyId);
    req.company = company;
    
    next();
  } catch (error) {
    console.error('❌ Tenant extraction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify user belongs to the current company (use after protect middleware)
export const verifyTenantAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (!req.user.company_id) {
    return res.status(403).json({ error: 'User not associated with any company' });
  }
  
  if (req.user.company_id !== req.companyId) {
    console.error(`⚠️ Tenant mismatch: User company ${req.user.company_id} !== Request company ${req.companyId}`);
    return res.status(403).json({ error: 'Access denied: Company mismatch' });
  }
  
  next();
};