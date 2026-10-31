const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminOnly');

// Todas las rutas de administración requieren autenticación y rol de administrador
router.use(requireAuth, requireAdmin);

router.get('/metrics', adminController.getMetrics);

router.post('/activities', adminController.createActivity);
router.patch('/activities/:id', adminController.updateActivity);
router.delete('/activities/:id', adminController.deleteActivity);

router.post('/music', adminController.createTrack);
router.patch('/music/:id', adminController.updateTrack);
router.delete('/music/:id', adminController.deleteTrack);

router.post('/support', adminController.createSupportResource);
router.patch('/support/:id', adminController.updateSupportResource);
router.delete('/support/:id', adminController.deleteSupportResource);

module.exports = router;
