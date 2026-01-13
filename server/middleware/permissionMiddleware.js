// server/middleware/permissionMiddleware.js

// Check if user has specific permission based on role
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;

    // Define permissions for each role
    const permissions = {
      admin: [
        'manage_users',
        'manage_attendance',
        'view_analytics',
        'manage_departments',
        'manage_positions',
        'manage_payroll',
        'manage_leave',
        'manage_company',
        'view_own_attendance',
        'clock_in_out',
        'request_leave',
        'view_own_payslip',
        'manage_assessments',
        'manage_sops'
      ],
      hr: [
        'manage_users',
        'manage_attendance',
        'view_analytics',
        'manage_leave',
        'manage_payroll',
        'view_own_attendance',
        'clock_in_out',
        'request_leave',
        'view_own_payslip',
        'manage_assessments',
        'manage_sops'
      ],
      pharmacist: [
        'view_own_attendance',
        'clock_in_out',
        'request_leave',
        'view_own_payslip',
        'view_assessments'
      ],
      assistant: [
        'view_own_attendance',
        'clock_in_out',
        'request_leave',
        'view_own_payslip',
        'view_assessments'
      ]
    };

    const rolePermissions = permissions[userRole] || [];

    if (!rolePermissions.includes(permission)) {
      console.log(`❌ Permission denied: ${userRole} does not have ${permission}`);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    console.log(`✅ Permission granted: ${permission} for ${userRole}`);
    next();
  };
};

// Check if user is admin or HR
export const isAdminOrHR = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'hr') {
    return res.status(403).json({ error: 'Admin or HR access required' });
  }

  next();
};

// Check if user is admin only
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};