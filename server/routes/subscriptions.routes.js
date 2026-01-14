// // server/routes/subscriptions.routes.js

// import express from 'express';
// import { pool } from '../index.js';
// import { authenticateToken } from '../middleware/permissionMiddleware.js';
// import { verifyTenantAccess } from '../middleware/tenantMiddleware.js';

// const router = express.Router();

// // Upgrade subscription
// router.post('/upgrade', authenticateToken, verifyTenantAccess, async (req, res) => {
//   try {
//     const companyId = req.companyId;
//     const { planId } = req.body;

//     // Check if user is admin
//     if (req.user.role !== 'admin') {
//       return res.status(403).json({ error: 'Only admins can upgrade plans' });
//     }

//     // Define plan details
//     const planDetails = {
//       trial: { maxEmployees: 10, price: 0 },
//       basic: { maxEmployees: 25, price: 499 },
//       professional: { maxEmployees: 100, price: 999 },
//       enterprise: { maxEmployees: null, price: null },
//     };

//     const plan = planDetails[planId];
//     if (!plan) {
//       return res.status(400).json({ error: 'Invalid plan' });
//     }

//     // Update company subscription
//     const result = await pool.query(
//       `UPDATE companies 
//        SET subscription_plan = $1,
//            max_employees = $2,
//            subscription_start_date = CURRENT_DATE,
//            subscription_end_date = CURRENT_DATE + INTERVAL '1 month',
//            updated_at = NOW()
//        WHERE id = $3
//        RETURNING *`,
//       [planId, plan.maxEmployees, companyId]
//     );

//     console.log('✅ Subscription upgraded to:', planId);

//     // TODO: In production, integrate with payment gateway (Stripe, PayFast, etc.)
//     // For now, return success
//     res.json({
//       message: 'Subscription upgraded successfully',
//       plan: planId,
//       company: result.rows[0]
//     });
//   } catch (error) {
//     console.error('❌ Upgrade subscription error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Get subscription plans
// router.get('/plans', async (req, res) => {
//   try {
//     const plans = [
//       {
//         id: 'trial',
//         name: 'Trial',
//         price: 0,
//         maxEmployees: 10,
//         duration: '14 days'
//       },
//       {
//         id: 'basic',
//         name: 'Basic',
//         price: 499,
//         maxEmployees: 25,
//         duration: 'monthly'
//       },
//       {
//         id: 'professional',
//         name: 'Professional',
//         price: 999,
//         maxEmployees: 100,
//         duration: 'monthly'
//       },
//       {
//         id: 'enterprise',
//         name: 'Enterprise',
//         price: null,
//         maxEmployees: null,
//         duration: 'custom'
//       }
//     ];

//     res.json({ plans });
//   } catch (error) {
//     console.error('❌ Get plans error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// export default router;

// server/routes/subscriptions.routes.js

import express from 'express';
import { pool } from '../index.js';
import { protect } from '../middleware/authMiddleware.js';
import { extractTenant, verifyTenantAccess } from '../middleware/tenantMiddleware.js';

const router = express.Router();

