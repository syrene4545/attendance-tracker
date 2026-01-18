import { pool } from '../index.js';

// ✅ HELPER: Safe JSON conversion for JSONB columns
function toJson(value, fallback = null) {
  if (value === undefined || value === null) return fallback;
  return JSON.stringify(value);
}

// ✅ CRITICAL: Define templates BEFORE the function to avoid const hoisting issues
export const DEFAULT_ASSESSMENT_TEMPLATES = [
  {
    key: 'sales-sop',
    title: 'Sales SOP Assessment',
    description: 'Test your knowledge of sales procedures, customer service, and till operations',
    passing_score: 80,
    mandatory: true,
    difficulty: 'intermediate',
    questions: [
      {
        question_id: 'sales-q1',
        question_type: 'multiple-choice',
        question_text: 'What is the correct greeting to use when a customer enters the store?',
        options: [
          'Hey, what do you want?',
          'Good morning/afternoon! Welcome to the company. How can I help you today?',
          'Hi',
          'Can I help you?'
        ],
        correct_answer: 'Good morning/afternoon! Welcome to the company. How can I help you today?',
        explanation: 'A proper greeting should be warm, professional, include the time of day, company name, and offer assistance.',
        points: 1,
        category: 'Customer Service',
        question_order: 1
      },
      {
        question_id: 'sales-q2',
        question_type: 'multiple-choice',
        question_text: 'When should you greet a customer after they enter the store?',
        options: [
          'Within 10 seconds',
          'Within 1 minute',
          'When they come to the counter',
          'Only if they ask for help'
        ],
        correct_answer: 'Within 10 seconds',
        explanation: 'Research shows customers feel ignored after 10 seconds. Always acknowledge customers immediately.',
        points: 1,
        category: 'Customer Service',
        question_order: 2
      },
      {
        question_id: 'sales-q3',
        question_type: 'multiple-choice',
        question_text: 'What is the maximum time a customer should wait on hold when calling?',
        options: [
          '30 seconds',
          '1 minute',
          '2 minutes',
          '5 minutes'
        ],
        correct_answer: '2 minutes',
        explanation: 'Maximum hold time is 2 minutes. Check back every 30-45 seconds and offer to call back if it will take longer.',
        points: 1,
        category: 'Telephone Etiquette',
        question_order: 3
      },
      {
        question_id: 'sales-q4',
        question_type: 'multiple-choice',
        question_text: 'When handling a customer complaint, what should you do FIRST?',
        options: [
          'Offer a refund immediately',
          'Defend yourself and explain why it\'s not your fault',
          'Listen actively and empathetically without interrupting',
          'Get the manager'
        ],
        correct_answer: 'Listen actively and empathetically without interrupting',
        explanation: 'The LEARN method starts with Listen. Let the customer fully express their concern before responding.',
        points: 1,
        category: 'Complaint Handling',
        question_order: 4
      },
      {
        question_id: 'sales-q5',
        question_type: 'multiple-choice',
        question_text: 'What does FIFO stand for in stock rotation?',
        options: [
          'First Item First Out',
          'First In, First Out',
          'Final Inventory First Operation',
          'Find It Fast Operation'
        ],
        correct_answer: 'First In, First Out',
        explanation: 'FIFO means First In, First Out - always sell the oldest stock first to minimize expiry.',
        points: 1,
        category: 'Stock Management',
        question_order: 5
      }
    ],
    badges: [
      {
        key: 'sales-perfect',
        name: 'Sales Expert',
        description: 'Achieved 100% on Sales SOP Assessment',
        icon: '🏆',
        badge_type: 'achievement',
        criteria_type: 'perfect-score',
        criteria_value: { assessment_key: 'sales-sop' },
        rarity: 'epic',
        points: 50
      }
    ]
  },
  {
    key: 'cash-handling',
    title: 'Cash Handling & Financial SOP Assessment',
    description: 'Test your knowledge of cash handling procedures, fraud prevention, and financial controls',
    passing_score: 80,
    mandatory: true,
    difficulty: 'intermediate',
    questions: [
      {
        question_id: 'cash-q1',
        question_type: 'multiple-choice',
        question_text: 'What is the standard till float amount?',
        options: ['R1,000', 'R1,500', 'R2,000', 'R2,500'],
        correct_answer: 'R2,000',
        explanation: 'The standard till float is R2,000, consisting of specific denominations for making change.',
        points: 1,
        category: 'Till Operations',
        question_order: 1
      },
      {
        question_id: 'cash-q2',
        question_type: 'multiple-choice',
        question_text: 'When should you perform a cash drop?',
        options: [
          'Only at the end of the day',
          'When till exceeds R5,000, every 2 hours during busy periods, or before breaks',
          'Never - keep all cash in the till',
          'Only when the manager tells you'
        ],
        correct_answer: 'When till exceeds R5,000, every 2 hours during busy periods, or before breaks',
        explanation: 'Regular cash drops minimize loss risk. Drop when till exceeds R5,000, every 2 hours when busy, or before breaks.',
        points: 1,
        category: 'Cash Management',
        question_order: 2
      },
      {
        question_id: 'cash-q3',
        question_type: 'multiple-choice',
        question_text: 'What is the acceptable till variance at closing?',
        options: ['R0 - must be exact', '±R5', '±R50', '±R100'],
        correct_answer: '±R5',
        explanation: 'Acceptable variance is ±R5. Larger variances require investigation and may result in disciplinary action.',
        points: 1,
        category: 'Till Operations',
        question_order: 3
      }
    ],
    badges: [
      {
        key: 'cash-perfect',
        name: 'Cash Handler Pro',
        description: 'Achieved 100% on Cash Handling Assessment',
        icon: '💰',
        badge_type: 'achievement',
        criteria_type: 'perfect-score',
        criteria_value: { assessment_key: 'cash-handling' },
        rarity: 'epic',
        points: 50
      }
    ]
  }
];

