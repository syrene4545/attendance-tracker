import express from 'express';

const router = express.Router();

// ==================== HEALTH CHECK ====================
router.get('/', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;
