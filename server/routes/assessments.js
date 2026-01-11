import express from 'express';
import { pool } from '../index.js';
import { authenticateToken } from '../middleware/permissionMiddleware.js';
import { verifyTenantAccess } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// ✅ Apply authentication and tenant verification to all routes
router.use(authenticateToken);
router.use(verifyTenantAccess);

// ========================================
// SPECIFIC ROUTES FIRST (before /:id)
// ========================================

// Get user's certifications
router.get('/certifications/me', async (req, res) => {
  try {
    const companyId = req.companyId;

    // ✅ Filter by company
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
      sopId: row.sop_id,
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

    // ✅ Filter by company
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

    // ✅ Filter by company
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
router.get('/leaderboard/:sopId', async (req, res) => {
  try {
    const companyId = req.companyId;
    const { sopId } = req.params;

    // ✅ Filter by company
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
      WHERE aa.sop_id = $1 
        AND aa.status = 'completed' 
        AND aa.passed = true
        AND u.company_id = $2
        AND a.company_id = $2
      GROUP BY aa.user_id, u.name
      ORDER BY best_score DESC, fastest_time ASC
      LIMIT 10
    `;

    const leaderboardResult = await pool.query(query, [sopId, companyId]);

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

    // ✅ Filter by company
    const attemptResult = await pool.query(
      `SELECT at.*, a.title, a.sop_id, a.passing_score
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
        sopId: attempt.sop_id,
        passingScore: attempt.passing_score
      }
    });
  } catch (error) {
    console.error('❌ Error fetching attempt details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's attempts for a specific SOP
router.get('/sop/:sopId/attempts', async (req, res) => {
  try {
    const companyId = req.companyId;

    // ✅ Filter by company
    const attemptsResult = await pool.query(
      `SELECT aa.id, aa.score, aa.passed, aa.points_earned, aa.total_points, aa.time_taken,
              aa.started_at, aa.completed_at, aa.attempt_number
       FROM assessment_attempts aa
       JOIN assessments a ON aa.assessment_id = a.id
       WHERE aa.user_id = $1 
         AND aa.sop_id = $2 
         AND aa.status = 'completed'
         AND a.company_id = $3
       ORDER BY aa.completed_at DESC`,
      [req.user.id, req.params.sopId, companyId]
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

    // ✅ Filter by company
    const assessmentsResult = await pool.query(
      `SELECT a.id, a.sop_id, a.title, a.description, a.passing_score, 
              a.time_limit, a.total_points, a.mandatory, a.difficulty
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
        sopId: assessment.sop_id,
        title: assessment.title,
        description: assessment.description,
        passingScore: assessment.passing_score,
        timeLimit: assessment.time_limit,
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
// PARAMETERIZED ROUTES LAST
// ========================================

// Get specific assessment (with questions for taking the test)
router.get('/:id', async (req, res) => {
  try {
    const companyId = req.companyId;

    // ✅ Filter by company
    const assessmentResult = await pool.query(
      `SELECT id, sop_id, title, description, passing_score, time_limit, 
              total_points, mandatory, difficulty
       FROM assessments
       WHERE id = $1 AND active = true AND company_id = $2`,
      [req.params.id, companyId]
    );

    if (assessmentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const assessment = assessmentResult.rows[0];

    const questionsResult = await pool.query(
      `SELECT question_id, question_type, question_text, options, points, category
       FROM assessment_questions
       WHERE assessment_id = $1
       ORDER BY question_order ASC`,
      [req.params.id]
    );

    const sanitizedAssessment = {
      id: assessment.id,
      sopId: assessment.sop_id,
      title: assessment.title,
      description: assessment.description,
      passingScore: assessment.passing_score,
      timeLimit: assessment.time_limit,
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
router.post('/:id/start', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const companyId = req.companyId;

    // ✅ Filter by company
    const assessmentResult = await client.query(
      `SELECT id, sop_id, total_points, company_id
       FROM assessments 
       WHERE id = $1 AND active = true AND company_id = $2`,
      [req.params.id, companyId]
    );

    if (assessmentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const assessment = assessmentResult.rows[0];

    const countResult = await client.query(
      `SELECT COUNT(*) as count
       FROM assessment_attempts
       WHERE user_id = $1 AND assessment_id = $2 AND status = 'completed'`,
      [req.user.id, assessment.id]
    );

    const previousAttempts = parseInt(countResult.rows[0].count);

    // ✅ Insert with company_id
    const attemptResult = await client.query(
      `INSERT INTO assessment_attempts 
       (user_id, assessment_id, sop_id, company_id, started_at, attempt_number, total_points, status)
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, 'in-progress')
       RETURNING id, started_at, attempt_number`,
      [req.user.id, assessment.id, assessment.sop_id, companyId, previousAttempts + 1, assessment.total_points]
    );

    await client.query('COMMIT');

    const attempt = attemptResult.rows[0];

    res.json({
      attemptId: attempt.id,
      attemptNumber: attempt.attempt_number,
      startedAt: attempt.started_at
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error starting assessment:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Submit assessment attempt
router.post('/:attemptId/submit', async (req, res) => {
  const { answers } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const companyId = req.companyId;

    // ✅ Filter by company
    const attemptResult = await client.query(
      `SELECT at.id, at.user_id, at.assessment_id, at.started_at, at.attempt_number, a.company_id
       FROM assessment_attempts at
       JOIN assessments a ON at.assessment_id = a.id
       WHERE at.id = $1 AND a.company_id = $2`,
      [req.params.attemptId, companyId]
    );

    if (attemptResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Attempt not found' });
    }

    const attempt = attemptResult.rows[0];

    if (attempt.user_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const assessmentResult = await client.query(
      `SELECT a.id, a.sop_id, a.total_points, a.passing_score,
              q.question_id, q.correct_answer, q.points
       FROM assessments a
       JOIN assessment_questions q ON a.id = q.assessment_id
       WHERE a.id = $1`,
      [attempt.assessment_id]
    );

    const assessment = {
      id: assessmentResult.rows[0].id,
      sop_id: assessmentResult.rows[0].sop_id,
      total_points: assessmentResult.rows[0].total_points,
      passing_score: assessmentResult.rows[0].passing_score,
      questions: assessmentResult.rows.map(row => ({
        id: row.question_id,
        correctAnswer: row.correct_answer,
        points: row.points
      }))
    };

    let pointsEarned = 0;

    for (const userAnswer of answers) {
      const question = assessment.questions.find(q => q.id === userAnswer.questionId);
      
      if (!question) continue;

      let correct = false;
      const correctAnswer = question.correctAnswer;
      
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

    const score = (pointsEarned / assessment.total_points) * 100;
    const passed = score >= assessment.passing_score;

    const startedAt = new Date(attempt.started_at);
    const timeTaken = Math.floor((new Date() - startedAt) / 1000);

    await client.query(
      `UPDATE assessment_attempts
       SET score = $1, points_earned = $2, passed = $3, time_taken = $4,
           completed_at = NOW(), status = 'completed', updated_at = NOW()
       WHERE id = $5`,
      [Math.round(score * 10) / 10, pointsEarned, passed, timeTaken, attempt.id]
    );

    if (passed) {
      const existingCertResult = await client.query(
        `SELECT id, score FROM user_certifications
         WHERE user_id = $1 AND sop_id = $2`,
        [req.user.id, assessment.sop_id]
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
        }
      } else {
        // ✅ Insert with company_id
        await client.query(
          `INSERT INTO user_certifications
           (user_id, sop_id, assessment_id, attempt_id, score, company_id)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [req.user.id, assessment.sop_id, assessment.id, attempt.id, score, companyId]
        );
      }

      await checkAndAwardBadges(client, req.user.id, companyId, {
        id: attempt.id,
        score: Math.round(score * 10) / 10,
        attemptNumber: attempt.attempt_number,
        timeTaken,
        passed
      }, assessment);
    }

    await client.query('COMMIT');

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
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Toggle mandatory status for an assessment (Admin/Manager only)
router.patch('/:id/mandatory', async (req, res) => {
  try {
    const companyId = req.companyId;

    // Check permissions
    if (!['admin', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Only admins and managers can modify mandatory status' });
    }

    const { mandatory } = req.body;
    const assessmentId = req.params.id;

    // ✅ Filter by company
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

    // ✅ Only get badges for this company
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
          // ✅ Only count certifications for this company
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
          shouldAward = attempt.attemptNumber >= (criteriaValue.value || 3) && attempt.passed;
          break;

        case 'high-first-score':
          shouldAward = attempt.attemptNumber === 1 && attempt.score >= (criteriaValue.value || 90);
          break;

        default:
          console.log(`   ⚠️  Unknown criteria type: ${badge.criteria_type}`);
      }

      if (shouldAward) {
        console.log(`   ✅ Badge should be awarded!`);
        
        // Check if user already has this badge
        const existingBadgeResult = await client.query(
          'SELECT id FROM user_badges WHERE user_id = $1 AND badge_id = $2',
          [userId, badge.id]
        );

        if (existingBadgeResult.rows.length === 0) {
          console.log(`   🎉 Awarding badge: ${badge.name}`);
          // ✅ Insert with company_id
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

// server/routes/assessments.js

// Add these new admin routes BEFORE the existing routes

// ========================================
// ADMIN ROUTES (Create, Update, Delete)
// ========================================

// Get all assessments (Admin only - with question count)
router.get('/admin/all', async (req, res) => {
  try {
    const companyId = req.companyId;

    // Check permissions
    if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const assessmentsResult = await pool.query(
      `SELECT 
        a.id, 
        a.sop_id, 
        a.title, 
        a.description, 
        a.passing_score as "passingScore",
        a.time_limit as "timeLimit", 
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
router.get('/admin/:id/questions', async (req, res) => {
  try {
    const companyId = req.companyId;
    const { id } = req.params;

    // Check permissions
    if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

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
// router.post('/admin/create', async (req, res) => {
//   const client = await pool.connect();
  
//   try {
//     const companyId = req.companyId;

//     // Check permissions
//     if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
//       return res.status(403).json({ message: 'Insufficient permissions' });
//     }

//     const { 
//       title, 
//       description, 
//       passingScore, 
//       timeLimit, 
//       difficulty,
//       mandatory,
//       active,
//       questions 
//     } = req.body;

//     console.log('📝 Create assessment request:', { title, questionsCount: questions?.length });

//     if (!questions || questions.length === 0) {
//       return res.status(400).json({ message: 'At least one question is required' });
//     }

//     await client.query('BEGIN');

//     // Calculate total points
//     const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

//     // Create assessment
//     const assessmentResult = await client.query(
//       `INSERT INTO assessments (
//         company_id, title, description, passing_score, time_limit, 
//         total_points, difficulty, mandatory, active, created_by
//       )
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//       RETURNING id`,
//       [
//         companyId,
//         title,
//         description || null,
//         passingScore,
//         timeLimit,
//         totalPoints,
//         difficulty,
//         mandatory || false,
//         active !== undefined ? active : true,
//         req.user.id
//       ]
//     );

//     const assessmentId = assessmentResult.rows[0].id;

//     // Create questions
//     for (const question of questions) {
//       // ✅ FIX: Properly stringify options (or use null)
//       let optionsJson;
//       if (question.questionType === 'multiple-choice' && Array.isArray(question.options)) {
//         optionsJson = JSON.stringify(question.options);
//       } else {
//         optionsJson = null; // For true/false questions
//       }

//       console.log(`  📋 Creating question: ${question.questionText.substring(0, 50)}...`);
//       console.log(`     Type: ${question.questionType}, Options: ${optionsJson}`);

//       await client.query(
//         `INSERT INTO assessment_questions (
//           assessment_id, question_type, question_text, options,
//           correct_answer, points, category, explanation, question_order
//         )
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
//         [
//           assessmentId,
//           question.questionType,
//           question.questionText,
//           optionsJson, // ✅ Properly formatted JSON or null
//           question.correctAnswer,
//           question.points,
//           question.category || null,
//           question.explanation || null,
//           question.questionOrder
//         ]
//       );
//     }

//     await client.query('COMMIT');

//     console.log('✅ Assessment created:', title, 'for company:', companyId);

//     res.status(201).json({
//       message: 'Assessment created successfully',
//       assessmentId
//     });
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Error creating assessment:', error);
//     res.status(500).json({ 
//       message: 'Server error',
//       error: error.message // ✅ Include error message for debugging
//     });
//   } finally {
//     client.release();
//   }
// });

// router.post('/admin/create', async (req, res) => {
//   const client = await pool.connect();
  
//   try {
//     const companyId = req.companyId;

//     // Check permissions
//     if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
//       return res.status(403).json({ message: 'Insufficient permissions' });
//     }

//     const { 
//       title, 
//       description, 
//       passingScore, 
//       timeLimit, 
//       difficulty,
//       mandatory,
//       active,
//       questions 
//     } = req.body;

//     if (!questions || questions.length === 0) {
//       return res.status(400).json({ message: 'At least one question is required' });
//     }

//     await client.query('BEGIN');

//     // Calculate total points
//     const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

//     // Create assessment
//     const assessmentResult = await client.query(
//       `INSERT INTO assessments (
//         company_id, title, description, passing_score, time_limit, 
//         total_points, difficulty, mandatory, active, created_by
//       )
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//       RETURNING id`,
//       [
//         companyId,
//         title,
//         description || null,
//         passingScore,
//         timeLimit,
//         totalPoints,
//         difficulty,
//         mandatory || false,
//         active !== undefined ? active : true,
//         req.user.id
//       ]
//     );

//     const assessmentId = assessmentResult.rows[0].id;

//     // Create questions
//     for (const question of questions) {
//       await client.query(
//         `INSERT INTO assessment_questions (
//           assessment_id, question_type, question_text, options,
//           correct_answer, points, category, explanation, question_order
//         )
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
//         [
//           assessmentId,
//           question.questionType,
//           question.questionText,
//           JSON.stringify(question.options),
//           question.correctAnswer,
//           question.points,
//           question.category || null,
//           question.explanation || null,
//           question.questionOrder
//         ]
//       );
//     }

//     await client.query('COMMIT');

//     console.log('✅ Assessment created:', title, 'for company:', companyId);

//     res.status(201).json({
//       message: 'Assessment created successfully',
//       assessmentId
//     });
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Error creating assessment:', error);
//     res.status(500).json({ message: 'Server error' });
//   } finally {
//     client.release();
//   }
// });

// Update assessment (Admin only)

// Update assessment (Admin only)
// router.put('/admin/:id', async (req, res) => {
//   const client = await pool.connect();
  
//   try {
//     const companyId = req.companyId;
//     const { id } = req.params;

//     // Check permissions
//     if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
//       return res.status(403).json({ message: 'Insufficient permissions' });
//     }

//     const { 
//       title, 
//       description, 
//       passingScore, 
//       timeLimit, 
//       difficulty,
//       mandatory,
//       active,
//       questions 
//     } = req.body;

//     console.log('📝 Update assessment request:', { id, title, questionsCount: questions?.length });

//     // Verify assessment belongs to company
//     const assessmentCheck = await client.query(
//       'SELECT id FROM assessments WHERE id = $1 AND company_id = $2',
//       [id, companyId]
//     );

//     if (assessmentCheck.rows.length === 0) {
//       return res.status(404).json({ message: 'Assessment not found' });
//     }

//     if (!questions || questions.length === 0) {
//       return res.status(400).json({ message: 'At least one question is required' });
//     }

//     await client.query('BEGIN');

//     // Calculate total points
//     const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

//     // Update assessment
//     await client.query(
//       `UPDATE assessments 
//        SET title = $1, description = $2, passing_score = $3, time_limit = $4,
//            total_points = $5, difficulty = $6, mandatory = $7, active = $8,
//            updated_at = NOW()
//        WHERE id = $9 AND company_id = $10`,
//       [
//         title,
//         description || null,
//         passingScore,
//         timeLimit,
//         totalPoints,
//         difficulty,
//         mandatory || false,
//         active !== undefined ? active : true,
//         id,
//         companyId
//       ]
//     );

//     // Delete old questions
//     await client.query(
//       'DELETE FROM assessment_questions WHERE assessment_id = $1',
//       [id]
//     );

//     // Create new questions
//     for (const question of questions) {
//       // ✅ FIX: Properly stringify options (or use null)
//       let optionsJson;
//       if (question.questionType === 'multiple-choice' && Array.isArray(question.options)) {
//         optionsJson = JSON.stringify(question.options);
//       } else {
//         optionsJson = null; // For true/false questions
//       }

//       console.log(`  📋 Creating question: ${question.questionText.substring(0, 50)}...`);
//       console.log(`     Type: ${question.questionType}, Options: ${optionsJson}`);

//       await client.query(
//         `INSERT INTO assessment_questions (
//           assessment_id, question_type, question_text, options,
//           correct_answer, points, category, explanation, question_order
//         )
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
//         [
//           id,
//           question.questionType,
//           question.questionText,
//           optionsJson, // ✅ Properly formatted JSON or null
//           question.correctAnswer,
//           question.points,
//           question.category || null,
//           question.explanation || null,
//           question.questionOrder
//         ]
//       );
//     }

//     await client.query('COMMIT');

//     console.log('✅ Assessment updated:', title);

//     res.json({ message: 'Assessment updated successfully' });
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Error updating assessment:', error);
//     res.status(500).json({ 
//       message: 'Server error',
//       error: error.message // ✅ Include error message for debugging
//     });
//   } finally {
//     client.release();
//   }
// });

// router.put('/admin/:id', async (req, res) => {
//   const client = await pool.connect();
  
//   try {
//     const companyId = req.companyId;
//     const { id } = req.params;

//     // Check permissions
//     if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
//       return res.status(403).json({ message: 'Insufficient permissions' });
//     }

//     const { 
//       title, 
//       description, 
//       passingScore, 
//       timeLimit, 
//       difficulty,
//       mandatory,
//       active,
//       questions 
//     } = req.body;

//     // Verify assessment belongs to company
//     const assessmentCheck = await client.query(
//       'SELECT id FROM assessments WHERE id = $1 AND company_id = $2',
//       [id, companyId]
//     );

//     if (assessmentCheck.rows.length === 0) {
//       return res.status(404).json({ message: 'Assessment not found' });
//     }

//     if (!questions || questions.length === 0) {
//       return res.status(400).json({ message: 'At least one question is required' });
//     }

//     await client.query('BEGIN');

//     // Calculate total points
//     const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

//     // Update assessment
//     await client.query(
//       `UPDATE assessments 
//        SET title = $1, description = $2, passing_score = $3, time_limit = $4,
//            total_points = $5, difficulty = $6, mandatory = $7, active = $8,
//            updated_at = NOW()
//        WHERE id = $9 AND company_id = $10`,
//       [
//         title,
//         description || null,
//         passingScore,
//         timeLimit,
//         totalPoints,
//         difficulty,
//         mandatory || false,
//         active !== undefined ? active : true,
//         id,
//         companyId
//       ]
//     );

//     // Delete old questions
//     await client.query(
//       'DELETE FROM assessment_questions WHERE assessment_id = $1',
//       [id]
//     );

//     // Create new questions
//     for (const question of questions) {
//       await client.query(
//         `INSERT INTO assessment_questions (
//           assessment_id, question_type, question_text, options,
//           correct_answer, points, category, explanation, question_order
//         )
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
//         [
//           id,
//           question.questionType,
//           question.questionText,
//           JSON.stringify(question.options),
//           question.correctAnswer,
//           question.points,
//           question.category || null,
//           question.explanation || null,
//           question.questionOrder
//         ]
//       );
//     }

//     await client.query('COMMIT');

//     console.log('✅ Assessment updated:', title);

//     res.json({ message: 'Assessment updated successfully' });
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Error updating assessment:', error);
//     res.status(500).json({ message: 'Server error' });
//   } finally {
//     client.release();
//   }
// });

// server/routes/assessments.js

// Update assessment (Admin only) - FIXED

router.put('/admin/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const companyId = req.companyId;
    const { id } = req.params;

    // Check permissions
    if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const { 
      title, 
      description, 
      passingScore, 
      timeLimit, 
      difficulty,
      mandatory,
      active,
      questions 
    } = req.body;

    console.log('📝 Update assessment request:', { id, title, questionsCount: questions?.length });

    // Verify assessment belongs to company
    const assessmentCheck = await client.query(
      'SELECT id, title, sop_id FROM assessments WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (assessmentCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const existingSopId = assessmentCheck.rows[0].sop_id;

    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: 'At least one question is required' });
    }

    await client.query('BEGIN');

    // Calculate total points
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    // Update assessment (keep existing sop_id)
    await client.query(
      `UPDATE assessments 
       SET title = $1, description = $2, passing_score = $3, time_limit = $4,
           total_points = $5, difficulty = $6, mandatory = $7, active = $8,
           updated_at = NOW()
       WHERE id = $9 AND company_id = $10`,
      [
        title,
        description || null,
        passingScore,
        timeLimit,
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

// router.put('/admin/:id', async (req, res) => {
//   const client = await pool.connect();
  
//   try {
//     const companyId = req.companyId;
//     const { id } = req.params;

//     // Check permissions
//     if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
//       return res.status(403).json({ message: 'Insufficient permissions' });
//     }

//     const { 
//       title, 
//       description, 
//       passingScore, 
//       timeLimit, 
//       difficulty,
//       mandatory,
//       active,
//       questions 
//     } = req.body;

//     console.log('📝 Update assessment request:', { id, title, questionsCount: questions?.length });

//     // Verify assessment belongs to company
//     const assessmentCheck = await client.query(
//       'SELECT id, title FROM assessments WHERE id = $1 AND company_id = $2',
//       [id, companyId]
//     );

//     if (assessmentCheck.rows.length === 0) {
//       return res.status(404).json({ message: 'Assessment not found' });
//     }

//     const assessmentTitle = assessmentCheck.rows[0].title;

//     if (!questions || questions.length === 0) {
//       return res.status(400).json({ message: 'At least one question is required' });
//     }

//     await client.query('BEGIN');

//     // Calculate total points
//     const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

//     // Update assessment
//     await client.query(
//       `UPDATE assessments 
//        SET title = $1, description = $2, passing_score = $3, time_limit = $4,
//            total_points = $5, difficulty = $6, mandatory = $7, active = $8,
//            updated_at = NOW()
//        WHERE id = $9 AND company_id = $10`,
//       [
//         title,
//         description || null,
//         passingScore,
//         timeLimit,
//         totalPoints,
//         difficulty,
//         mandatory || false,
//         active !== undefined ? active : true,
//         id,
//         companyId
//       ]
//     );

//     // Delete old questions
//     await client.query(
//       'DELETE FROM assessment_questions WHERE assessment_id = $1',
//       [id]
//     );

//     // Create new questions
//     for (let i = 0; i < questions.length; i++) {
//       const question = questions[i];
      
//       // ✅ Generate question_id based on assessment title and order
//       const questionId = `q-${id}-${i + 1}`; // e.g., "q-1-1", "q-1-2"
      
//       // Format options and correctAnswer
//       let optionsJson = null;
//       let correctAnswerJson;

//       if (question.questionType === 'multiple-choice' || question.questionType === 'scenario') {
//         optionsJson = JSON.stringify(question.options || []);
//         correctAnswerJson = JSON.stringify(question.correctAnswer);
//       } else if (question.questionType === 'true-false') {
//         optionsJson = null;
//         correctAnswerJson = JSON.stringify(question.correctAnswer);
//       }

//       console.log(`  📋 Creating question: ${question.questionText.substring(0, 50)}...`);
//       console.log(`     ID: ${questionId}`);
//       console.log(`     Type: ${question.questionType}`);
//       console.log(`     Options: ${optionsJson}`);
//       console.log(`     Correct Answer: ${correctAnswerJson}`);

//       await client.query(
//         `INSERT INTO assessment_questions (
//           assessment_id, question_id, question_type, question_text, options,
//           correct_answer, points, category, explanation, question_order
//         )
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
//         [
//           id,
//           questionId, // ✅ Auto-generated question_id
//           question.questionType,
//           question.questionText,
//           optionsJson,
//           correctAnswerJson,
//           question.points,
//           question.category || null,
//           question.explanation || null,
//           question.questionOrder
//         ]
//       );
//     }

//     await client.query('COMMIT');

//     console.log('✅ Assessment updated:', title);

//     res.json({ message: 'Assessment updated successfully' });
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Error updating assessment:', error);
//     res.status(500).json({ 
//       message: 'Server error',
//       error: error.message
//     });
//   } finally {
//     client.release();
//   }
// });

// router.put('/admin/:id', async (req, res) => {
//   const client = await pool.connect();
  
//   try {
//     const companyId = req.companyId;
//     const { id } = req.params;

//     // Check permissions
//     if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
//       return res.status(403).json({ message: 'Insufficient permissions' });
//     }

//     const { 
//       title, 
//       description, 
//       passingScore, 
//       timeLimit, 
//       difficulty,
//       mandatory,
//       active,
//       questions 
//     } = req.body;

//     console.log('📝 Update assessment request:', { id, title, questionsCount: questions?.length });

//     // Verify assessment belongs to company
//     const assessmentCheck = await client.query(
//       'SELECT id FROM assessments WHERE id = $1 AND company_id = $2',
//       [id, companyId]
//     );

//     if (assessmentCheck.rows.length === 0) {
//       return res.status(404).json({ message: 'Assessment not found' });
//     }

//     if (!questions || questions.length === 0) {
//       return res.status(400).json({ message: 'At least one question is required' });
//     }

//     await client.query('BEGIN');

//     // Calculate total points
//     const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

//     // Update assessment
//     await client.query(
//       `UPDATE assessments 
//        SET title = $1, description = $2, passing_score = $3, time_limit = $4,
//            total_points = $5, difficulty = $6, mandatory = $7, active = $8,
//            updated_at = NOW()
//        WHERE id = $9 AND company_id = $10`,
//       [
//         title,
//         description || null,
//         passingScore,
//         timeLimit,
//         totalPoints,
//         difficulty,
//         mandatory || false,
//         active !== undefined ? active : true,
//         id,
//         companyId
//       ]
//     );

//     // Delete old questions
//     await client.query(
//       'DELETE FROM assessment_questions WHERE assessment_id = $1',
//       [id]
//     );

//     // Create new questions
//     for (const question of questions) {
//       // ✅ FIX: Properly format options and correctAnswer
//       let optionsJson = null;
//       let correctAnswerJson;

//       if (question.questionType === 'multiple-choice') {
//         // Multiple choice: options is array, correctAnswer is string
//         optionsJson = JSON.stringify(question.options || []);
//         correctAnswerJson = JSON.stringify(question.correctAnswer); // ✅ Stringify the string
//       } else {
//         // True/False: no options, correctAnswer is string
//         optionsJson = null;
//         correctAnswerJson = JSON.stringify(question.correctAnswer); // ✅ Stringify the string
//       }

//       console.log(`  📋 Creating question: ${question.questionText.substring(0, 50)}...`);
//       console.log(`     Type: ${question.questionType}`);
//       console.log(`     Options: ${optionsJson}`);
//       console.log(`     Correct Answer: ${correctAnswerJson}`);

//       await client.query(
//         `INSERT INTO assessment_questions (
//           assessment_id, question_type, question_text, options,
//           correct_answer, points, category, explanation, question_order
//         )
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
//         [
//           id,
//           question.questionType,
//           question.questionText,
//           optionsJson,
//           correctAnswerJson, // ✅ Now properly stringified
//           question.points,
//           question.category || null,
//           question.explanation || null,
//           question.questionOrder
//         ]
//       );
//     }

//     await client.query('COMMIT');

//     console.log('✅ Assessment updated:', title);

//     res.json({ message: 'Assessment updated successfully' });
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Error updating assessment:', error);
//     res.status(500).json({ 
//       message: 'Server error',
//       error: error.message
//     });
//   } finally {
//     client.release();
//   }
// });

// Create new assessment (Admin only) - FIXED

router.post('/admin/create', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const companyId = req.companyId;

    // Check permissions
    if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const { 
      title, 
      description, 
      passingScore, 
      timeLimit, 
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

    // ✅ Generate sop_id from title (lowercase, replace spaces with hyphens)
    const sopId = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .substring(0, 100); // Limit to 100 characters

    // ✅ Make it unique by appending company_id and timestamp if needed
    const uniqueSopId = `${sopId}-${companyId}-${Date.now()}`;

    console.log('📋 Generated sop_id:', uniqueSopId);

    // Create assessment
    const assessmentResult = await client.query(
      `INSERT INTO assessments (
        company_id, sop_id, title, description, passing_score, time_limit, 
        total_points, difficulty, mandatory, active, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id`,
      [
        companyId,
        uniqueSopId, // ✅ Auto-generated sop_id
        title,
        description || null,
        passingScore,
        timeLimit,
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
      
      // Generate question_id
      const questionId = `q-${assessmentId}-${i + 1}`;
      
      // Format options and correctAnswer
      let optionsJson = null;
      let correctAnswerJson;

      if (question.questionType === 'multiple-choice' || question.questionType === 'scenario') {
        optionsJson = JSON.stringify(question.options || []);
        correctAnswerJson = JSON.stringify(question.correctAnswer);
      } else if (question.questionType === 'true-false') {
        optionsJson = null;
        correctAnswerJson = JSON.stringify(question.correctAnswer);
      }

      console.log(`  📋 Creating question: ${question.questionText.substring(0, 50)}...`);

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

// router.post('/admin/create', async (req, res) => {
//   const client = await pool.connect();
  
//   try {
//     const companyId = req.companyId;

//     // Check permissions
//     if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
//       return res.status(403).json({ message: 'Insufficient permissions' });
//     }

//     const { 
//       title, 
//       description, 
//       passingScore, 
//       timeLimit, 
//       difficulty,
//       mandatory,
//       active,
//       questions 
//     } = req.body;

//     console.log('📝 Create assessment request:', { title, questionsCount: questions?.length });

//     if (!questions || questions.length === 0) {
//       return res.status(400).json({ message: 'At least one question is required' });
//     }

//     await client.query('BEGIN');

//     // Calculate total points
//     const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

//     // Create assessment
//     const assessmentResult = await client.query(
//       `INSERT INTO assessments (
//         company_id, title, description, passing_score, time_limit, 
//         total_points, difficulty, mandatory, active, created_by
//       )
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//       RETURNING id`,
//       [
//         companyId,
//         title,
//         description || null,
//         passingScore,
//         timeLimit,
//         totalPoints,
//         difficulty,
//         mandatory || false,
//         active !== undefined ? active : true,
//         req.user.id
//       ]
//     );

//     const assessmentId = assessmentResult.rows[0].id;

//     // Create questions
//     for (let i = 0; i < questions.length; i++) {
//       const question = questions[i];
      
//       // ✅ Generate question_id based on assessment ID and order
//       const questionId = `q-${assessmentId}-${i + 1}`; // e.g., "q-5-1", "q-5-2"
      
//       // Format options and correctAnswer
//       let optionsJson = null;
//       let correctAnswerJson;

//       if (question.questionType === 'multiple-choice' || question.questionType === 'scenario') {
//         optionsJson = JSON.stringify(question.options || []);
//         correctAnswerJson = JSON.stringify(question.correctAnswer);
//       } else if (question.questionType === 'true-false') {
//         optionsJson = null;
//         correctAnswerJson = JSON.stringify(question.correctAnswer);
//       }

//       console.log(`  📋 Creating question: ${question.questionText.substring(0, 50)}...`);
//       console.log(`     ID: ${questionId}`);
//       console.log(`     Type: ${question.questionType}`);
//       console.log(`     Options: ${optionsJson}`);
//       console.log(`     Correct Answer: ${correctAnswerJson}`);

//       await client.query(
//         `INSERT INTO assessment_questions (
//           assessment_id, question_id, question_type, question_text, options,
//           correct_answer, points, category, explanation, question_order
//         )
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
//         [
//           assessmentId,
//           questionId, // ✅ Auto-generated question_id
//           question.questionType,
//           question.questionText,
//           optionsJson,
//           correctAnswerJson,
//           question.points,
//           question.category || null,
//           question.explanation || null,
//           question.questionOrder
//         ]
//       );
//     }

//     await client.query('COMMIT');

//     console.log('✅ Assessment created:', title, 'for company:', companyId);

//     res.status(201).json({
//       message: 'Assessment created successfully',
//       assessmentId
//     });
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Error creating assessment:', error);
//     res.status(500).json({ 
//       message: 'Server error',
//       error: error.message
//     });
//   } finally {
//     client.release();
//   }
// });

// router.post('/admin/create', async (req, res) => {
//   const client = await pool.connect();
  
//   try {
//     const companyId = req.companyId;

//     // Check permissions
//     if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
//       return res.status(403).json({ message: 'Insufficient permissions' });
//     }

//     const { 
//       title, 
//       description, 
//       passingScore, 
//       timeLimit, 
//       difficulty,
//       mandatory,
//       active,
//       questions 
//     } = req.body;

//     console.log('📝 Create assessment request:', { title, questionsCount: questions?.length });

//     if (!questions || questions.length === 0) {
//       return res.status(400).json({ message: 'At least one question is required' });
//     }

//     await client.query('BEGIN');

//     // Calculate total points
//     const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

//     // Create assessment
//     const assessmentResult = await client.query(
//       `INSERT INTO assessments (
//         company_id, title, description, passing_score, time_limit, 
//         total_points, difficulty, mandatory, active, created_by
//       )
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//       RETURNING id`,
//       [
//         companyId,
//         title,
//         description || null,
//         passingScore,
//         timeLimit,
//         totalPoints,
//         difficulty,
//         mandatory || false,
//         active !== undefined ? active : true,
//         req.user.id
//       ]
//     );

//     const assessmentId = assessmentResult.rows[0].id;

//     // Create questions
//     for (const question of questions) {
//       // ✅ FIX: Properly format options and correctAnswer
//       let optionsJson = null;
//       let correctAnswerJson;

//       if (question.questionType === 'multiple-choice') {
//         // Multiple choice: options is array, correctAnswer is string
//         optionsJson = JSON.stringify(question.options || []);
//         correctAnswerJson = JSON.stringify(question.correctAnswer); // ✅ Stringify the string
//       } else {
//         // True/False: no options, correctAnswer is string
//         optionsJson = null;
//         correctAnswerJson = JSON.stringify(question.correctAnswer); // ✅ Stringify the string
//       }

//       console.log(`  📋 Creating question: ${question.questionText.substring(0, 50)}...`);
//       console.log(`     Type: ${question.questionType}`);
//       console.log(`     Options: ${optionsJson}`);
//       console.log(`     Correct Answer: ${correctAnswerJson}`);

//       await client.query(
//         `INSERT INTO assessment_questions (
//           assessment_id, question_type, question_text, options,
//           correct_answer, points, category, explanation, question_order
//         )
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
//         [
//           assessmentId,
//           question.questionType,
//           question.questionText,
//           optionsJson,
//           correctAnswerJson, // ✅ Now properly stringified
//           question.points,
//           question.category || null,
//           question.explanation || null,
//           question.questionOrder
//         ]
//       );
//     }

//     await client.query('COMMIT');

//     console.log('✅ Assessment created:', title, 'for company:', companyId);

//     res.status(201).json({
//       message: 'Assessment created successfully',
//       assessmentId
//     });
//   } catch (error) {
//     await client.query('ROLLBACK');
//     console.error('❌ Error creating assessment:', error);
//     res.status(500).json({ 
//       message: 'Server error',
//       error: error.message
//     });
//   } finally {
//     client.release();
//   }
// });

// Delete assessment (Admin only)
router.delete('/admin/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const companyId = req.companyId;
    const { id } = req.params;

    // Check permissions
    if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

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
    // 1. Delete answers
    await client.query(
      `DELETE FROM assessment_answers 
       WHERE attempt_id IN (
         SELECT id FROM assessment_attempts WHERE assessment_id = $1
       )`,
      [id]
    );

    // 2. Delete user badges for this assessment
    await client.query(
      'DELETE FROM user_badges WHERE assessment_id = $1',
      [id]
    );

    // 3. Delete certifications
    await client.query(
      'DELETE FROM user_certifications WHERE assessment_id = $1',
      [id]
    );

    // 4. Delete attempts
    await client.query(
      'DELETE FROM assessment_attempts WHERE assessment_id = $1',
      [id]
    );

    // 5. Delete questions
    await client.query(
      'DELETE FROM assessment_questions WHERE assessment_id = $1',
      [id]
    );

    // 6. Delete assessment
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
router.patch('/admin/:id/active', async (req, res) => {
  try {
    const companyId = req.companyId;
    const { id } = req.params;

    // Check permissions
    if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

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

export default router;