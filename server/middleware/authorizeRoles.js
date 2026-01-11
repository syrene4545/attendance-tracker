/**
 * Middleware to authorize users based on their roles
 * Usage: authorizeRoles('admin', 'manager')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        yourRole: userRole
      });
    }

    next();
  };
};

export default authorizeRoles;