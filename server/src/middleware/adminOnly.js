function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso restringido. Esta acción requiere permisos de administración.'
    });
  }
  next();
}

module.exports = {
  requireAdmin
};
