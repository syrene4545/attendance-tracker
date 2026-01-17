import { pool } from '../index.js';

export async function seedCompanySOPs({ companyId, adminId, dryRun = false }) {
  // ✅ DRY RUN MODE: Preview without making changes
  if (dryRun) {
    return {
      dryRun: true,
      message: 'Dry run completed - no changes made',
      wouldCreate: SOP_TEMPLATES.map(t => ({
        title: t.title,
        category: t.category,
        status: t.status,
        version: t.templateVersion
      })),
      totalTemplates: SOP_TEMPLATES.length
    };
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱 SOP seeding started', {
      companyId,
      adminId,
      templateCount: SOP_TEMPLATES.length,
      timestamp: new Date().toISOString()
    });

    let created = 0;
    let skipped = 0;
    const createdSOPs = [];
    const skippedSOPs = [];

    for (const sop of SOP_TEMPLATES) {
      // ✅ REFINED: Check if SOP already exists for this company
      const existing = await client.query(
        `SELECT id, title FROM sops
         WHERE company_id = $1 
           AND LOWER(title) = LOWER($2)`,
        [companyId, sop.title]
      );

      if (existing.rows.length > 0) {
        console.log(`⏭️  Skipping existing SOP: ${sop.title}`);
        skipped++;
        skippedSOPs.push(sop.title);
        continue;
      }

      // ✅ REFINED: Create new SOP with template versioning
      const result = await client.query(
        `INSERT INTO sops (
          company_id,
          title,
          category,
          description,
          content,
          version,
          status,
          effective_date,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, $8)
        RETURNING id, title, status`,
        [
          companyId,
          sop.title,
          sop.category,
          sop.description,
          sop.content,
          sop.templateVersion, // ✅ Using explicit template version
          sop.status,
          adminId
        ]
      );

      console.log(`✅ Created SOP: ${result.rows[0].title} (${result.rows[0].status}) v${sop.templateVersion}`);
      created++;
      createdSOPs.push(result.rows[0].title);

      // ✅ REFINED: Auto-create acknowledgment records for active SOPs
      // Fixed to use employee_profiles table correctly
      if (result.rows[0].status === 'active') {
        const ackResult = await client.query(
          `INSERT INTO sop_acknowledgments (company_id, sop_id, user_id, acknowledged_at)
           SELECT $1, $2, u.id, NULL
           FROM users u
           WHERE u.company_id = $1
             AND u.employment_status = 'active'
           ON CONFLICT (company_id, sop_id, user_id) DO NOTHING
           RETURNING id`,
          [companyId, result.rows[0].id]
        );
        
        console.log(`📝 Created ${ackResult.rowCount} acknowledgment records for: ${result.rows[0].title}`);
      }
    }

    await client.query('COMMIT');

    console.log('✅ SOP seeding completed', {
      companyId,
      created,
      skipped,
      totalTemplates: SOP_TEMPLATES.length,
      timestamp: new Date().toISOString()
    });

    return {
      created,
      skipped,
      totalTemplates: SOP_TEMPLATES.length,
      createdSOPs,
      skippedSOPs
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ SOP seeding failed', {
      companyId,
      adminId,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    throw error;
  } finally {
    client.release();
  }
}

