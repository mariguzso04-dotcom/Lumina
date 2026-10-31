const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/me', userController.getProfile);
router.patch('/me', userController.updateProfile);
router.delete('/me', userController.deleteAccount);
router.get('/export', userController.exportPersonalData);

module.exports = router;