// Get subscription plans (public - no auth required)
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'trial',
        name: 'Trial',
        price: 0,
        maxEmployees: 10,
        duration: '14 days',
        features: [
          'Up to 10 employees',
          'Basic attendance tracking',
          'Employee profiles',
          'Leave management',
          '14 days trial period'
        ]
      },
      {
        id: 'basic',
        name: 'Basic',
        price: 499,
        maxEmployees: 25,
        duration: 'monthly',
        features: [
          'Up to 25 employees',
          'Attendance tracking',
          'Employee profiles',
          'Leave management',
          'Basic reporting',
          'Email support'
        ]
      },
      {
        id: 'professional',
        name: 'Professional',
        price: 999,
        maxEmployees: 100,
        duration: 'monthly',
        features: [
          'Up to 100 employees',
          'Advanced attendance tracking',
          'Complete employee management',
          'Leave & payroll management',
          'Advanced analytics',
          'Priority support',
          'Custom SOPs'
        ]
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: null,
        maxEmployees: null,
        duration: 'custom',
        features: [
          'Unlimited employees',
          'All Professional features',
          'Custom integrations',
          'Dedicated account manager',
          'SLA guarantees',
          'Custom training',
          'On-premise deployment option'
        ]
      }
    ];

    res.json({ plans });
  } catch (error) {
    console.error('❌ Get plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PROTECTED ROUTES (REQUIRE AUTHENTICATION) ====================

// Apply authentication middleware to all routes below this point
router.use(protect);           // 1️⃣ Authenticate user
router.use(extractTenant);     // 2️⃣ Extract tenant context
router.use(verifyTenantAccess); // 3️⃣ Verify tenant access

// Get current subscription
router.get('/current', async (req, res) => {
  try {
    const companyId = req.companyId;

    // Get company subscription details
    const result = await pool.query(
      `SELECT 
        id,
        name,
        subscription_plan as "subscriptionPlan",
        max_employees as "maxEmployees",
        subscription_start_date as "subscriptionStartDate",
        subscription_end_date as "subscriptionEndDate",
        is_active as "isActive"
      FROM companies
      WHERE id = $1`,
      [companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = result.rows[0];

    // Get current employee count
    const employeeCount = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE company_id = $1 AND employment_status = $2',
      [companyId, 'active']
    );

    res.json({
      subscription: {
        plan: company.subscriptionPlan,
        maxEmployees: company.maxEmployees,
        currentEmployees: parseInt(employeeCount.rows[0].count),
        startDate: company.subscriptionStartDate,
        endDate: company.subscriptionEndDate,
        isActive: company.isActive,
        daysRemaining: company.subscriptionEndDate 
          ? Math.ceil((new Date(company.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24))
          : null
      }
    });
  } catch (error) {
    console.error('❌ Get current subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upgrade subscription (Admin only)
router.post('/upgrade', async (req, res) => {
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

    // Get current employee count
    const employeeCount = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE company_id = $1 AND employment_status = $2',
      [companyId, 'active']
    );

    const currentEmployees = parseInt(employeeCount.rows[0].count);

    // Check if new plan supports current employee count
    if (plan.maxEmployees && currentEmployees > plan.maxEmployees) {
      return res.status(400).json({ 
        error: `Cannot downgrade to ${planId} plan. You have ${currentEmployees} active employees, but this plan only supports ${plan.maxEmployees}.`
      });
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
       RETURNING 
         id,
         name,
         subscription_plan as "subscriptionPlan",
         max_employees as "maxEmployees",
         subscription_start_date as "subscriptionStartDate",
         subscription_end_date as "subscriptionEndDate"`,
      [planId, plan.maxEmployees, companyId]
    );

    console.log('✅ Subscription upgraded to:', planId, 'for company:', companyId);

    // TODO: In production, integrate with payment gateway (Stripe, PayFast, PayPal, etc.)
    // For now, return success
    res.json({
      message: 'Subscription upgraded successfully',
      subscription: {
        plan: planId,
        maxEmployees: plan.maxEmployees,
        price: plan.price,
        startDate: result.rows[0].subscriptionStartDate,
        endDate: result.rows[0].subscriptionEndDate
      },
      company: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Upgrade subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel subscription (Admin only)
router.post('/cancel', async (req, res) => {
  try {
    const companyId = req.companyId;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can cancel subscriptions' });
    }

    // Update company to trial plan
    await pool.query(
      `UPDATE companies 
       SET subscription_plan = 'trial',
           max_employees = 10,
           subscription_end_date = CURRENT_DATE + INTERVAL '14 days',
           updated_at = NOW()
       WHERE id = $1`,
      [companyId]
    );

    console.log('✅ Subscription cancelled for company:', companyId);

    res.json({
      message: 'Subscription cancelled. Your account has been downgraded to the Trial plan.',
      newPlan: 'trial'
    });
  } catch (error) {
    console.error('❌ Cancel subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get subscription history (Admin only)
router.get('/history', async (req, res) => {
  try {
    const companyId = req.companyId;

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can view subscription history' });
    }

    // TODO: In production, maintain a subscription_history table
    // For now, return current subscription only
    const result = await pool.query(
      `SELECT 
        subscription_plan as "subscriptionPlan",
        subscription_start_date as "subscriptionStartDate",
        subscription_end_date as "subscriptionEndDate",
        created_at as "createdAt"
      FROM companies
      WHERE id = $1`,
      [companyId]
    );

    res.json({
      history: [{
        plan: result.rows[0].subscriptionPlan,
        startDate: result.rows[0].subscriptionStartDate,
        endDate: result.rows[0].subscriptionEndDate,
        status: 'active'
      }]
    });
  } catch (error) {
    console.error('❌ Get subscription history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;