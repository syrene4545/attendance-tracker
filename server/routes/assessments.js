import express from 'express';
import { pool } from '../index.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';
import { extractTenant, verifyTenantAccess } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// ✅ Apply authentication and tenant extraction to ALL routes
router.use(protect);           // 1️⃣ Authenticate user
router.use(extractTenant);     // 2️⃣ Extract tenant context
router.use(verifyTenantAccess); // 3️⃣ Verify tenant access

// ✅ Helper: Check if user is manager/admin/HR
const requireManagerRole = (req, res, next) => {
  if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  next();
};

// ========================================
// ADMIN ROUTES (MUST BE BEFORE /:id)
// ========================================

// Get all assessments (Admin only - with question count)
router.get('/admin/all', requireManagerRole, async (req, res) => {
  try {
    const companyId = req.companyId;

    const assessmentsResult = await pool.query(
      `SELECT 
        a.id, 
        a.assessment_key, 
        a.title, 
        a.description, 
        a.passing_score as "passingScore",
        a.time_limit_minutes as "timeLimitMinutes", 
        a.total_points as "totalPoints",
        a.mandatory, 
        a.difficulty,
        a.active,
        a.created_at as "createdAt",
        COUNT(q.question_id) as "questionCount"
       FROM assessments a
       LEFT JOIN assessment_questions q ON a.id = q.assessment_id
       WHERE a.company_id = $1
       GROUP BY a.id
       ORDER BY a.created_at DESC`,
      [companyId]
    );

    res.json({ 
      assessments: assessmentsResult.rows.map(row => ({
        ...row,
        questionCount: parseInt(row.questionCount)
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching all assessments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assessment questions (Admin only)
router.get('/admin/:id/questions', requireManagerRole, async (req, res) => {
  try {
    const companyId = req.companyId;
    const { id } = req.params;

    // Verify assessment belongs to company
    const assessmentCheck = await pool.query(
      'SELECT id FROM assessments WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (assessmentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const questionsResult = await pool.query(
      `SELECT 
        question_id as id,
        question_type as "questionType",
        question_text as "questionText",
        options,
        correct_answer as "correctAnswer",
        points,
        category,
        explanation,
        question_order as "questionOrder"
       FROM assessment_questions
       WHERE assessment_id = $1
       ORDER BY question_order ASC`,
      [id]
    );

    res.json({ questions: questionsResult.rows });
  } catch (error) {
    console.error('❌ Error fetching questions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new assessment (Admin only)
router.post('/admin/create', requireManagerRole, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const companyId = req.companyId;

    const { 
      title, 
      description, 
      passingScore, 
      timeLimitMinutes, 
      difficulty,
      mandatory,
      active,
      questions 
    } = req.body;

    console.log('📝 Create assessment request:', { title, questionsCount: questions?.length });

    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: 'At least one question is required' });
    }

    await client.query('BEGIN');

    // Calculate total points
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    // Generate assessment_key from title
    const assessmentKey = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 100);

    const uniqueassessmentKey = `${assessmentKey}-${companyId}-${Date.now()}`;

    console.log('📋 Generated assessment_key:', uniqueassessmentKey);

    // Create assessment

    const assessmentResult = await client.query(
      `INSERT INTO assessments (
        company_id, assessment_key, title, description, passing_score, 
        time_limit_minutes, total_points, difficulty, mandatory, active, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id`,
      [
        companyId,
        uniqueassessmentKey,
        title,
        description || null,
        passingScore,
        timeLimitMinutes || 10, // ✅ Default to 10 minutes
        totalPoints,
        difficulty,
        mandatory || false,
        active !== undefined ? active : true,
        req.user.id
      ]
    );
    
    const assessmentId = assessmentResult.rows[0].id;

    // Create questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const questionId = `q-${assessmentId}-${i + 1}`;
      
      let optionsJson = null;
      let correctAnswerJson;

      if (question.questionType === 'multiple-choice' || question.questionType === 'scenario') {
        optionsJson = JSON.stringify(question.options || []);
        correctAnswerJson = JSON.stringify(question.correctAnswer);
      } else if (question.questionType === 'true-false') {
        optionsJson = null;
        correctAnswerJson = JSON.stringify(question.correctAnswer);
      }

      await client.query(
        `INSERT INTO assessment_questions (
          assessment_id, question_id, question_type, question_text, options,
          correct_answer, points, category, explanation, question_order
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          assessmentId,
          questionId,
          question.questionType,
          question.questionText,
          optionsJson,
          correctAnswerJson,
          question.points,
          question.category || null,
          question.explanation || null,
          question.questionOrder
        ]
      );
    }

    await client.query('COMMIT');

    console.log('✅ Assessment created:', title, 'for company:', companyId);

    res.status(201).json({
      message: 'Assessment created successfully',
      assessmentId
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating assessment:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// Update assessment (Admin only)
router.put('/admin/:id', requireManagerRole, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const companyId = req.companyId;
    const { id } = req.params;

    const { 
      title, 
      description, 
      passingScore, 
      timeLimitMinutes, 
      difficulty,
      mandatory,
      active,
      questions 
    } = req.body;

    console.log('📝 Update assessment request:', { id, title, questionsCount: questions?.length });

    // Verify assessment belongs to company
    const assessmentCheck = await client.query(
      'SELECT id, title, assessment_key FROM assessments WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (assessmentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: 'At least one question is required' });
    }

    await client.query('BEGIN');

    // Calculate total points
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    // Update assessment
    await client.query(
      `UPDATE assessments 
       SET title = $1, description = $2, passing_score = $3, time_limit_minutes = $4,
           total_points = $5, difficulty = $6, mandatory = $7, active = $8,
           updated_at = NOW()
       WHERE id = $9 AND company_id = $10`,
      [
        title,
        description || null,
        passingScore,
        timeLimitMinutes,
        totalPoints,
        difficulty,
        mandatory || false,
        active !== undefined ? active : true,
        id,
        companyId
      ]
    );

    // Delete old questions
    await client.query(
      'DELETE FROM assessment_questions WHERE assessment_id = $1',
      [id]
    );

    // Create new questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const questionId = `q-${id}-${i + 1}`;
      
      let optionsJson = null;
      let correctAnswerJson;

      if (question.questionType === 'multiple-choice' || question.questionType === 'scenario') {
        optionsJson = JSON.stringify(question.options || []);
        correctAnswerJson = JSON.stringify(question.correctAnswer);
      } else if (question.questionType === 'true-false') {
        optionsJson = null;
        correctAnswerJson = JSON.stringify(question.correctAnswer);
      }

      await client.query(
        `INSERT INTO assessment_questions (
          assessment_id, question_id, question_type, question_text, options,
          correct_answer, points, category, explanation, question_order
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          id,
          questionId,
          question.questionType,
          question.questionText,
          optionsJson,
          correctAnswerJson,
          question.points,
          question.category || null,
          question.explanation || null,
          question.questionOrder
        ]
      );
    }

    await client.query('COMMIT');

    console.log('✅ Assessment updated:', title);

    res.json({ message: 'Assessment updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error updating assessment:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// Delete assessment (Admin only)
router.delete('/admin/:id', requireManagerRole, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const companyId = req.companyId;
    const { id } = req.params;

    // Verify assessment belongs to company
    const assessmentCheck = await client.query(
      'SELECT id, title FROM assessments WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (assessmentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const assessment = assessmentCheck.rows[0];

    await client.query('BEGIN');

    // Delete in order (due to foreign key constraints)
    await client.query(
      `DELETE FROM assessment_answers 
       WHERE attempt_id IN (
         SELECT id FROM assessment_attempts WHERE assessment_id = $1
       )`,
      [id]
    );

    await client.query(
      'DELETE FROM user_badges WHERE assessment_id = $1',
      [id]
    );

    await client.query(
      'DELETE FROM user_certifications WHERE assessment_id = $1',
      [id]
    );

    await client.query(
      'DELETE FROM assessment_attempts WHERE assessment_id = $1',
      [id]
    );

    await client.query(
      'DELETE FROM assessment_questions WHERE assessment_id = $1',
      [id]
    );

    await client.query(
      'DELETE FROM assessments WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    await client.query('COMMIT');

    console.log('✅ Assessment deleted:', assessment.title);

    res.json({ message: 'Assessment deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error deleting assessment:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Toggle active status (Admin only)
router.patch('/admin/:id/active', requireManagerRole, async (req, res) => {
  try {
    const companyId = req.companyId;
    const { id } = req.params;
    const { active } = req.body;

    const result = await pool.query(
      `UPDATE assessments 
       SET active = $1, updated_at = NOW()
       WHERE id = $2 AND company_id = $3
       RETURNING id, title, active`,
      [active, id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    console.log(`✅ Assessment "${result.rows[0].title}" active status: ${active}`);

    res.json({
      message: `Assessment ${active ? 'activated' : 'deactivated'}`,
      assessment: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error updating active status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================================
// SPECIFIC ROUTES (BEFORE /:id)
// ========================================

// Get user's certifications
router.get('/certifications/me', async (req, res) => {
  try {
    const companyId = req.companyId;

    const certificationsResult = await pool.query(
      `SELECT c.*, a.title
       FROM user_certifications c
       JOIN assessments a ON c.assessment_id = a.id
       WHERE c.user_id = $1 AND c.valid = true AND a.company_id = $2
       ORDER BY c.certified_at DESC`,
      [req.user.id, companyId]
    );

    const certifications = certificationsResult.rows.map(row => ({
      id: row.id,
      assessmentKey: row.assessment_key,
      score: parseFloat(row.score),
      certifiedAt: row.certified_at,
      expiresAt: row.expires_at,
      certificateNumber: row.certificate_number,
      certificateUrl: row.certificate_url,
      assessmentTitle: row.title
    }));

    res.json(certifications);
  } catch (error) {
    console.error('❌ Error fetching certifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's badges
router.get('/badges/me', async (req, res) => {
  try {
    const companyId = req.companyId;

    const badgesResult = await pool.query(
      `SELECT ub.*, b.name, b.description, b.icon, b.badge_type, b.rarity, b.points
       FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = $1 AND b.company_id = $2
       ORDER BY ub.earned_at DESC`,
      [req.user.id, companyId]
    );

    const userBadges = badgesResult.rows.map(row => ({
      id: row.id,
      earnedAt: row.earned_at,
      badge: {
        id: row.badge_id,
        name: row.name,
        description: row.description,
        icon: row.icon,
        type: row.badge_type,
        rarity: row.rarity,
        points: row.points
      }
    }));

    res.json(userBadges);
  } catch (error) {
    console.error('❌ Error fetching badges:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard - ALL SOPs
router.get('/leaderboard', async (req, res) => {
  try {
    const companyId = req.companyId;

    const query = `
      SELECT 
        aa.user_id,
        u.name,
        MAX(aa.score) as best_score,
        COUNT(*) as total_attempts,
        AVG(aa.score) as average_score,
        MIN(aa.time_taken) as fastest_time
      FROM assessment_attempts aa
      JOIN users u ON aa.user_id = u.id
      JOIN assessments a ON aa.assessment_id = a.id
      WHERE aa.status = 'completed' 
        AND aa.passed = true
        AND u.company_id = $1
        AND a.company_id = $1
      GROUP BY aa.user_id, u.name
      ORDER BY best_score DESC, fastest_time ASC
      LIMIT 10
    `;

    const leaderboardResult = await pool.query(query, [companyId]);

    const leaderboard = leaderboardResult.rows.map(row => ({
      userId: row.user_id,
      name: row.name,
      bestScore: parseFloat(row.best_score),
      totalAttempts: parseInt(row.total_attempts),
      averageScore: Math.round(parseFloat(row.average_score) * 10) / 10,
      fastestTime: row.fastest_time
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('❌ Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard - SPECIFIC SOP
router.get('/leaderboard/:assessmentKey', async (req, res) => {
  try {
    const companyId = req.companyId;
    const { assessmentKey } = req.params;

    const query = `
      SELECT 
        aa.user_id,
        u.name,
        MAX(aa.score) as best_score,
        COUNT(*) as total_attempts,
        AVG(aa.score) as average_score,
        MIN(aa.time_taken) as fastest_time
      FROM assessment_attempts aa
      JOIN users u ON aa.user_id = u.id
      JOIN assessments a ON aa.assessment_id = a.id
      WHERE aa.assessment_key = $1 
        AND aa.status = 'completed' 
        AND aa.passed = true
        AND u.company_id = $2
        AND a.company_id = $2
      GROUP BY aa.user_id, u.name
      ORDER BY best_score DESC, fastest_time ASC
      LIMIT 10
    `;

    const leaderboardResult = await pool.query(query, [assessmentKey, companyId]);

    const leaderboard = leaderboardResult.rows.map(row => ({
      userId: row.user_id,
      name: row.name,
      bestScore: parseFloat(row.best_score),
      totalAttempts: parseInt(row.total_attempts),
      averageScore: Math.round(parseFloat(row.average_score) * 10) / 10,
      fastestTime: row.fastest_time
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('❌ Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get attempt details (for review)
router.get('/attempts/:attemptId', async (req, res) => {
  try {
    const companyId = req.companyId;

    const attemptResult = await pool.query(
      `SELECT at.*, a.title, a.assessment_key, a.passing_score
       FROM assessment_attempts at
       JOIN assessments a ON at.assessment_id = a.id
       WHERE at.id = $1 AND a.company_id = $2`,
      [req.params.attemptId, companyId]
    );

    if (attemptResult.rows.length === 0) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    const attempt = attemptResult.rows[0];

    if (attempt.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const answersResult = await pool.query(
      `SELECT aa.*, q.question_text, q.question_type, q.options, q.explanation, q.category
       FROM assessment_answers aa
       JOIN assessment_questions q ON aa.question_id = q.question_id 
         AND q.assessment_id = $1
       WHERE aa.attempt_id = $2
       ORDER BY q.question_order ASC`,
      [attempt.assessment_id, attempt.id]
    );

    const detailedAnswers = answersResult.rows.map(answer => ({
      questionId: answer.question_id,
      userAnswer: answer.user_answer,
      correctAnswer: answer.correct_answer,
      correct: answer.correct,
      pointsEarned: answer.points_earned,
      pointsPossible: answer.points_possible,
      question: {
        text: answer.question_text,
        type: answer.question_type,
        options: answer.options,
        explanation: answer.explanation,
        category: answer.category
      }
    }));

    res.json({
      id: attempt.id,
      score: parseFloat(attempt.score),
      passed: attempt.passed,
      pointsEarned: attempt.points_earned,
      totalPoints: attempt.total_points,
      timeTaken: attempt.time_taken,
      startedAt: attempt.started_at,
      completedAt: attempt.completed_at,
      attemptNumber: attempt.attempt_number,
      answers: detailedAnswers,
      assessment: {
        title: attempt.title,
        assessmentKey: attempt.assessment_key,
        passingScore: attempt.passing_score
      }
    });
  } catch (error) {
    console.error('❌ Error fetching attempt details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's attempts for a specific SOP
router.get('/sop/:assessmentKey/attempts', async (req, res) => {
  try {
    const companyId = req.companyId;

    const attemptsResult = await pool.query(
      `SELECT aa.id, aa.score, aa.passed, aa.points_earned, aa.total_points, aa.time_taken,
              aa.started_at, aa.completed_at, aa.attempt_number
       FROM assessment_attempts aa
       JOIN assessments a ON aa.assessment_id = a.id
       WHERE aa.user_id = $1 
         AND aa.assessment_key = $2 
         AND aa.status = 'completed'
         AND a.company_id = $3
       ORDER BY aa.completed_at DESC`,
      [req.user.id, req.params.assessmentKey, companyId]
    );

    const attempts = attemptsResult.rows.map(row => ({
      id: row.id,
      score: parseFloat(row.score),
      passed: row.passed,
      pointsEarned: row.points_earned,
      totalPoints: row.total_points,
      timeTaken: row.time_taken,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      attemptNumber: row.attempt_number
    }));

    res.json(attempts);
  } catch (error) {
    console.error('❌ Error fetching attempts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================================
// GENERAL LIST ROUTE
// ========================================

// Get all assessments
router.get('/', async (req, res) => {
  try {
    const companyId = req.companyId;

    const assessmentsResult = await pool.query(
      `SELECT a.id, a.assessment_key, a.title, a.description, a.passing_score, 
              a.time_limit_minutes, a.total_points, a.mandatory, a.difficulty
       FROM assessments a
       WHERE a.active = true AND a.company_id = $1
       ORDER BY a.created_at DESC`,
      [companyId]
    );

    const attemptsResult = await pool.query(
      `SELECT aa.assessment_id, aa.score, aa.passed, aa.completed_at, aa.attempt_number
       FROM assessment_attempts aa
       JOIN assessments a ON aa.assessment_id = a.id
       WHERE aa.user_id = $1 
         AND aa.status = 'completed'
         AND a.company_id = $2
       ORDER BY aa.completed_at DESC`,
      [req.user.id, companyId]
    );

    const assessmentsWithProgress = assessmentsResult.rows.map(assessment => {
      const userAttempts = attemptsResult.rows.filter(
        a => a.assessment_id === assessment.id
      );

      const bestAttempt = userAttempts.reduce((best, current) => {
        return (!best || parseFloat(current.score) > parseFloat(best.score)) ? current : best;
      }, null);

      const lastAttempt = userAttempts.length > 0 ? userAttempts[0] : null;

      return {
        id: assessment.id,
        assessmentKey: assessment.assessment_key,
        title: assessment.title,
        description: assessment.description,
        passingScore: assessment.passing_score,
        timeLimitMinutes: assessment.time_limit_minutes,
        totalPoints: assessment.total_points,
        mandatory: assessment.mandatory,
        difficulty: assessment.difficulty,
        userProgress: {
          attempts: userAttempts.length,
          bestScore: bestAttempt ? parseFloat(bestAttempt.score) : null,
          passed: bestAttempt ? bestAttempt.passed : false,
          lastAttempt: lastAttempt ? {
            score: parseFloat(lastAttempt.score),
            date: lastAttempt.completed_at,
            passed: lastAttempt.passed
          } : null
        }
      };
    });

    res.json(assessmentsWithProgress);
  } catch (error) {
    console.error('❌ Error fetching assessments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================================
// PARAMETERIZED ROUTES (MUST BE LAST)
// ========================================

// Get specific assessment (with questions for taking the test)

// Get specific assessment by ID or assessment_key
router.get('/:identifier', async (req, res) => {
  try {
    const companyId = req.companyId;
    const identifier = req.params.identifier;

    // Determine if identifier is numeric ID or string key
    const isNumericId = !isNaN(Number(identifier));

    let assessmentResult;

    if (isNumericId) {
      // Fetch by numeric ID
      assessmentResult = await pool.query(
        `SELECT id, assessment_key, title, description, passing_score, time_limit_minutes, 
                total_points, mandatory, difficulty
         FROM assessments
         WHERE id = $1 AND active = true AND company_id = $2`,
        [Number(identifier), companyId]
      );
    } else {
      // Fetch by assessment_key
      assessmentResult = await pool.query(
        `SELECT id, assessment_key, title, description, passing_score, time_limit_minutes, 
                total_points, mandatory, difficulty
         FROM assessments
         WHERE assessment_key = $1 AND active = true AND company_id = $2`,
        [identifier, companyId]
      );
    }

    if (assessmentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const assessment = assessmentResult.rows[0];

    // Fetch questions
    const questionsResult = await pool.query(
      `SELECT question_id, question_type, question_text, options, points, category
       FROM assessment_questions
       WHERE assessment_id = $1
       ORDER BY question_order ASC`,
      [assessment.id]  // Always use numeric ID for questions
    );

    const sanitizedAssessment = {
      id: assessment.id,
      assessmentKey: assessment.assessment_key,
      title: assessment.title,
      description: assessment.description,
      passingScore: assessment.passing_score,
      timeLimitMinutes: assessment.time_limit_minutes || 10,
      // timeLimitMinutes: assessment.time_limit_minutes,
      totalPoints: assessment.total_points,
      mandatory: assessment.mandatory,
      difficulty: assessment.difficulty,
      questions: questionsResult.rows.map(q => ({
        id: q.question_id,
        type: q.question_type,
        question: q.question_text,
        options: q.options,
        points: q.points,
        category: q.category
      }))
    };

    res.json(sanitizedAssessment);
  } catch (error) {
    console.error('❌ Error fetching assessment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start an assessment attempt
router.post('/:identifier/start', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const companyId = req.companyId;
    const { identifier } = req.params;
    
    // Determine if identifier is numeric ID or string key
    const isNumericId = !isNaN(Number(identifier));

    let assessmentResult;

    if (isNumericId) {
      assessmentResult = await client.query(
        `SELECT id, assessment_key, total_points, company_id
         FROM assessments 
         WHERE id = $1 AND active = true AND company_id = $2`,
        [Number(identifier), companyId]
      );
    } else {
      assessmentResult = await client.query(
        `SELECT id, assessment_key, total_points, company_id
         FROM assessments 
         WHERE assessment_key = $1 AND active = true AND company_id = $2`,
        [identifier, companyId]
      );
    }

    if (assessmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const assessment = assessmentResult.rows[0];

    // ✅ REFINEMENT: Add ordering + limit for safety
    const existingAttempt = await client.query(
      `SELECT id, started_at 
       FROM assessment_attempts
       WHERE user_id = $1 AND assessment_id = $2 AND status = 'in-progress'
       ORDER BY started_at DESC
       LIMIT 1`,
      [req.user.id, assessment.id]
    );

    if (existingAttempt.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ 
        message: 'You already have an in-progress attempt for this assessment',
        attemptId: existingAttempt.rows[0].id,
        startedAt: existingAttempt.rows[0].started_at
      });
    }

    // Get max attempt number
    const attemptCountResult = await client.query(
      `SELECT COALESCE(MAX(attempt_number), 0) as max_attempt
       FROM assessment_attempts
       WHERE user_id = $1 AND assessment_id = $2`,
      [req.user.id, assessment.id]
    );

    const nextAttemptNumber = parseInt(attemptCountResult.rows[0].max_attempt) + 1;

    // Create new attempt
    const attemptResult = await client.query(
      `INSERT INTO assessment_attempts 
       (user_id, assessment_id, assessment_key, company_id, started_at, attempt_number, total_points, status)
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, 'in-progress')
       RETURNING id, started_at, attempt_number`,
      [
        req.user.id, 
        assessment.id, 
        assessment.assessment_key, 
        companyId, 
        nextAttemptNumber, 
        assessment.total_points
      ]
    );

    await client.query('COMMIT');

    const attempt = attemptResult.rows[0];

    console.log(`✅ Assessment attempt started: User ${req.user.id}, Assessment ${assessment.id}, Attempt #${attempt.attempt_number}`);

    res.json({
      attemptId: attempt.id,
      attemptNumber: attempt.attempt_number,
      startedAt: attempt.started_at
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error starting assessment:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
});

// Submit assessment attempt
router.post('/:attemptId/submit', async (req, res) => {
  const { answers } = req.body;
  const { attemptId } = req.params;
  
  // ✅ CRITICAL GUARD: Validate attemptId before processing
  if (!attemptId || attemptId === 'null' || attemptId === 'undefined') {
    return res.status(400).json({ 
      message: 'Invalid assessment attempt ID. Please start the assessment first.' 
    });
  }

  // Validate answers exist
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ 
      message: 'No answers provided' 
    });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const companyId = req.companyId;

    // Fetch attempt with tenant verification
    const attemptResult = await client.query(
      `SELECT at.id, at.user_id, at.assessment_id, at.assessment_key, at.started_at, 
              at.attempt_number, at.status, a.company_id
       FROM assessment_attempts at
       JOIN assessments a ON at.assessment_id = a.id
       WHERE at.id = $1 AND a.company_id = $2`,
      [attemptId, companyId]
    );

    if (attemptResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Attempt not found' });
    }

    const attempt = attemptResult.rows[0];

    // Verify ownership
    if (attempt.user_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Prevent double submission
    if (attempt.status === 'completed') {
      await client.query('ROLLBACK');
      return res.status(409).json({ 
        message: 'This assessment has already been submitted' 
      });
    }

    // Fetch assessment details and questions
    const assessmentResult = await client.query(
      `SELECT a.id, a.assessment_key, a.total_points, a.passing_score,
              q.question_id, q.correct_answer, q.points
       FROM assessments a
       JOIN assessment_questions q ON a.id = q.assessment_id
       WHERE a.id = $1`,
      [attempt.assessment_id]
    );

    if (assessmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const assessment = {
      id: assessmentResult.rows[0].id,
      assessment_key: assessmentResult.rows[0].assessment_key,
      total_points: assessmentResult.rows[0].total_points,
      passing_score: assessmentResult.rows[0].passing_score,
      questions: assessmentResult.rows.map(row => ({
        id: row.question_id,
        correctAnswer: row.correct_answer,
        points: row.points
      }))
    };

    let pointsEarned = 0;

    // Grade each answer
    for (const userAnswer of answers) {
      const question = assessment.questions.find(q => q.id === userAnswer.questionId);
      
      if (!question) {
        console.warn(`⚠️ Question ${userAnswer.questionId} not found`);
        continue;
      }

      let correct = false;
      const correctAnswer = question.correctAnswer;
      
      // Handle different answer types
      if (Array.isArray(correctAnswer)) {
        const userAns = Array.isArray(userAnswer.userAnswer) 
          ? userAnswer.userAnswer.sort() 
          : [userAnswer.userAnswer].sort();
        const correctAns = correctAnswer.sort();
        correct = JSON.stringify(userAns) === JSON.stringify(correctAns);
      } else {
        correct = userAnswer.userAnswer === correctAnswer;
      }

      const pointsForQuestion = correct ? question.points : 0;
      pointsEarned += pointsForQuestion;

      // Save individual answer
      await client.query(
        `INSERT INTO assessment_answers 
         (attempt_id, question_id, user_answer, correct_answer, correct, points_earned, points_possible)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          attempt.id,
          question.id,
          JSON.stringify(userAnswer.userAnswer),
          JSON.stringify(correctAnswer),
          correct,
          pointsForQuestion,
          question.points
        ]
      );
    }

    // Calculate final score
    const score = (pointsEarned / assessment.total_points) * 100;
    const passed = score >= assessment.passing_score;

    // Calculate time taken
    const startedAt = new Date(attempt.started_at);
    const timeTaken = Math.floor((new Date() - startedAt) / 1000);

    // Update attempt record
    await client.query(
      `UPDATE assessment_attempts
       SET score = $1, points_earned = $2, passed = $3, time_taken = $4,
           completed_at = NOW(), status = 'completed', updated_at = NOW()
       WHERE id = $5`,
      [Math.round(score * 10) / 10, pointsEarned, passed, timeTaken, attempt.id]
    );

    // Handle certifications if passed
    if (passed) {
      const existingCertResult = await client.query(
        `SELECT id, score FROM user_certifications
         WHERE user_id = $1 AND assessment_key = $2`,
        [req.user.id, assessment.assessment_key]
      );

      if (existingCertResult.rows.length > 0) {
        const existingCert = existingCertResult.rows[0];
        if (score > parseFloat(existingCert.score)) {
          await client.query(
            `UPDATE user_certifications
             SET score = $1, attempt_id = $2, certified_at = NOW(), updated_at = NOW()
             WHERE id = $3`,
            [score, attempt.id, existingCert.id]
          );
          console.log(`✅ Updated certification for user ${req.user.id}: ${score}%`);
        }
      } else {

        await client.query(
          `INSERT INTO user_certifications
          (user_id, assessment_key, assessment_id, attempt_id, score, company_id, source_type)
          VALUES ($1, $2, $3, $4, $5, $6, 'ASSESSMENT')`,
          [req.user.id, assessment.assessment_key, assessment.id, attempt.id, score, companyId]
        );
        console.log(`✅ New certification for user ${req.user.id}: ${score}%`);
      }

      // Award badges
      await checkAndAwardBadges(client, req.user.id, companyId, {
        id: attempt.id,
        score: Math.round(score * 10) / 10,
        attemptNumber: attempt.attempt_number,
        timeTaken,
        passed
      }, assessment);
    }

    await client.query('COMMIT');

    console.log(`✅ Assessment submitted: User ${req.user.id}, Score ${score}%, Passed: ${passed}`);

    res.json({
      score: Math.round(score * 10) / 10,
      passed,
      pointsEarned,
      totalPoints: assessment.total_points,
      timeTaken,
      attemptId: attempt.id
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error submitting assessment:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  } finally {
    client.release();
  }
});

// Toggle mandatory status for an assessment (Admin/Manager only)
router.patch('/:id/mandatory', requireManagerRole, async (req, res) => {
  try {
    const companyId = req.companyId;
    const { mandatory } = req.body;
    const assessmentId = req.params.id;

    const result = await pool.query(
      `UPDATE assessments 
       SET mandatory = $1, updated_at = NOW()
       WHERE id = $2 AND company_id = $3
       RETURNING id, title, mandatory`,
      [mandatory, assessmentId, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    console.log(`✅ Assessment "${result.rows[0].title}" mandatory status set to: ${mandatory}`);

    res.json({
      message: `Assessment ${mandatory ? 'marked as mandatory' : 'unmarked as mandatory'}`,
      assessment: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error updating mandatory status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to check and award badges
async function checkAndAwardBadges(client, userId, companyId, attempt, assessment) {
  try {
    console.log('🏅 Checking badges for user:', userId, 'company:', companyId);

    const badgesResult = await client.query(
      'SELECT * FROM badges WHERE company_id = $1',
      [companyId]
    );
    const badges = badgesResult.rows;
    
    console.log('🏅 Total badges available:', badges.length);

    for (const badge of badges) {
      let shouldAward = false;
      const criteriaValue = badge.criteria_value || {};
      
      console.log(`\n🔍 Checking badge: ${badge.name} (${badge.criteria_type})`);

      switch (badge.criteria_type) {
        case 'perfect-score':
          shouldAward = attempt.score === 100;
          break;
        
        case 'first-attempt':
          shouldAward = attempt.attemptNumber === 1 && attempt.passed;
          break;
        
        case 'all-sops':
          const certCountResult = await client.query(
            'SELECT COUNT(*) as count FROM user_certifications WHERE user_id = $1 AND company_id = $2',
            [userId, companyId]
          );
          const certCount = parseInt(certCountResult.rows[0].count);
          shouldAward = certCount >= (criteriaValue.value || 8);
          break;
        
        case 'speed-demon':
          shouldAward = attempt.timeTaken < (criteriaValue.value || 300);
          break;

        case 'persistent':
          // ✅ FIXED: Only award if user failed 2+ times before passing
          const passAttemptResult = await client.query(
            `SELECT MIN(attempt_number) as first_pass_attempt
            FROM assessment_attempts
            WHERE user_id = $1 
              AND assessment_id = $2 
              AND passed = true`,
            [userId, assessment.id]
          );
          
          const firstPassAttempt = passAttemptResult.rows[0]?.first_pass_attempt;
          
          // Award only if they passed on attempt 3 or later
          shouldAward = firstPassAttempt >= 3 && attempt.passed;
          break;

        case 'high-first-score':
          shouldAward = attempt.attemptNumber === 1 && attempt.score >= (criteriaValue.value || 90);
          break;

        default:
          console.log(`   ⚠️  Unknown criteria type: ${badge.criteria_type}`);
      }

      if (shouldAward) {
        console.log(`   ✅ Badge should be awarded!`);
        
        const existingBadgeResult = await client.query(
          'SELECT id FROM user_badges WHERE user_id = $1 AND badge_id = $2',
          [userId, badge.id]
        );

        if (existingBadgeResult.rows.length === 0) {
          console.log(`   🎉 Awarding badge: ${badge.name}`);
          await client.query(
            `INSERT INTO user_badges (user_id, badge_id, assessment_id, attempt_id, company_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, badge.id, assessment.id, attempt.id, companyId]
          );
        } else {
          console.log(`   ℹ️  User already has this badge`);
        }
      }
    }
    
    console.log('🏅 Badge checking complete\n');
  } catch (error) {
    console.error('❌ Error awarding badges:', error);
  }
}

export default router;