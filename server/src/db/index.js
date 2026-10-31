const config = require('../config');
const SQLiteAdapter = require('./sqliteAdapter');
const PostgresAdapter = require('./postgresAdapter');

let dbInstance = null;

function createAdapter(engine = config.dbType) {
  if (engine === 'postgres') {
    return new PostgresAdapter(config.pg);
  }
  return new SQLiteAdapter(config.sqlitePath);
}

async function getDB(engine = config.dbType) {
  if (!dbInstance) {
    dbInstance = createAdapter(engine);
    await dbInstance.connect();
    console.log(`[LÚMINA DB] Capa de datos inicializada usando motor: ${engine.toUpperCase()}`);
  }
  return dbInstance;
}

// Para reinicializar en pruebas o cambio de motor
async function resetDBConnection() {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}

module.exports = {
  getDB,
  createAdapter,
  resetDBConnection
};
