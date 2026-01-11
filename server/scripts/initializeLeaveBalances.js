import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initializeLeaveBalances() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Initializing leave balances for all users...');
    
    // Get all users
    const usersResult = await client.query('SELECT id, name FROM users');
    const users = usersResult.rows;
    
    console.log(`📊 Found ${users.length} users`);
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Default leave allocations
    const leaveTypes = [
      { type: 'annual', days: 21 },      // 21 days annual leave
      { type: 'sick', days: 30 },        // 30 days sick leave (can accumulate)
      { type: 'family', days: 3 },       // 3 days family responsibility leave
      { type: 'study', days: 5 },        // 5 days study leave
      { type: 'maternity', days: 120 }   // 120 days maternity leave (4 months)
    ];
    
    let initialized = 0;
    let skipped = 0;
    
    for (const user of users) {
      for (const leaveType of leaveTypes) {
        // Check if balance already exists
        const existingBalance = await client.query(
          `SELECT id FROM leave_balances 
           WHERE user_id = $1 AND leave_type = $2 AND year = $3`,
          [user.id, leaveType.type, currentYear]
        );
        
        if (existingBalance.rows.length === 0) {
          // Create new balance
          await client.query(
            `INSERT INTO leave_balances (user_id, leave_type, year, total_days, used_days, remaining_days)
             VALUES ($1, $2, $3, $4, 0, $4)`,
            [user.id, leaveType.type, currentYear, leaveType.days]
          );
          
          console.log(`✅ Created ${leaveType.type} balance for ${user.name}: ${leaveType.days} days`);
          initialized++;
        } else {
          console.log(`⏭️  Skipped ${leaveType.type} for ${user.name} (already exists)`);
          skipped++;
        }
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Initialized: ${initialized} balances`);
    console.log(`⏭️  Skipped: ${skipped} balances`);
    console.log('✨ Done!');
    
  } catch (error) {
    console.error('❌ Error initializing leave balances:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

initializeLeaveBalances();