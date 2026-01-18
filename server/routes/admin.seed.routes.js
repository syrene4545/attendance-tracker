import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { extractTenant, verifyTenantAccess } from '../middleware/tenantMiddleware.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';
import { seedCompanySOPs, DEFAULT_SOP_TEMPLATES } from '../services/seedSops.service.js';
import { seedCompanyAssessments, DEFAULT_ASSESSMENT_TEMPLATES, GLOBAL_BADGES } from '../services/seedAssessments.service.js';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(extractTenant);
router.use(verifyTenantAccess);

// ✅ ENHANCED: Seed SOPs with dry run and custom template support
router.post(
  '/seed/sops',
  checkPermission('manage_company'),
  async (req, res) => {
    try {
      const dryRun = req.query.dryRun === 'true';
    //   const { templates: customTemplates } = req.body;
      const { templates: customTemplates } = req.body || {};

      
      // Validate custom templates if provided
      if (customTemplates) {
        if (!Array.isArray(customTemplates)) {
          return res.status(400).json({ 
            error: 'Custom templates must be an array' 
          });
        }
        
        // Validate each template has required fields
        for (const template of customTemplates) {
          if (!template.title || !template.category || !template.content) {
            return res.status(400).json({ 
              error: 'Each template must have title, category, and content',
              invalidTemplate: template
            });
          }
        }
      }
      
      console.log('🌱 Starting SOP seeding', {
        companyId: req.companyId,
        adminId: req.user.id,
        dryRun,
        customTemplates: customTemplates ? customTemplates.length : 0,
        timestamp: new Date().toISOString()
      });
      
      const result = await seedCompanySOPs({
        companyId: req.companyId,
        adminId: req.user.id,
        dryRun,
        customTemplates
      });

      console.log('✅ SOP seeding completed successfully', {
        companyId: req.companyId,
        ...result
      });

      res.json({
        message: dryRun 
          ? 'Dry run completed - no changes made' 
          : 'SOP seeding completed successfully',
        ...result
      });
    } catch (error) {
      console.error('❌ SOP seeding failed', {
        companyId: req.companyId,
        adminId: req.user?.id,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      res.status(500).json({ 
        error: 'Failed to seed SOPs',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// ✅ NEW: Get available SOP templates
router.get(
  '/seed/sops/templates',
  checkPermission('manage_company'),
  async (req, res) => {
    try {
      res.json({
        templates: DEFAULT_SOP_TEMPLATES.map(t => ({
          key: t.key,
          title: t.title,
          category: t.category,
          description: t.description,
          version: t.templateVersion,
          status: t.status
        })),
        totalTemplates: DEFAULT_SOP_TEMPLATES.length
      });
    } catch (error) {
      console.error('❌ Get SOP templates failed:', error);
      res.status(500).json({ error: 'Failed to get SOP templates' });
    }
  }
);

// ==================== ASSESSMENT SEEDING ====================

// ✅ NEW: Seed assessments for current company (admin only)
router.post(
  '/seed/assessments',
  checkPermission('manage_company'),
  async (req, res) => {
    try {
      const dryRun = req.query.dryRun === 'true';
      const { templates: customTemplates } = req.body;
      
      console.log('🌱 Starting assessment seeding', {
        companyId: req.companyId,
        adminId: req.user.id,
        dryRun,
        customTemplates: customTemplates ? customTemplates.length : 0,
        timestamp: new Date().toISOString()
      });
      
      const result = await seedCompanyAssessments({
        companyId: req.companyId,
        adminId: req.user.id,
        dryRun,
        customTemplates
      });

      console.log('✅ Assessment seeding completed successfully', result);

      res.json({
        message: dryRun 
          ? 'Dry run completed - no changes made' 
          : 'Assessment seeding completed successfully',
        ...result
      });
    } catch (error) {
      console.error('❌ Assessment seeding failed', {
        companyId: req.companyId,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      res.status(500).json({ 
        error: 'Failed to seed assessments',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// ✅ NEW: Get available assessment templates
router.get(
  '/seed/assessments/templates',
  checkPermission('manage_company'),
  async (req, res) => {
    try {
      res.json({
        templates: DEFAULT_ASSESSMENT_TEMPLATES.map(t => ({
          key: t.key,
          title: t.title,
          description: t.description,
          questions: t.questions.length,
          passing_score: t.passing_score,
          difficulty: t.difficulty,
          badges: t.badges?.length || 0
        })),
        globalBadges: GLOBAL_BADGES.map(b => ({
          key: b.key,
          name: b.name,
          description: b.description,
          rarity: b.rarity,
          points: b.points
        })),
        totalTemplates: DEFAULT_ASSESSMENT_TEMPLATES.length,
        totalGlobalBadges: GLOBAL_BADGES.length
      });
    } catch (error) {
      console.error('❌ Get assessment templates failed:', error);
      res.status(500).json({ error: 'Failed to get assessment templates' });
    }
  }
);

export default router;