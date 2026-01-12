
import jwt from "jsonwebtoken";
import { pool } from "../index.js";

// =============================
// 1. AUTHENTICATE TOKEN
// =============================
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log('📨 Received Authorization header:', authHeader ? 'Present' : 'Missing');
  console.log('🔑 Extracted token:', token ? 'Present' : 'Missing');

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    // Decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('🔓 Decoded JWT:', decoded); // ✅ Debug log

    // ✅ Fetch user WITH company_id from database
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.department, u.company_id,
              c.company_name, c.subdomain, c.is_active as company_active
       FROM users u
       LEFT JOIN companies c ON u.company_id = c.id
       WHERE u.id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User account not found" });
    }

    const user = result.rows[0];

    console.log('👤 User loaded:', user.email, '| company_id:', user.company_id); // ✅ Debug log

    // ✅ Check if company is active
    if (user.company_id && !user.company_active) {
      return res.status(403).json({ error: "Company account is inactive" });
    }

    // ✅ Ensure user has a company_id
    if (!user.company_id) {
      console.error('❌ User has no company_id:', user.email);
      return res.status(403).json({ error: "User not associated with any company" });
    }

    req.user = user; // ✅ Now includes company_id
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// =============================
// 2. CHECK PERMISSIONS
// =============================
export const checkPermission = (permission) => {
  return (req, res, next) => {
    const PERMISSIONS = {
      admin: [
        "view_all",
        "edit_all",
        "delete",
        "manage_users",
        "view_analytics",
        "export_data",
        "view_payroll",
        "process_payroll",
        "manage_compensation",
        "view_employees",
        "manage_employees",
        "view_org_structure",
        "manage_org_structure",
        "approve_leave",
        "view_leave_reports",
        "view_compensation",
        "request_leave",
      ],
      hr: [
        "view_all",
        "edit_attendance",
        "view_analytics",
        "export_data",
        "view_payroll",
        "view_compensation",
        "approve_leave",
        "view_employees",
        "manage_employees",
        "view_org_structure",
        "view_leave_reports",
        "request_leave",
      ],
      pharmacist: [
        "view_own", 
        "record_attendance", 
        "view_employees",
        "request_leave",
        "view_own_payslip",
      ],
      assistant: [
        "view_own", 
        "record_attendance", 
        "view_employees",
        "request_leave",
        "view_own_payslip",
      ],
    };

    const role = req.user.role;
    const userPermissions = PERMISSIONS[role] || [];

    console.log(`🔐 Permission check: ${permission} for role: ${role}`);

    if (!userPermissions.includes(permission)) {
      console.log(`❌ Permission denied`);
      return res.status(403).json({ 
        error: "Insufficient permissions",
        required: permission,
        yourRole: role 
      });
    }

    console.log(`✅ Permission granted`);
    next();
  };
};