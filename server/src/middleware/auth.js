const { verifyToken } = require('../utils/token');
const { getDB } = require('../db');

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Acceso no autorizado. Se requiere iniciar sesión.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        error: 'Sesión expirada o inválida. Por favor, volvé a iniciar sesión.'
      });
    }

    const db = await getDB();
    const user = await db.get(
      'SELECT id, email, display_name, role, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado o cuenta suspendida.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Error al autenticar usuario:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Error interno de autenticación.'
    });
  }
}

// Middleware opcional para rutas que pueden funcionar con o sin sesión activa
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        const db = await getDB();
        const user = await db.get(
          'SELECT id, email, display_name, role, created_at FROM users WHERE id = ?',
          [decoded.id]
        );
        if (user) {
          req.user = user;
        }
      }
    }
  } catch (err) {
    // Ignorar en autenticación opcional
  }
  next();
}

module.exports = {
  requireAuth,
  optionalAuth
};
