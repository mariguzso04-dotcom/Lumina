const express = require('express');
const router = express.Router();
const moodController = require('../controllers/moodController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/statistics', moodController.getStatistics);
router.get('/', moodController.listMoods);
router.post('/', moodController.createMood);
router.get('/:id', moodController.getMoodById);
router.patch('/:id', moodController.updateMood);
router.delete('/:id', moodController.deleteMood);

module.exports = router;
