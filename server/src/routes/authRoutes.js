const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/rateLimiter');

// Rate limiter estricto para registro e inicio de sesión
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 30,
  message: 'Demasiados intentos desde esta dirección. Por favor, aguardá unos minutos.'
});

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
