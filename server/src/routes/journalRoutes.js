const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', journalController.listEntries);
router.post('/', journalController.createEntry);
router.get('/:id', journalController.getEntryById);
router.patch('/:id', journalController.updateEntry);
router.patch('/:id/favorite', journalController.toggleFavorite);
router.delete('/:id', journalController.deleteEntry);

module.exports = router;
