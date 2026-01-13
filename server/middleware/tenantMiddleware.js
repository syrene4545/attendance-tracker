// server/middleware/tenantMiddleware.js

// Extract tenant from authenticated user (NEVER decode JWT here)
export const extractTenant = (req, res, next) => {
  // Skip for public routes
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/companies/register',
    '/api/companies/check-subdomain'
  ];

  if (publicRoutes.some(route => req.originalUrl.startsWith(route))) {
    console.log('🔓 Public route, skipping tenant extraction:', req.originalUrl);
    return next();
  }

  // User must be authenticated first
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Extract tenant from authenticated user
  if (!req.user.company_id) {
    return res.status(403).json({ error: 'User not associated with any company' });
  }

  // Set tenant context
  req.companyId = req.user.company_id;
  
  console.log(`🏢 Tenant extracted: company_id=${req.companyId} for user=${req.user.email}`);
  
  next();
};

// Verify user belongs to the current tenant (redundant but useful for security)
export const verifyTenantAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.companyId) {
    return res.status(403).json({ error: 'Tenant context not established' });
  }

  // This should always pass now since companyId comes from req.user.company_id
  if (req.user.company_id !== req.companyId) {
    console.error(`⚠️ Tenant mismatch: User company ${req.user.company_id} !== Request company ${req.companyId}`);
    return res.status(403).json({ error: 'Company access denied' });
  }

  next();
};