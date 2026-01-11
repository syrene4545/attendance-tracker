import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateToMultiTenant() {
  const client = await pool.connect();
  
  try {
    console.log('🏢 Starting multi-tenancy migration...\n');
    
    await client.query('BEGIN');
    
    // 1. Check if companies table exists
    const companiesExists = await client.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'companies'
      )`
    );
    
    if (!companiesExists.rows[0].exists) {
      console.error('❌ Companies table does not exist. Please run the SQL migration first.');
      await client.query('ROLLBACK');
      return;
    }
    
    // 2. Create a default company for existing data
    const existingCompany = await client.query(
      'SELECT id FROM companies WHERE subdomain = $1',
      ['default']
    );
    
    let defaultCompanyId;
    
    if (existingCompany.rows.length > 0) {
      defaultCompanyId = existingCompany.rows[0].id;
      console.log(`✅ Using existing default company with ID: ${defaultCompanyId}`);
    } else {
      const companyResult = await client.query(
        `INSERT INTO companies (
          company_name, 
          subdomain, 
          email, 
          subscription_plan, 
          max_employees,
          is_active
        ) VALUES (
          'Default Company',
          'default',
          'admin@example.com',
          'enterprise',
          1000,
          true
        )
        RETURNING id`
      );
      
      defaultCompanyId = companyResult.rows[0].id;
      console.log(`✅ Created default company with ID: ${defaultCompanyId}`);
    }
    
    // 3. List of tables to update (based on your actual schema)
    const tablesToUpdate = [
      'users',
      'departments',
      'job_positions',
      'employee_profiles',
      'attendance_logs',
      'leave_requests',
      'employee_leave_balances',
      'assessments',
      'assessment_questions',
      'assessment_attempts',
      'assessment_answers',
      'user_certifications',
      'badges',
      'user_badges',
      'employee_allowances',
      'employee_compensation',
      'employee_deductions',
      'employee_documents',
      'payroll_items',
      'payroll_runs',
      'performance_reviews',
      'shifts',
      'user_shifts',
      'notifications',
      'daily_attendance_summary',
      'monthly_statistics',
      'late_arrivals'
    ];
    
    console.log(`\n📋 Processing ${tablesToUpdate.length} tables...\n`);
    
    // 4. Update all existing records with the default company_id
    let totalUpdated = 0;
    let skipped = 0;
    
    for (const table of tablesToUpdate) {
      try {
        // Check if table has company_id column
        const columnCheck = await client.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = $1 
              AND column_name = 'company_id'
          )`,
          [table]
        );
        
        if (!columnCheck.rows[0].exists) {
          console.log(`⏭️  Skipped ${table} (no company_id column)`);
          skipped++;
          continue;
        }
        
        // Update records
        const result = await client.query(
          `UPDATE ${table} SET company_id = $1 WHERE company_id IS NULL`,
          [defaultCompanyId]
        );
        
        console.log(`✅ Updated ${result.rowCount.toString().padStart(4)} records in ${table}`);
        totalUpdated += result.rowCount;
        
      } catch (error) {
        console.log(`❌ Failed ${table}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Summary: Updated ${totalUpdated} total records, skipped ${skipped} tables`);
    
    // 5. Create default company settings
    const settingsExists = await client.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'company_settings'
      )`
    );
    
    if (settingsExists.rows[0].exists) {
      await client.query(
        `INSERT INTO company_settings (company_id)
         VALUES ($1)
         ON CONFLICT (company_id) DO NOTHING`,
        [defaultCompanyId]
      );
      console.log('\n✅ Created default company settings');
    }
    
    await client.query('COMMIT');
    
    console.log('\n' + '='.repeat(80));
    console.log('✨ Multi-tenancy migration completed successfully!');
    console.log('='.repeat(80));
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Update company details:`);
    console.log(`      UPDATE companies SET company_name='Your Company', email='admin@yourcompany.com' WHERE id=${defaultCompanyId};`);
    console.log(`   2. Add tenant middleware to all routes`);
    console.log(`   3. Update all SQL queries to filter by company_id`);
    console.log(`   4. Test tenant isolation\n`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error);
    console.error(error.stack);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateToMultiTenant();