const express = require('express');
const cors = require('cors');
const config = require('./config');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const moodRoutes = require('./routes/moodRoutes');
const journalRoutes = require('./routes/journalRoutes');
const musicRoutes = require('./routes/musicRoutes');
const activityRoutes = require('./routes/activityRoutes');
const supportRoutes = require('./routes/supportRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Configuración de CORS segura
app.use(cors({
  origin: (origin, callback) => {
    // Permitir solicitudes locales de desarrollo, despliegues en Netlify y herramientas de prueba
    if (
      !origin || 
      config.corsOrigin === '*' ||
      origin === config.corsOrigin || 
      origin.startsWith('http://localhost:') || 
      origin.endsWith('.netlify.app') ||
      origin.includes('netlify.app')
    ) {
      return callback(null, true);
    }
    return callback(new Error('Bloqueado por política CORS de LÚMINA'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsers con límites razonables
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Cabeceras de seguridad básicas
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Endpoint de verificación de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    application: 'LÚMINA API',
    database_engine: config.dbType,
    timestamp: new Date().toISOString()
  });
});

// Enrutamiento modular
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);

// Manejadores de rutas no encontradas y errores globales
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
