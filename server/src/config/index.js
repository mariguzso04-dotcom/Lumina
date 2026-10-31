const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  dbType: (process.env.DB_TYPE || 'sqlite').toLowerCase(), // 'sqlite' | 'postgres'
  
  // Configuración SQLite
  sqlitePath: process.env.SQLITE_PATH || path.resolve(__dirname, '../../../database/sqlite/lumina.db'),
  
  // Configuración PostgreSQL
  pg: {
    connectionString: process.env.DATABASE_URL || null,
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432', 10),
    database: process.env.PG_DATABASE || 'lumina',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false
  },
  
  // Seguridad y JWT
  jwtSecret: process.env.JWT_SECRET || 'lumina_refugio_secreto_dev_key_2026_xyz987',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173'
};

module.exports = config;
