
import bcrypt from "bcryptjs";
import { pool } from "../index.js";
import { generateToken } from "../utils/generateToken.js";


export const login = async (req, res) => {
const { email, password } = req.body;


const userRes = await pool.query("SELECT * FROM employees WHERE email = $1", [email]);
if (userRes.rows.length === 0) return res.status(400).json({ message: "Invalid credentials" });


const user = userRes.rows[0];
const match = await bcrypt.compare(password, user.password);
if (!match) return res.status(400).json({ message: "Invalid credentials" });


return res.json({
id: user.id,
name: user.name,
role: user.role,
token: generateToken(user.id),
});
};
