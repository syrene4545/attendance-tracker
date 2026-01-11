// import jwt from "jsonwebtoken";
// import { pool } from "../index.js";

// export const protect = async (req, res, next) => {
//   let token;

//   // Extract Bearer token
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   if (!token) {
//     return res.status(401).json({ error: "Access token required" });
//   }

//   try {
//     // Verify JWT
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Pull the correct user from "users" table
//     const result = await pool.query(
//       "SELECT id, name, email, role, department FROM users WHERE id = $1",
//       [decoded.id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // Attach user to request
//     req.user = result.rows[0];

//     next();
//   } catch (err) {
//     console.error("Auth middleware error:", err);
//     return res.status(401).json({ error: "Invalid or expired token" });
//   }
// };

import jwt from "jsonwebtoken";
import { pool } from "../index.js";

export const protect = async (req, res, next) => {
  let token;

  // Extract Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log('🔓 Decoded JWT:', decoded); // ✅ Debug log

    // ✅ Pull user WITH company_id from database
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.department, u.company_id,
              c.company_name, c.subdomain, c.is_active as company_active
       FROM users u
       LEFT JOIN companies c ON u.company_id = c.id
       WHERE u.id = $1`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
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

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};