import dotenv from 'dotenv';
import pkg from 'pg';

// import { pool } from '../index.js';
import { pool } from '../config/database.js';


const { Pool } = pkg;



dotenv.config();

// Create pool connection
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
// });

const assessmentData = [
  {
    sop_id: 'sales-sop',
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
          'Good morning/afternoon! Welcome to Lera Health. How can I help you today?',
          'Hi',
          'Can I help you?'
        ],
        correct_answer: 'Good morning/afternoon! Welcome to Lera Health. How can I help you today?',
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
      },
      {
        question_id: 'sales-q6',
        question_type: 'multiple-choice',
        question_text: 'How should you position new stock when replenishing shelves?',
        options: [
          'Put new stock at the front for customers to see',
          'Put new stock at the back and move old stock to the front',
          'Mix new and old stock together',
          'It doesn\'t matter'
        ],
        correct_answer: 'Put new stock at the back and move old stock to the front',
        explanation: 'Always place new stock behind existing stock and pull old stock forward to ensure FIFO rotation.',
        points: 1,
        category: 'Stock Management',
        question_order: 6
      },
      {
        question_id: 'sales-q7',
        question_type: 'multiple-choice',
        question_text: 'What should you do if a customer\'s card is declined?',
        options: [
          'Announce loudly "Your card was declined!"',
          'Take the card and cut it up',
          'Stay calm, discreet, and suggest they try again or use an alternative payment method',
          'Call security immediately'
        ],
        correct_answer: 'Stay calm, discreet, and suggest they try again or use an alternative payment method',
        explanation: 'Handle declined cards with discretion and professionalism to avoid embarrassing the customer.',
        points: 1,
        category: 'Payment Processing',
        question_order: 7
      },
      {
        question_id: 'sales-q8',
        question_type: 'multiple-choice',
        question_text: 'Which of these is NOT an acceptable reason for a refund?',
        options: [
          'Product is defective',
          'Wrong item was given (our error)',
          'Customer changed their mind',
          'Product was expired when sold'
        ],
        correct_answer: 'Customer changed their mind',
        explanation: 'Change of mind is not a valid refund reason. We offer exchange in this case, not refund.',
        points: 1,
        category: 'Refunds & Returns',
        question_order: 8
      },
      {
        question_id: 'sales-q9',
        question_type: 'true-false',
        question_text: 'You should always smile when greeting customers, even on difficult days.',
        options: ['True', 'False'],
        correct_answer: 'True',
        explanation: 'A genuine smile is essential for creating a welcoming atmosphere. Customers should never bear the burden of your bad day.',
        points: 1,
        category: 'Customer Service',
        question_order: 9
      },
      {
        question_id: 'sales-q10',
        question_type: 'true-false',
        question_text: 'It is acceptable to continue a personal conversation with a colleague while a customer is waiting.',
        options: ['True', 'False'],
        correct_answer: 'False',
        explanation: 'Customers always take priority over personal conversations. This makes them feel ignored and undervalued.',
        points: 1,
        category: 'Customer Service',
        question_order: 10
      },
      {
        question_id: 'sales-q11',
        question_type: 'true-false',
        question_text: 'You must use the customer\'s name when you know it (from loyalty card or prescription).',
        options: ['True', 'False'],
        correct_answer: 'True',
        explanation: 'Using a customer\'s name creates personal connection and makes them feel valued.',
        points: 1,
        category: 'Customer Service',
        question_order: 11
      },
      {
        question_id: 'sales-q12',
        question_type: 'true-false',
        question_text: 'When answering the phone, you should say "Lera Health, how can I help?" without giving your name.',
        options: ['True', 'False'],
        correct_answer: 'False',
        explanation: 'Standard greeting includes: time of day, company name, YOUR NAME, and offer to help.',
        points: 1,
        category: 'Telephone Etiquette',
        question_order: 12
      },
      {
        question_id: 'sales-q13',
        question_type: 'true-false',
        question_text: 'All refunds require manager approval regardless of the amount.',
        options: ['True', 'False'],
        correct_answer: 'True',
        explanation: 'Manager approval is required for ALL refunds to prevent fraud and ensure policy compliance.',
        points: 1,
        category: 'Refunds & Returns',
        question_order: 13
      },
      {
        question_id: 'sales-q14',
        question_type: 'true-false',
        question_text: 'You can give a refund on a sale item if the customer has a receipt.',
        options: ['True', 'False'],
        correct_answer: 'False',
        explanation: 'Sale items are NOT refundable. This should be communicated at point of sale.',
        points: 1,
        category: 'Refunds & Returns',
        question_order: 14
      },
      {
        question_id: 'sales-q15',
        question_type: 'scenario',
        question_text: 'A customer is angry because they waited 20 minutes for their prescription. They are shouting and using profanity. What should you do?',
        options: [
          'Shout back to assert authority',
          'Ignore them and help the next customer',
          'Stay calm, apologize sincerely, explain the delay briefly, and offer to expedite their prescription',
          'Call security immediately'
        ],
        correct_answer: 'Stay calm, apologize sincerely, explain the delay briefly, and offer to expedite their prescription',
        explanation: 'Use de-escalation techniques: stay calm, empathize, apologize, and focus on resolving the issue.',
        points: 1,
        category: 'Complaint Handling',
        question_order: 15
      },
      {
        question_id: 'sales-q16',
        question_type: 'scenario',
        question_text: 'You are serving a customer when the phone rings. What should you do?',
        options: [
          'Answer the phone immediately and put the current customer on hold',
          'Ignore the phone completely',
          'Ask the customer you\'re serving "May I answer this call?" and handle it briefly, or let it ring and call back after serving the customer',
          'Let the phone ring endlessly'
        ],
        correct_answer: 'Ask the customer you\'re serving "May I answer this call?" and handle it briefly, or let it ring and call back after serving the customer',
        explanation: 'The customer in front of you takes priority. Answer phone only if urgent and with their permission.',
        points: 1,
        category: 'Customer Service',
        question_order: 16
      },
      {
        question_id: 'sales-q17',
        question_type: 'scenario',
        question_text: 'A customer wants to return a product that is opened and partially used. They have no receipt. What do you do?',
        options: [
          'Give them a full refund to avoid confrontation',
          'Politely explain that opened/used items and items without receipts cannot be refunded, but offer to speak with the manager',
          'Refuse immediately and ask them to leave',
          'Exchange it for a different product'
        ],
        correct_answer: 'Politely explain that opened/used items and items without receipts cannot be refunded, but offer to speak with the manager',
        explanation: 'Follow policy but be polite. Escalate to manager for final decision on exceptions.',
        points: 1,
        category: 'Refunds & Returns',
        question_order: 17
      },
      {
        question_id: 'sales-q18',
        question_type: 'scenario',
        question_text: 'You notice a customer putting items in their bag without paying. What should you do?',
        options: [
          'Confront them immediately and accuse them of stealing',
          'Chase them out of the store',
          'Increase your presence near them, offer assistance, and discreetly alert manager/colleague',
          'Do nothing - it\'s not your problem'
        ],
        correct_answer: 'Increase your presence near them, offer assistance, and discreetly alert manager/colleague',
        explanation: 'Never physically confront suspected shoplifters. Use presence and service to deter, and alert management.',
        points: 1,
        category: 'Loss Prevention',
        question_order: 18
      },
      {
        question_id: 'sales-q19',
        question_type: 'scenario',
        question_text: 'A regular customer asks you to give them a discount because they "always shop here." What do you do?',
        options: [
          'Give them the discount to keep them happy',
          'Politely explain that you cannot give unauthorized discounts, but mention the loyalty program benefits',
          'Tell them to speak to the manager',
          'Ignore the request'
        ],
        correct_answer: 'Politely explain that you cannot give unauthorized discounts, but mention the loyalty program benefits',
        explanation: 'Never give unauthorized discounts. Direct them to legitimate ways to save (loyalty program, promotions).',
        points: 1,
        category: 'Customer Service',
        question_order: 19
      },
      {
        question_id: 'sales-q20',
        question_type: 'scenario',
        question_text: 'While checking stock on the shelves, you find 3 items that expire in 2 weeks. What should you do?',
        options: [
          'Leave them - they haven\'t expired yet',
          'Hide them at the back of the shelf',
          'Remove them immediately and report to manager for markdown/return',
          'Take them home for personal use'
        ],
        correct_answer: 'Remove them immediately and report to manager for markdown/return',
        explanation: 'Items expiring within 1 month should be removed and reported for markdown or supplier return.',
        points: 1,
        category: 'Stock Management',
        question_order: 20
      }
    ]
  },
  {
    sop_id: 'cash-handling',
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
      },
      {
        question_id: 'cash-q4',
        question_type: 'multiple-choice',
        question_text: 'When processing a cash sale, where should you place the customer\'s money until you give them change?',
        options: [
          'Immediately put it in the till drawer',
          'In your pocket',
          'On top of the till until change is given',
          'Hand it back to the customer'
        ],
        correct_answer: 'On top of the till until change is given',
        explanation: 'Place cash on top of till until change is given. This prevents "short change" scams where customers claim they gave larger notes.',
        points: 1,
        category: 'Transaction Processing',
        question_order: 4
      },
      {
        question_id: 'cash-q5',
        question_type: 'multiple-choice',
        question_text: 'What is the minimum purchase amount for EFT payments?',
        options: ['R100', 'R500', 'R1,000', 'No minimum - any amount'],
        correct_answer: 'R1,000',
        explanation: 'EFT payments require R1,000+ and manager approval. Customer must transfer before leaving and we must verify receipt.',
        points: 1,
        category: 'Payment Processing',
        question_order: 5
      },
      {
        question_id: 'cash-q6',
        question_type: 'multiple-choice',
        question_text: 'How do you detect a counterfeit R200 note?',
        options: [
          'Just accept it - you can\'t tell',
          'FEEL the texture, LOOK for watermark and security thread, TILT for color-shifting ink, use counterfeit pen',
          'Only use a counterfeit pen',
          'Hold it up to the light'
        ],
        correct_answer: 'FEEL the texture, LOOK for watermark and security thread, TILT for color-shifting ink, use counterfeit pen',
        explanation: 'Use multiple methods: FEEL (rough texture), LOOK (watermark, thread), TILT (color shift), and counterfeit pen.',
        points: 1,
        category: 'Fraud Prevention',
        question_order: 6
      },
      {
        question_id: 'cash-q7',
        question_type: 'multiple-choice',
        question_text: 'If you receive a counterfeit note, what should you do?',
        options: [
          'Immediately accuse the customer of fraud',
          'Accept it to avoid confrontation',
          'Stay calm, hold the note, use counterfeit pen, call manager discreetly',
          'Call the police right away'
        ],
        correct_answer: 'Stay calm, hold the note, use counterfeit pen, call manager discreetly',
        explanation: 'Never accuse customers. Stay calm, verify with pen, and let manager handle the situation professionally.',
        points: 1,
        category: 'Fraud Prevention',
        question_order: 7
      },
      {
        question_id: 'cash-q8',
        question_type: 'multiple-choice',
        question_text: 'Who can approve refunds?',
        options: [
          'Any staff member',
          'Only the pharmacist',
          'Manager - ALL refunds require manager approval',
          'Senior cashiers'
        ],
        correct_answer: 'Manager - ALL refunds require manager approval',
        explanation: 'ALL refunds require manager approval regardless of amount to prevent fraud and ensure policy compliance.',
        points: 1,
        category: 'Refunds',
        question_order: 8
      },
      {
        question_id: 'cash-q9',
        question_type: 'true-false',
        question_text: 'You should count change out loud to the customer when giving it to them.',
        options: ['True', 'False'],
        correct_answer: 'True',
        explanation: 'Counting out loud ensures accuracy and transparency, preventing disputes about incorrect change.',
        points: 1,
        category: 'Transaction Processing',
        question_order: 9
      },
      {
        question_id: 'cash-q10',
        question_type: 'true-false',
        question_text: 'It is acceptable to share your till login with a colleague if you are busy.',
        options: ['True', 'False'],
        correct_answer: 'False',
        explanation: 'NEVER share till access or login. Each person is personally accountable for their till transactions.',
        points: 1,
        category: 'Till Operations',
        question_order: 10
      },
      {
        question_id: 'cash-q11',
        question_type: 'true-false',
        question_text: 'You can leave your till unlocked while you go to the bathroom.',
        options: ['True', 'False'],
        correct_answer: 'False',
        explanation: 'ALWAYS lock till and log out when stepping away, even briefly. Never leave cash accessible.',
        points: 1,
        category: 'Security',
        question_order: 11
      },
      {
        question_id: 'cash-q12',
        question_type: 'true-false',
        question_text: 'When performing a mid-shift count, you should count all the cash in your till.',
        options: ['True', 'False'],
        correct_answer: 'True',
        explanation: 'Mid-shift count (around 13:00) is a quick count of all cash to catch errors early while there\'s time to fix them.',
        points: 1,
        category: 'Cash Management',
        question_order: 12
      },
      {
        question_id: 'cash-q13',
        question_type: 'true-false',
        question_text: 'Split payments should always be processed with card payment first, then cash for the balance.',
        options: ['True', 'False'],
        correct_answer: 'True',
        explanation: 'Always process card first, then cash for remaining balance. This prevents card payment failures after cash is given.',
        points: 1,
        category: 'Payment Processing',
        question_order: 13
      },
      {
        question_id: 'cash-q14',
        question_type: 'true-false',
        question_text: 'If your till is short R20 at closing, you should add R20 of your own money to balance it.',
        options: ['True', 'False'],
        correct_answer: 'False',
        explanation: 'NEVER add your own money. Report the variance honestly. The actual count becomes the closing balance.',
        points: 1,
        category: 'Till Operations',
        question_order: 14
      },
      {
        question_id: 'cash-q15',
        question_type: 'scenario',
        question_text: 'A customer gives you R100 for a R47 purchase. As you\'re getting change, they say "Actually, I have R50, can you give me back R100 and I\'ll give you R50?" What should you do?',
        options: [
          'Make the exchange to be helpful',
          'Stop, put all money on counter, start the transaction fresh from the beginning',
          'Just give them what they want to avoid confusion',
          'Tell them you can\'t help them'
        ],
        correct_answer: 'Stop, put all money on counter, start the transaction fresh from the beginning',
        explanation: 'This is a "quick change artist" scam. Always stop and start fresh when customers change payment mid-transaction.',
        points: 1,
        category: 'Fraud Prevention',
        question_order: 15
      },
      {
        question_id: 'cash-q16',
        question_type: 'scenario',
        question_text: 'Your till shows R5,800 at 11:00 AM on a busy Saturday. What should you do?',
        options: [
          'Nothing - wait until closing',
          'Perform a cash drop immediately because till exceeds R5,000',
          'Take some cash out and put it in your pocket',
          'Ask customers to pay by card only'
        ],
        correct_answer: 'Perform a cash drop immediately because till exceeds R5,000',
        explanation: 'Cash drops are required when till exceeds R5,000 to minimize theft risk and ensure manageable cash levels.',
        points: 1,
        category: 'Cash Management',
        question_order: 16
      },
      {
        question_id: 'cash-q17',
        question_type: 'scenario',
        question_text: 'At closing, your till is short R75. What should you do?',
        options: [
          'Add R75 of your own money',
          'Recount carefully, document the variance, inform manager, accept disciplinary action as per policy',
          'Hide the shortage and hope no one notices',
          'Blame a colleague'
        ],
        correct_answer: 'Recount carefully, document the variance, inform manager, accept disciplinary action as per policy',
        explanation: 'R75 shortage is significant. Recount to confirm, report honestly, complete variance report. This may result in written warning.',
        points: 1,
        category: 'Till Operations',
        question_order: 17
      },
      {
        question_id: 'cash-q18',
        question_type: 'scenario',
        question_text: 'A customer wants a refund for a R350 item. They have the receipt from 2 weeks ago. The item is unopened and in perfect condition. What do you do?',
        options: [
          'Process the refund immediately',
          'Refuse the refund',
          'Call manager for approval, verify receipt is genuine, check item condition, then process if manager approves',
          'Give them store credit instead'
        ],
        correct_answer: 'Call manager for approval, verify receipt is genuine, check item condition, then process if manager approves',
        explanation: 'ALL refunds need manager approval. Verify eligibility (within 30 days, receipt, condition), then get manager approval.',
        points: 1,
        category: 'Refunds',
        question_order: 18
      },
      {
        question_id: 'cash-q19',
        question_type: 'scenario',
        question_text: 'During a card payment, the customer says they don\'t know their PIN. What should you do?',
        options: [
          'Let them try a few times until they remember',
          'Politely suggest they contact their bank or use an alternative payment method',
          'Accept cash instead without asking questions',
          'Process the transaction without PIN'
        ],
        correct_answer: 'Politely suggest they contact their bank or use an alternative payment method',
        explanation: 'Not knowing PIN is a red flag for card fraud. Politely suggest alternatives - don\'t facilitate potentially fraudulent transactions.',
        points: 1,
        category: 'Fraud Prevention',
        question_order: 19
      },
      {
        question_id: 'cash-q20',
        question_type: 'scenario',
        question_text: 'You\'re closing your till and notice you processed a void earlier without manager approval. What should you do?',
        options: [
          'Don\'t mention it - it\'s too late now',
          'Report it honestly to manager during closing reconciliation',
          'Change the records to hide it',
          'Blame the system'
        ],
        correct_answer: 'Report it honestly to manager during closing reconciliation',
        explanation: 'Always report errors honestly. Voids without approval violate policy. Better to report and learn than hide and face serious consequences.',
        points: 1,
        category: 'Compliance',
        question_order: 20
      }
    ]
  }
];