// ✅ Global badges (not tied to specific assessments)
export const GLOBAL_BADGES = [
  {
    key: 'first-time-charm',
    name: 'First Time\'s the Charm',
    description: 'Passed on your first attempt',
    icon: '🎯',
    badge_type: 'achievement',
    criteria_type: 'first-attempt',
    criteria_value: {},
    rarity: 'rare',
    points: 30
  },
  {
    key: 'sop-master',
    name: 'SOP Master',
    description: 'Certified in all SOPs',
    icon: '🌟',
    badge_type: 'milestone',
    criteria_type: 'all-sops',
    criteria_value: { value: 2 }, // Update based on number of assessments
    rarity: 'legendary',
    points: 100
  },
  {
    key: 'speed-master',
    name: 'Speed Master',
    description: 'Completed assessment in under 5 minutes',
    icon: '⚡',
    badge_type: 'achievement',
    criteria_type: 'speed-demon',
    criteria_value: { value: 300 },
    rarity: 'rare',
    points: 25
  },
  {
    key: 'persistent-learner',
    name: 'Persistent Learner',
    description: 'Passed after 3 or more attempts',
    icon: '💪',
    badge_type: 'achievement',
    criteria_type: 'persistent',
    criteria_value: { value: 3 },
    rarity: 'common',
    points: 20
  },
  {
    key: 'quick-learner',
    name: 'Quick Learner',
    description: 'Achieved 90%+ on first attempt',
    icon: '🚀',
    badge_type: 'achievement',
    criteria_type: 'high-first-score',
    criteria_value: { value: 90 },
    rarity: 'rare',
    points: 40
  }
];

