/**
 * LÚMINA — Ejecutable Principal en la Carpeta Raíz
 * 
 * Permite iniciar la plataforma completa con:
 *   node index.js
 * o
 *   npm start
 * 
 * Capacidades:
 * - Sirve la API REST de LÚMINA bajo el prefijo /api
 * - Sirve la aplicación cliente frontend (React/Vite) desde la carpeta dist
 * - Enruta automáticamente cualquier solicitud web al index.html de la SPA
 */

const path = require('path');
const fs = require('fs');

// Permitir resolver módulos instalados en la carpeta server
module.paths.push(path.join(__dirname, 'server', 'node_modules'));

const express = require('express');
const app = require('./server/src/app');
const config = require('./server/src/config');
const { getDB } = require('./server/src/db');

async function startLumina() {
  try {
    // 1. Inicializar base de datos configurada (SQLite o PostgreSQL)
    await getDB();

    // 2. Servir frontend compilado si existe (dist en raíz o client/dist)
    const rootDist = path.resolve(__dirname, 'dist');
    const clientDist = path.resolve(__dirname, 'client/dist');
    const publicPath = fs.existsSync(rootDist) ? rootDist : (fs.existsSync(clientDist) ? clientDist : null);

    if (publicPath) {
      console.log(`✨ Sirviendo aplicación web desde: ${publicPath}`);
      app.use(express.static(publicPath));

      // Ruta de respaldo para SPA (React Router / navegación interna)
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
          return next();
        }
        res.sendFile(path.join(publicPath, 'index.html'));
      });
    }

    // 3. Iniciar escucha en el puerto configurado
    const server = app.listen(config.port, () => {
      console.log('====================================================');
      console.log(`  🌙 LÚMINA activo en el puerto ${config.port}`);
      console.log(`  🌱 Motor de base de datos: ${config.dbType.toUpperCase()}`);
      console.log(`  🌐 Interfaz Web: http://localhost:${config.port}`);
      console.log(`  ✨ API Base:     http://localhost:${config.port}/api`);
      console.log('====================================================');
    });

    return server;
  } catch (error) {
    console.error('Error al iniciar LÚMINA desde index.js:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startLumina();
}

module.exports = startLumina;