// ✅ REFINED: Template definitions with explicit versioning
const SOP_TEMPLATES = [
  {
    key: 'attendance_policy',
    templateVersion: '1.0',
    title: 'Attendance Policy',
    category: 'policy',
    description: 'Company attendance and time-keeping policies',
    content: `
      <h1>Attendance Policy</h1>
      <h2>Standard Working Hours</h2>
      <p>Standard working hours are 08:00 to 17:00, Monday to Friday.</p>
      
      <h2>Clock In/Out Requirements</h2>
      <ul>
        <li>Employees must clock in upon arrival</li>
        <li>Clock out when leaving for the day</li>
        <li>Use the system for all time tracking</li>
      </ul>
      
      <h2>Late Arrivals</h2>
      <p>Notify your supervisor if you will be late. Repeated lateness may result in disciplinary action.</p>
      
      <h2>Absences</h2>
      <p>Unexcused absences may result in disciplinary action. Always notify your manager as soon as possible.</p>
    `,
    status: 'active'
  },
  {
    key: 'leave_request_procedure',
    templateVersion: '1.0',
    title: 'Leave Request Procedure',
    category: 'procedure',
    description: 'How to request and manage leave',
    content: `
      <h1>Leave Request Procedure</h1>
      <h2>Requesting Leave</h2>
      <ol>
        <li>Submit leave request through the system at least 2 weeks in advance</li>
        <li>Specify leave type (annual, sick, etc.)</li>
        <li>Provide reason for leave</li>
        <li>Await approval from your manager</li>
      </ol>
      
      <h2>Leave Types</h2>
      <ul>
        <li><strong>Annual Leave:</strong> 21 days per year</li>
        <li><strong>Sick Leave:</strong> 30 days per 3-year cycle</li>
        <li><strong>Family Responsibility:</strong> 3 days per year</li>
        <li><strong>Maternity/Paternity Leave:</strong> As per company policy</li>
      </ul>
      
      <h2>Emergency Leave</h2>
      <p>In case of emergency, notify HR immediately and submit the request as soon as possible.</p>
      
      <h2>Approval Process</h2>
      <p>Requests are reviewed by your direct manager and HR. You will receive notification once your request is processed.</p>
    `,
    status: 'active'
  },
  {
    key: 'code_of_conduct',
    templateVersion: '1.0',
    title: 'Code of Conduct',
    category: 'policy',
    description: 'Expected workplace behaviour and ethics',
    content: `
      <h1>Code of Conduct</h1>
      <h2>Professional Behaviour</h2>
      <p>All employees are expected to maintain professional conduct at all times.</p>
      
      <h2>Respect and Dignity</h2>
      <ul>
        <li>Treat colleagues with respect and dignity</li>
        <li>Zero tolerance for harassment or discrimination</li>
        <li>Foster an inclusive workplace environment</li>
        <li>Report any violations to HR immediately</li>
      </ul>
      
      <h2>Confidentiality</h2>
      <p>Maintain strict confidentiality of company and customer information. Do not discuss sensitive information outside of work.</p>
      
      <h2>Conflict of Interest</h2>
      <p>Disclose any potential conflicts of interest to management immediately.</p>
      
      <h2>Ethical Standards</h2>
      <p>Conduct all business with integrity and honesty. Follow all applicable laws and regulations.</p>
    `,
    status: 'active'
  },
  {
    key: 'data_security_policy',
    templateVersion: '1.0',
    title: 'Data Security Policy',
    category: 'policy',
    description: 'Guidelines for protecting company and customer data',
    content: `
      <h1>Data Security Policy</h1>
      <h2>Password Requirements</h2>
      <ul>
        <li>Use strong, unique passwords (minimum 8 characters)</li>
        <li>Never share passwords with anyone</li>
        <li>Change passwords every 90 days</li>
        <li>Use password managers when appropriate</li>
      </ul>
      
      <h2>Data Access</h2>
      <p>Access only the data necessary for your role. Do not access or share data beyond your authorization level.</p>
      
      <h2>Device Security</h2>
      <ul>
        <li>Lock your computer when away from your desk</li>
        <li>Do not leave sensitive documents unattended</li>
        <li>Report lost or stolen devices immediately</li>
        <li>Keep software and antivirus up to date</li>
      </ul>
      
      <h2>Email Security</h2>
      <p>Be cautious of phishing attempts. Verify sender identity before clicking links or downloading attachments.</p>
      
      <h2>Incident Reporting</h2>
      <p>Report any security incidents or suspicious activity to IT immediately.</p>
    `,
    status: 'active'
  },
  {
    key: 'performance_review_process',
    templateVersion: '1.0',
    title: 'Performance Review Process',
    category: 'procedure',
    description: 'Annual performance evaluation procedure',
    content: `
      <h1>Performance Review Process</h1>
      <h2>Review Schedule</h2>
      <p>Performance reviews are conducted annually in the first quarter of each year.</p>
      
      <h2>Review Components</h2>
      <ul>
        <li>Self-assessment completion</li>
        <li>Manager evaluation</li>
        <li>Goal setting for the upcoming year</li>
        <li>Development plan discussion</li>
        <li>Compensation review (if applicable)</li>
      </ul>
      
      <h2>Preparation</h2>
      <p>Employees should prepare examples of achievements, challenges overcome, and areas for professional development.</p>
      
      <h2>Goal Setting</h2>
      <p>Work with your manager to set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound).</p>
      
      <h2>Continuous Feedback</h2>
      <p>Performance discussions should happen throughout the year, not just during the annual review.</p>
    `,
    status: 'active'
  },
  {
    key: 'health_safety_policy',
    templateVersion: '1.0',
    title: 'Health and Safety Policy',
    category: 'policy',
    description: 'Workplace health and safety guidelines',
    content: `
      <h1>Health and Safety Policy</h1>
      <h2>General Workplace Safety</h2>
      <p>The company is committed to providing a safe and healthy work environment for all employees.</p>
      
      <h2>Emergency Procedures</h2>
      <ul>
        <li>Know the location of emergency exits</li>
        <li>Familiarize yourself with evacuation routes</li>
        <li>Participate in emergency drills</li>
        <li>Report hazards immediately</li>
      </ul>
      
      <h2>Accident Reporting</h2>
      <p>Report all accidents, injuries, or near-misses to your supervisor and HR immediately.</p>
      
      <h2>Ergonomics</h2>
      <p>Ensure your workstation is set up ergonomically to prevent strain and injury.</p>
      
      <h2>First Aid</h2>
      <p>First aid kits are located throughout the facility. Trained first aid responders are available during business hours.</p>
    `,
    status: 'draft'
  }
];