const badgesData = [
  {
    name: 'Perfect Score',
    description: 'Achieved 100% on an assessment',
    icon: '🏆',
    badge_type: 'achievement',
    criteria_type: 'perfect-score',
    criteria_value: JSON.stringify({}),
    rarity: 'epic',
    points: 50
  },
  {
    name: 'First Time\'s the Charm',
    description: 'Passed on your first attempt',
    icon: '🎯',
    badge_type: 'achievement',
    criteria_type: 'first-attempt',
    criteria_value: JSON.stringify({}),
    rarity: 'rare',
    points: 30
  },
  {
    name: 'SOP Master',
    description: 'Certified in all 8 SOPs',
    icon: '🌟',
    badge_type: 'milestone',
    criteria_type: 'all-sops',
    criteria_value: JSON.stringify({ value: 8 }),
    rarity: 'legendary',
    points: 100
  },
  {
    name: 'Speed Demon',
    description: 'Completed assessment in under 5 minutes',
    icon: '⚡',
    badge_type: 'achievement',
    criteria_type: 'speed-demon',
    criteria_value: JSON.stringify({ value: 300 }),
    rarity: 'rare',
    points: 25
  },
  {
    name: 'Persistent Learner',
    description: 'Passed after 3 or more attempts',
    icon: '💪',
    badge_type: 'achievement',
    criteria_type: 'persistent',
    criteria_value: JSON.stringify({ value: 3 }),
    rarity: 'common',
    points: 20
  },
  {
    name: 'Quick Learner',
    description: 'Achieved 90%+ on first attempt',
    icon: '🚀',
    badge_type: 'achievement',
    criteria_type: 'high-first-score',
    criteria_value: JSON.stringify({ value: 90 }),
    rarity: 'rare',
    points: 40
  }
];

