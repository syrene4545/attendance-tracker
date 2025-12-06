// ==================== ROLE PERMISSIONS ====================

export const ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  PHARMACIST: 'pharmacist',
  ASSISTANT: 'assistant',
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: ['view_all', 'edit_all', 'delete', 'manage_users', 'view_analytics', 'export_data'],
  [ROLES.HR]: ['view_all', 'edit_attendance', 'view_analytics', 'export_data'],
  [ROLES.PHARMACIST]: ['view_own', 'record_attendance'],
  [ROLES.ASSISTANT]: ['view_own', 'record_attendance'],
};

export const hasPermission = (role, permission) => {
  return PERMISSIONS[role]?.includes(permission) || false;
};
