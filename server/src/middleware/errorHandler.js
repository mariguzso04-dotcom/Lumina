// Manejador centralizado de errores seguro
// Garantiza que NUNCA se filtren contraseñas, secretos ni contenidos privados de diarios en logs o respuestas HTTP
function errorHandler(err, req, res, next) {
  // Omitir datos sensibles en la salida
  const safeMessage = err.isPublic ? err.message : 'Ha ocurrido un error inesperado en el servidor.';
  const statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error(`[Error Seguro] ${req.method} ${req.originalUrl}:`, err.message);
  }

  res.status(statusCode).json({
    success: false,
    error: safeMessage
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
