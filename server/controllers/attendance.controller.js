import { pool } from "../index.js";


export const checkIn = async (req, res) => {
const employeeId = req.user.id;
const now = new Date();


await pool.query(
"INSERT INTO attendance (employee_id, check_in) VALUES ($1, $2)",
[employeeId, now]
);


res.json({ message: "Checked in", time: now });
};


export const checkOut = async (req, res) => {
const employeeId = req.user.id;
const now = new Date();


await pool.query(
"UPDATE attendance SET check_out = $1 WHERE employee_id = $2 AND check_out IS NULL",
[now, employeeId]
);


res.json({ message: "Checked out", time: now });
};


export const getMyAttendance = async (req, res) => {
const employeeId = req.user.id;
const result = await pool.query(
"SELECT * FROM attendance WHERE employee_id = $1 ORDER BY check_in DESC",
[employeeId]
);
res.json(result.rows);
};