export async function seedCompanyAssessments({ 
  companyId, 
  adminId, 
  dryRun = false,
  customTemplates = null 
}) {
  const templates = customTemplates || DEFAULT_ASSESSMENT_TEMPLATES;

  // ✅ DRY RUN MODE
  if (dryRun) {
    return {
      dryRun: true,
      message: 'Dry run completed - no changes made',
      wouldCreate: {
        assessments: templates.map(t => ({
          key: t.key,
          title: t.title,
          questions: t.questions.length,
          badges: t.badges?.length || 0
        })),
        globalBadges: GLOBAL_BADGES.map(b => ({
          key: b.key,
          name: b.name,
          rarity: b.rarity
        }))
      },
      totalTemplates: templates.length,
      totalGlobalBadges: GLOBAL_BADGES.length,
      usingCustomTemplates: customTemplates !== null
    };
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱 Assessment seeding started', {
      companyId,
      adminId,
      templateCount: templates.length,
      customTemplates: customTemplates !== null,
      timestamp: new Date().toISOString()
    });

    let createdAssessments = 0;
    let skippedAssessments = 0;
    let createdQuestions = 0;
    let createdBadges = 0;
    let skippedBadges = 0;
    
    const createdList = [];
    const skippedList = [];

    // ✅ Seed Assessments & Questions
    for (const template of templates) {
      // Check if assessment already exists
      const existing = await client.query(
        `SELECT id FROM assessments
         WHERE company_id = $1 AND assessment_key = $2`,
        [companyId, template.key]
      );

      if (existing.rows.length > 0) {
        console.log(`⏭️  Skipping existing assessment: ${template.title}`);
        skippedAssessments++;
        skippedList.push(template.title);
        continue;
      }

      // Calculate total points
      const totalPoints = template.questions.reduce((sum, q) => sum + (q.points || 1), 0);

      // Create assessment
      const assessmentResult = await client.query(
        `INSERT INTO assessments (
          company_id,
          assessment_key,
          title,
          description,
          passing_score,
          mandatory,
          difficulty,
          total_points,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, title`,
        [
          companyId,
          template.key,
          template.title,
          template.description,
          template.passing_score,
          template.mandatory,
          template.difficulty,
          totalPoints,
          adminId
        ]
      );

      const assessmentId = assessmentResult.rows[0].id;
      console.log(`✅ Created assessment: ${template.title}`);
      createdAssessments++;
      createdList.push(template.title);

      // ✅ FIXED: Insert questions with proper JSONB conversion
      for (const question of template.questions) {
        await client.query(
          `INSERT INTO assessment_questions (
            company_id,
            assessment_id,
            question_id,
            question_type,
            question_text,
            options,
            correct_answer,
            explanation,
            points,
            category,
            question_order
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            companyId,
            assessmentId,
            question.question_id,
            question.question_type,
            question.question_text,
            toJson(question.options, []),                    // ✅ FIXED: Proper JSONB
            toJson([question.correct_answer], []),           // ✅ FIXED: Array for future multi-answer support
            question.explanation,
            question.points || 1,
            question.category,
            question.question_order
          ]
        );
        createdQuestions++;
      }

      console.log(`  📝 Created ${template.questions.length} questions`);

      // ✅ FIXED: Insert assessment-specific badges with proper JSONB
      if (template.badges && template.badges.length > 0) {
        for (const badge of template.badges) {
          const badgeExists = await client.query(
            `SELECT id FROM badges 
             WHERE company_id = $1 
               AND badge_key = $2`,
            [companyId, badge.key]
          );

          if (badgeExists.rows.length === 0) {
            await client.query(
              `INSERT INTO badges (
                company_id,
                badge_key,
                name,
                description,
                icon,
                badge_type,
                criteria_type,
                criteria_value,
                rarity,
                points
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
              [
                companyId,
                badge.key,
                badge.name,
                badge.description,
                badge.icon,
                badge.badge_type,
                badge.criteria_type,
                toJson(badge.criteria_value, {}),  // ✅ FIXED: Consistent JSONB conversion
                badge.rarity,
                badge.points
              ]
            );
            createdBadges++;
            console.log(`  ${badge.icon} Created badge: ${badge.name}`);
          } else {
            skippedBadges++;
            console.log(`  ⏭️  Skipping existing badge: ${badge.name}`);
          }
        }
      }  
    }

    // ✅ FIXED: Seed Global Badges with consistent JSONB conversion
    for (const badge of GLOBAL_BADGES) {
      const badgeExists = await client.query(
        `SELECT id FROM badges 
         WHERE company_id = $1 
           AND badge_key = $2`,
        [companyId, badge.key]
      );

      if (badgeExists.rows.length === 0) {
        await client.query(
          `INSERT INTO badges (
            company_id,
            badge_key,
            name,
            description,
            icon,
            badge_type,
            criteria_type,
            criteria_value,
            rarity,
            points
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            companyId,
            badge.key,
            badge.name,
            badge.description,
            badge.icon,
            badge.badge_type,
            badge.criteria_type,
            toJson(badge.criteria_value, {}),  // ✅ FIXED: Consistent JSONB conversion
            badge.rarity,
            badge.points
          ]
        );
        createdBadges++;
        console.log(`${badge.icon} Created global badge: ${badge.name}`);
      } else {
        skippedBadges++;
        console.log(`⏭️  Skipping existing badge: ${badge.name}`);
      }
    }

    await client.query('COMMIT');

    console.log('✅ Assessment seeding completed', {
      companyId,
      createdAssessments,
      skippedAssessments,
      createdQuestions,
      createdBadges,
      skippedBadges,
      timestamp: new Date().toISOString()
    });

    return {
      createdAssessments,
      skippedAssessments,
      createdQuestions,
      createdBadges,
      skippedBadges,
      totalTemplates: templates.length,
      createdList,
      skippedList,
      usingCustomTemplates: customTemplates !== null
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Assessment seeding failed', {
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