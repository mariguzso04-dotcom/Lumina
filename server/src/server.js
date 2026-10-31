const app = require('./app');
const config = require('./config');
const { getDB } = require('./db');

async function startServer() {
  try {
    // Inicializar conexión a la base de datos configurada
    await getDB();

    app.listen(config.port, () => {
      console.log('====================================================');
      console.log(`  🌙 Servidor LÚMINA activo en el puerto ${config.port}`);
      console.log(`  🌱 Motor de base de datos: ${config.dbType.toUpperCase()}`);
      console.log(`  ✨ URL Base: http://localhost:${config.port}/api`);
      console.log('====================================================');
    });
  } catch (error) {
    console.error('Error al iniciar el servidor LÚMINA:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = startServer;
