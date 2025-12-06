require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function testConnection() {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM users');
    // console.log('✅ Database connection successful!');
    // console.log(`Found ${result.rows[0].count} users in database`);
    
    const users = await pool.query('SELECT id, name, email, role FROM users ORDER BY role');
    // console.log('\nUsers in database:');
    users.rows.forEach(user => {
      // console.log(`  ${user.role.padEnd(12)} - ${user.name.padEnd(20)} (${user.email})`);
    });
    
    await pool.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\nCheck your .env file settings:');
    console.error(`  DB_USER: ${process.env.DB_USER}`);
    console.error(`  DB_HOST: ${process.env.DB_HOST}`);
    console.error(`  DB_NAME: ${process.env.DB_NAME}`);
    console.error(`  DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' : 'NOT SET'}`);
    console.error(`  DB_PORT: ${process.env.DB_PORT}`);
  }
}

testConnection();