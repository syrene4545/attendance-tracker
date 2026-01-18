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

// Get team assessment analytics (Manager/Admin/HR only)
router.get('/team-overview', requireManagerRole, async (req, res) => {
  try {
    const companyId = req.companyId;

    // Get all active assessments for this company
    const assessmentsResult = await pool.query(
      `SELECT id, assessment_key, title 
       FROM assessments 
       WHERE active = true AND company_id = $1`,
      [companyId]
    );
    const assessments = assessmentsResult.rows;

    // Get total employees in this company
    const usersResult = await pool.query(
      `SELECT COUNT(*) as count FROM users WHERE company_id = $1`,
      [companyId]
    );
    const totalEmployees = parseInt(usersResult.rows[0].count);

    console.log(`📊 Company ${companyId}: ${totalEmployees} employees, ${assessments.length} assessments`);

    const overview = {
      totalAssessments: assessments.length,
      totalEmployees,
      overallCompletion: 0,
      averageScore: 0,
      byAssessment: []
    };

    for (const assessment of assessments) {
      // Get completed attempts for this assessment (only from this company's users)
      const attemptsResult = await pool.query(
        `SELECT aa.user_id, aa.score, aa.passed
         FROM assessment_attempts aa
         JOIN users u ON aa.user_id = u.id
         WHERE aa.assessment_id = $1 
           AND aa.status = 'completed'
           AND u.company_id = $2`,
        [assessment.id, companyId]
      );

      const attempts = attemptsResult.rows;
      const uniqueUsers = [...new Set(attempts.map(a => a.user_id))];
      const passedAttempts = attempts.filter(a => a.passed);
      const passedUsers = [...new Set(passedAttempts.map(a => a.user_id))];

      const avgScore = attempts.length > 0
        ? attempts.reduce((sum, a) => sum + parseFloat(a.score), 0) / attempts.length
        : 0;

      console.log(`  📋 Assessment "${assessment.title}": ${uniqueUsers.length} attempted, ${passedUsers.length} passed`);

      overview.byAssessment.push({
        assessmentKey: assessment.assessment_key,
        title: assessment.title,
        attempted: uniqueUsers.length,
        completed: passedUsers.length,
        completionRate: totalEmployees > 0 ? (passedUsers.length / totalEmployees) * 100 : 0,
        averageScore: Math.round(avgScore * 10) / 10,
        totalAttempts: attempts.length
      });
    }

    // Calculate overall metrics
    const totalCompleted = overview.byAssessment.reduce((sum, a) => sum + a.completed, 0);
    const totalPossible = assessments.length * totalEmployees;
    overview.overallCompletion = totalPossible > 0 
      ? (totalCompleted / totalPossible) * 100 
      : 0;

    const allScores = overview.byAssessment
      .filter(a => a.averageScore > 0)
      .map(a => a.averageScore);
    overview.averageScore = allScores.length > 0
      ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
      : 0;

    res.json(overview);
  } catch (error) {
    console.error('❌ Team overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get individual employee progress (Manager/Admin/HR only)
router.get('/employee/:userId', requireManagerRole, async (req, res) => {
  try {
    const companyId = req.companyId;
    const { userId } = req.params;

    // Get user from same company
    const userResult = await pool.query(
      `SELECT id, name, email, role 
       FROM users 
       WHERE id = $1 AND company_id = $2`,
      [userId, companyId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const user = userResult.rows[0];

    // Get user's certifications (only for company's assessments)
    const certificationsResult = await pool.query(
      `SELECT c.*, a.title, a.assessment_key
       FROM user_certifications c
       JOIN assessments a ON c.assessment_id = a.id
       WHERE c.user_id = $1 AND a.company_id = $2`,
      [userId, companyId]
    );

    // Get user's attempts (only for company's assessments)
    const attemptsResult = await pool.query(
      `SELECT aa.assessment_id, aa.score, aa.passed
       FROM assessment_attempts aa
       JOIN assessments a ON aa.assessment_id = a.id
       WHERE aa.user_id = $1 
         AND aa.status = 'completed'
         AND a.company_id = $2
       ORDER BY aa.completed_at DESC`,
      [userId, companyId]
    );

    // Get all active assessments for this company
    const assessmentsResult = await pool.query(
      `SELECT id, assessment_key, title 
       FROM assessments 
       WHERE active = true AND company_id = $1`,
      [companyId]
    );

    const progress = assessmentsResult.rows.map(assessment => {
      const userAttempts = attemptsResult.rows.filter(
        a => a.assessment_id === assessment.id
      );

      const cert = certificationsResult.rows.find(
        c => c.assessment_id === assessment.id
      );

      const bestAttempt = userAttempts.reduce((best, current) => {
        return (!best || parseFloat(current.score) > parseFloat(best.score)) ? current : best;
      }, null);

      return {
        assessmentKey: assessment.assessment_key,
        title: assessment.title,
        status: cert ? 'certified' : (userAttempts.length > 0 ? 'attempted' : 'not-started'),
        attempts: userAttempts.length,
        bestScore: bestAttempt ? parseFloat(bestAttempt.score) : null,
        certified: !!cert,
        certificationDate: cert ? cert.certified_at : null
      };
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      progress
    });
  } catch (error) {
    console.error('❌ Employee progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function for weak areas logic
async function getWeakAreas(companyId, assessmentKey = null) {
  try {
    let attemptsQuery;
    let attemptsParams;

    if (assessmentKey) {
      // Get attempts for specific SOP in this company
      attemptsQuery = `
        SELECT aa.id 
        FROM assessment_attempts aa
        JOIN assessments a ON aa.assessment_id = a.id
        JOIN users u ON aa.user_id = u.id
        WHERE a.assessment_key = $1 
          AND aa.status = 'completed'
          AND a.company_id = $2
          AND u.company_id = $2
      `;
      attemptsParams = [assessmentKey, companyId];
    } else {
      // Get all attempts in this company
      attemptsQuery = `
        SELECT aa.id 
        FROM assessment_attempts aa
        JOIN assessments a ON aa.assessment_id = a.id
        JOIN users u ON aa.user_id = u.id
        WHERE aa.status = 'completed'
          AND a.company_id = $1
          AND u.company_id = $1
      `;
      attemptsParams = [companyId];
    }

    const attemptsResult = await pool.query(attemptsQuery, attemptsParams);
    const attemptIds = attemptsResult.rows.map(a => a.id);

    if (attemptIds.length === 0) {
      return [];
    }

    // Get all answers for these attempts
    const answersResult = await pool.query(
      `SELECT question_id, correct
       FROM assessment_answers
       WHERE attempt_id = ANY($1)`,
      [attemptIds]
    );

    // Aggregate incorrect answers
    const questionStats = {};

    answersResult.rows.forEach(answer => {
      if (!questionStats[answer.question_id]) {
        questionStats[answer.question_id] = {
          questionId: answer.question_id,
          incorrectCount: 0,
          totalAnswers: 0
        };
      }

      questionStats[answer.question_id].totalAnswers++;
      if (!answer.correct) {
        questionStats[answer.question_id].incorrectCount++;
      }
    });

    // Get question details (only for this company's assessments)
    let questionsQuery;
    let questionsParams;

    if (assessmentKey) {
      questionsQuery = `
        SELECT q.question_id, q.question_text, q.category
        FROM assessment_questions q
        JOIN assessments a ON q.assessment_id = a.id
        WHERE a.assessment_key = $1 
          AND a.active = true 
          AND a.company_id = $2
      `;
      questionsParams = [assessmentKey, companyId];
    } else {
      questionsQuery = `
        SELECT q.question_id, q.question_text, q.category
        FROM assessment_questions q
        JOIN assessments a ON q.assessment_id = a.id
        WHERE a.active = true AND a.company_id = $1
      `;
      questionsParams = [companyId];
    }

    const questionsResult = await pool.query(questionsQuery, questionsParams);
    const questionsMap = {};
    questionsResult.rows.forEach(q => {
      questionsMap[q.question_id] = {
        text: q.question_text,
        category: q.category
      };
    });

    // Build weak areas response
    const weakAreas = Object.values(questionStats)
      .map(stat => {
        const questionDetail = questionsMap[stat.questionId];

        return {
          questionId: stat.questionId,
          incorrectCount: stat.incorrectCount,
          totalAnswers: stat.totalAnswers,
          incorrectRate: (stat.incorrectCount / stat.totalAnswers) * 100,
          question: questionDetail ? questionDetail.text : 'Unknown',
          category: questionDetail ? questionDetail.category : 'Unknown'
        };
      })
      .filter(area => questionsMap[area.questionId]) // Only include questions from this company
      .sort((a, b) => b.incorrectRate - a.incorrectRate)
      .slice(0, 10);

    return weakAreas;
  } catch (error) {
    console.error('❌ Weak areas helper error:', error);
    throw error;
  }
}

// Get common mistakes/weak areas - ALL SOPs
router.get('/weak-areas', requireManagerRole, async (req, res) => {
  try {
    const companyId = req.companyId;
    const weakAreas = await getWeakAreas(companyId);
    res.json(weakAreas);
  } catch (error) {
    console.error('❌ Weak areas error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get common mistakes/weak areas - SPECIFIC SOP
router.get('/weak-areas/:assessmentKey', requireManagerRole, async (req, res) => {
  try {
    const companyId = req.companyId;
    const { assessmentKey } = req.params;

    const weakAreas = await getWeakAreas(companyId, assessmentKey);
    res.json(weakAreas);
  } catch (error) {
    console.error('❌ Weak areas error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;