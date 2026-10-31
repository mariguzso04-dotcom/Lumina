// Limitador de tasa en memoria para mitigar intentos de fuerza bruta
const requestCounts = new Map();

function createRateLimiter({ windowMs = 15 * 60 * 1000, maxRequests = 20, message = 'Demasiados intentos. Por favor, aguardá unos minutos.' } = {}) {
  // Limpieza periódica para evitar fugas de memoria
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of requestCounts.entries()) {
      if (now - record.startTime > windowMs) {
        requestCounts.delete(key);
      }
    }
  }, windowMs);
  if (cleanupTimer.unref) cleanupTimer.unref();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `${ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();

    const record = requestCounts.get(key) || { count: 0, startTime: now };

    if (now - record.startTime > windowMs) {
      record.count = 1;
      record.startTime = now;
    } else {
      record.count += 1;
    }

    requestCounts.set(key, record);

    if (record.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: message
      });
    }

    next();
  };
}

module.exports = {
  createRateLimiter
};
