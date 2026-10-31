const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, activityController.listActivities);
router.post('/complete', requireAuth, activityController.recordCompletion);
router.get('/history', requireAuth, activityController.getUserHistory);

module.exports = router;
