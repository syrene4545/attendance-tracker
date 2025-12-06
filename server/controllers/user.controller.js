import bcrypt from "bcryptjs";
import { pool } from "../index.js";


export const createUser = async (req, res) => {
const { name, email, password, role } = req.body;
const hashed = await bcrypt.hash(password, 10);


const result = await pool.query(
"INSERT INTO employees (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
[name, email, hashed, role]
);


res.json(result.rows[0]);
};


export const getEmployees = async (req, res) => {
const result = await pool.query("SELECT id, name, email, role FROM employees");
res.json(result.rows);
};