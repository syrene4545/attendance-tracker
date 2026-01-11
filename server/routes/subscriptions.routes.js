// server/routes/subscriptions.routes.js

import express from 'express';
import { pool } from '../index.js';
import { authenticateToken } from '../middleware/permissionMiddleware.js';
import { verifyTenantAccess } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// Upgrade subscription
router.post('/upgrade', authenticateToken, verifyTenantAccess, async (req, res) => {
  try {
    const companyId = req.companyId;
    const { planId } = req.body;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can upgrade plans' });
    }

    // Define plan details
    const planDetails = {
      trial: { maxEmployees: 10, price: 0 },
      basic: { maxEmployees: 25, price: 499 },
      professional: { maxEmployees: 100, price: 999 },
      enterprise: { maxEmployees: null, price: null },
    };

    const plan = planDetails[planId];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Update company subscription
    const result = await pool.query(
      `UPDATE companies 
       SET subscription_plan = $1,
           max_employees = $2,
           subscription_start_date = CURRENT_DATE,
           subscription_end_date = CURRENT_DATE + INTERVAL '1 month',
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [planId, plan.maxEmployees, companyId]
    );

    console.log('✅ Subscription upgraded to:', planId);

    // TODO: In production, integrate with payment gateway (Stripe, PayFast, etc.)
    // For now, return success
    res.json({
      message: 'Subscription upgraded successfully',
      plan: planId,
      company: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Upgrade subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'trial',
        name: 'Trial',
        price: 0,
        maxEmployees: 10,
        duration: '14 days'
      },
      {
        id: 'basic',
        name: 'Basic',
        price: 499,
        maxEmployees: 25,
        duration: 'monthly'
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 999,
        maxEmployees: 100,
        duration: 'monthly'
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: null,
        maxEmployees: null,
        duration: 'custom'
      }
    ];

    res.json({ plans });
  } catch (error) {
    console.error('❌ Get plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;