async function seedAssessments() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    console.log('🗑️  Clearing existing data...');
    await client.query('DELETE FROM user_badges');
    await client.query('DELETE FROM user_certifications');
    await client.query('DELETE FROM assessment_answers');
    await client.query('DELETE FROM assessment_attempts');
    await client.query('DELETE FROM assessment_questions');
    await client.query('DELETE FROM assessments');
    await client.query('DELETE FROM badges');

    console.log('📚 Seeding assessments and questions...');

    for (const assessment of assessmentData) {
      // Insert assessment
      const assessmentResult = await client.query(
        `INSERT INTO assessments (sop_id, title, description, passing_score, mandatory, difficulty, total_points)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          assessment.sop_id,
          assessment.title,
          assessment.description,
          assessment.passing_score,
          assessment.mandatory,
          assessment.difficulty,
          assessment.questions.length // total_points equals number of questions
        ]
      );

      const assessmentId = assessmentResult.rows[0].id;

      // Insert questions
      for (const question of assessment.questions) {
        await client.query(
          `INSERT INTO assessment_questions 
           (assessment_id, question_id, question_type, question_text, options, correct_answer, explanation, points, category, question_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            assessmentId,
            question.question_id,
            question.question_type,
            question.question_text,
            JSON.stringify(question.options),
            JSON.stringify(question.correct_answer),
            question.explanation,
            question.points,
            question.category,
            question.question_order
          ]
        );
      }

      console.log(`✅ Inserted ${assessment.title} with ${assessment.questions.length} questions`);
    }

    console.log('\n🏅 Seeding badges...');

    for (const badge of badgesData) {
      await client.query(
        `INSERT INTO badges (name, description, icon, badge_type, criteria_type, criteria_value, rarity, points)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          badge.name,
          badge.description,
          badge.icon,
          badge.badge_type,
          badge.criteria_type,
          badge.criteria_value,
          badge.rarity,
          badge.points
        ]
      );
      console.log(`  ${badge.icon} ${badge.name} (${badge.rarity}) - ${badge.points} points`);
    }

    await client.query('COMMIT');

    console.log('\n✨ Seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Assessments: ${assessmentData.length}`);
    console.log(`  - Total Questions: ${assessmentData.reduce((sum, a) => sum + a.questions.length, 0)}`);
    console.log(`  - Badges: ${badgesData.length}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding assessments:', error);
    throw error;
  } finally {
    client.release();
    // await pool.end();
  }
}

// Run the seed function
seedAssessments()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });