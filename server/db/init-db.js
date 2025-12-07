import bcrypt from 'bcrypt';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Connect to database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database initialization...');
    
    // Hash password for all test users
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔑 Password hashed successfully');
    
    // Drop existing tables
    console.log('🗑️  Dropping existing tables...');
    await client.query('DROP TABLE IF EXISTS attendance_logs CASCADE');
    await client.query('DROP TABLE IF EXISTS users CASCADE');
    
    // Create users table
    console.log('📋 Creating users table...');
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'pharmacist',
        department VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create attendance_logs table
    console.log('📋 Creating attendance_logs table...');
    await client.query(`
      CREATE TABLE attendance_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        location VARCHAR(255),
        edited BOOLEAN DEFAULT FALSE,
        edited_by INTEGER REFERENCES users(id),
        edited_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes
    console.log('🔍 Creating indexes...');
    await client.query('CREATE INDEX idx_attendance_user_id ON attendance_logs(user_id)');
    await client.query('CREATE INDEX idx_attendance_timestamp ON attendance_logs(timestamp)');
    await client.query('CREATE INDEX idx_attendance_type ON attendance_logs(type)');
    await client.query('CREATE INDEX idx_users_email ON users(email)');
    await client.query('CREATE INDEX idx_users_role ON users(role)');
    
    // Insert default users
    console.log('👥 Creating default users...');
    const users = [
      ['admin@company.com', hashedPassword, 'Admin User', 'admin', 'Management'],
      ['hr@company.com', hashedPassword, 'HR Manager', 'hr', 'Human Resources'],
      ['john@company.com', hashedPassword, 'John Doe', 'pharmacist', 'Pharmacy'],
      ['jane@company.com', hashedPassword, 'Jane Smith', 'assistant', 'Pharmacy']
    ];
    
    for (const [email, password, name, role, department] of users) {
      await client.query(
        'INSERT INTO users (email, password, name, role, department) VALUES ($1, $2, $3, $4, $5)',
        [email, password, name, role, department]
      );
      console.log(`  ✅ Created user: ${email}`);
    }
    
    // Insert sample attendance logs
    console.log('📊 Creating sample attendance logs...');
    const logs = [
      [1, 'sign-in', 'NOW() - INTERVAL \'8 hours\'', 'Office - Main Entrance'],
      [1, 'lunch-out', 'NOW() - INTERVAL \'4 hours\'', 'Office - Main Entrance'],
      [1, 'lunch-in', 'NOW() - INTERVAL \'3 hours\'', 'Office - Main Entrance'],
      [2, 'sign-in', 'NOW() - INTERVAL \'7 hours\'', 'Office - Side Entrance'],
      [3, 'sign-in', 'NOW() - INTERVAL \'6 hours\'', 'Office - Main Entrance'],
      [4, 'sign-in', 'NOW() - INTERVAL \'5 hours\'', 'Office - Side Entrance']
    ];
    
    for (const [userId, type, timestamp, location] of logs) {
      await client.query(
        `INSERT INTO attendance_logs (user_id, type, timestamp, location) VALUES ($1, $2, ${timestamp}, $3)`,
        [userId, type, location]
      );
    }
    console.log('  ✅ Created sample attendance logs');
    
    // Verify installation
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const logCount = await client.query('SELECT COUNT(*) FROM attendance_logs');
    
    console.log('\n✅ DATABASE INITIALIZED SUCCESSFULLY!\n');
    console.log('📊 Summary:');
    console.log(`   - Users created: ${userCount.rows[0].count}`);
    console.log(`   - Attendance logs created: ${logCount.rows[0].count}`);
    console.log('\n🔐 Default Login Credentials:');
    console.log('   Email: admin@company.com');
    console.log('   Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change these passwords after first login!\n');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run initialization
initializeDatabase()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });