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

    // Pull the correct user from "users" table
    const result = await pool.query(
      "SELECT id, name, email, role, department FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Attach user to request
    req.user = result.rows[0];

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
