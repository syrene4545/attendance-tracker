import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addCompanyIdToAttendanceLogs() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Adding company_id to attendance_logs table...\n');
    
    await client.query('BEGIN');
    
    // 1. Add column
    await client.query(`
      ALTER TABLE attendance_logs 
      ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id)
    `);
    console.log('✅ Added company_id column');
    
    // 2. Create index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_attendance_logs_company_id 
      ON attendance_logs(company_id)
    `);
    console.log('✅ Created index');
    
    // 3. Update existing records
    const result = await client.query(`
      UPDATE attendance_logs 
      SET company_id = u.company_id
      FROM users u
      WHERE attendance_logs.user_id = u.id
        AND attendance_logs.company_id IS NULL
    `);
    console.log(`✅ Updated ${result.rowCount} attendance_logs records`);
    
    // 4. Verify
    const check = await client.query(`
      SELECT 
        COUNT(*) as total, 
        COUNT(company_id) as with_company_id 
      FROM attendance_logs
    `);
    console.log('\n📊 Verification:');
    console.log(`   Total records: ${check.rows[0].total}`);
    console.log(`   With company_id: ${check.rows[0].with_company_id}`);
    
    await client.query('COMMIT');
    
    console.log('\n✨ Migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addCompanyIdToAttendanceLogs();