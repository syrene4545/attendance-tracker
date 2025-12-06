import jwt from "jsonwebtoken";
import { pool } from "../index.js";

// =============================
// 1. AUTHENTICATE TOKEN
// =============================
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log('📨 Received Authorization header:', authHeader); // ✅ Add this
  console.log('🔑 Extracted token:', token); // ✅ Add this

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    // Decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user record from DB
    const result = await pool.query(
      "SELECT id, name, email, role, department FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User account not found" });
    }

    req.user = result.rows[0]; // Full user object
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
      ],
      hr: ["view_all", "edit_attendance", "view_analytics", "export_data"],
      pharmacist: ["view_own", "record_attendance"],
      assistant: ["view_own", "record_attendance"],
    };

    const role = req.user.role;
    const userPermissions = PERMISSIONS[role] || [];

    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};
