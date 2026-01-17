import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { extractTenant, verifyTenantAccess } from '../middleware/tenantMiddleware.js';
import { checkPermission } from '../middleware/permissionMiddleware.js';
import { seedCompanySOPs } from '../services/seedSops.service.js';

const router = express.Router();

// Apply middleware to all routes
router.use(protect);
router.use(extractTenant);
router.use(verifyTenantAccess);

// ✅ REFINED: Seed SOPs with dry run support
router.post(
  '/seed/sops',
  checkPermission('manage_company'),
  async (req, res) => {
    try {
      const dryRun = req.query.dryRun === 'true';
      
      console.log('🌱 Starting SOP seeding', {
        companyId: req.companyId,
        adminId: req.user.id,
        dryRun,
        timestamp: new Date().toISOString()
      });
      
      const result = await seedCompanySOPs({
        companyId: req.companyId,
        adminId: req.user.id,
        dryRun
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

export default router;