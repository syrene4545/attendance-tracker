import dotenv from 'dotenv';
dotenv.config();
import pkg from 'pg';
const { Pool } = pkg;



const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateSickLeaveBalances() {
  const client = await pool.connect();
  
  try {
    console.log('🏥 Starting sick leave balance migration...\n');
    
    const currentYear = new Date().getFullYear();
    const cycleStartYear = currentYear - 2; // 3-year cycle: 2024, 2025, 2026
    
    console.log(`📅 Current 3-year sick leave cycle: ${cycleStartYear} - ${currentYear}`);
    console.log('─'.repeat(80));
    
    // Get all users
    const usersResult = await client.query('SELECT id, name FROM users ORDER BY name');
    const users = usersResult.rows;
    
    console.log(`\n👥 Processing ${users.length} employees...\n`);
    
    for (const user of users) {
      console.log(`\n👤 Processing: ${user.name} (ID: ${user.id})`);
      console.log('─'.repeat(80));
      
      // Get all approved sick leave from the past 3 years
      const sickLeaveResult = await client.query(
        `SELECT 
          EXTRACT(YEAR FROM start_date) as year,
          SUM(number_of_days) as days_taken
         FROM leave_requests
         WHERE user_id = $1 
           AND leave_type = 'sick'
           AND status = 'approved'
           AND EXTRACT(YEAR FROM start_date) >= $2
         GROUP BY EXTRACT(YEAR FROM start_date)
         ORDER BY year`,
        [user.id, cycleStartYear]
      );
      
      const sickLeaveByYear = sickLeaveResult.rows;
      
      // Calculate total sick days used in the 3-year cycle
      let totalSickDaysUsed = 0;
      
      console.log('📊 Sick leave history:');
      if (sickLeaveByYear.length === 0) {
        console.log('   ✓ No sick leave taken in current cycle');
      } else {
        sickLeaveByYear.forEach(record => {
          const days = parseFloat(record.days_taken);
          totalSickDaysUsed += days;
          console.log(`   ${record.year}: ${days} days`);
        });
        console.log(`   Total used in cycle: ${totalSickDaysUsed} days`);
      }
      
      // Check if user has sick leave balance for current year
      const balanceResult = await client.query(
        `SELECT id, total_days, used_days, remaining_days 
         FROM employee_leave_balances
         WHERE user_id = $1 AND leave_type = 'sick' AND year = $2`,
        [user.id, currentYear]
      );
      
      if (balanceResult.rows.length === 0) {
        console.log(`   ⚠️  No sick leave balance for ${currentYear} - skipping`);
        continue;
      }
      
      const currentBalance = balanceResult.rows[0];
      
      // Calculate correct balances
      const totalAllowance = 30; // 30 days per 3-year cycle
      const correctRemainingDays = totalAllowance - totalSickDaysUsed;
      const correctUsedDays = totalSickDaysUsed;
      
      console.log('\n💊 Sick Leave Balance Adjustment:');
      console.log(`   Total allowance (3-year cycle): ${totalAllowance} days`);
      console.log(`   Total used in cycle: ${totalSickDaysUsed} days`);
      console.log(`   Should have remaining: ${correctRemainingDays} days`);
      console.log(`   Current balance shows: ${currentBalance.remaining_days} days`);
      
      // Update the balance if it's incorrect
      if (parseFloat(currentBalance.remaining_days) !== correctRemainingDays) {
        await client.query(
          `UPDATE employee_leave_balances
           SET used_days = $1,
               remaining_days = $2,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $3`,
          [correctUsedDays, correctRemainingDays, currentBalance.id]
        );
        
        console.log(`   ✅ UPDATED: ${currentBalance.remaining_days} → ${correctRemainingDays} days`);
      } else {
        console.log(`   ✓ Balance already correct`);
      }
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log('✨ Sick leave balance migration completed successfully!');
    console.log('═'.repeat(80));
    
  } catch (error) {
    console.error('\n❌ Error during migration:', error);
    console.error(error.stack);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
migrateSickLeaveBalances();