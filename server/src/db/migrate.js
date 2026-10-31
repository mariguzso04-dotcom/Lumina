const fs = require('fs');
const path = require('path');
const config = require('../config');
const { createAdapter } = require('./index');

async function runMigration() {
  const args = process.argv.slice(2);
  let engine = config.dbType;
  
  for (const arg of args) {
    if (arg.startsWith('--engine=')) {
      engine = arg.split('=')[1].toLowerCase();
    }
  }

  console.log(`[Migraciones LÚMINA] Ejecutando migración para motor: ${engine.toUpperCase()}`);

  const schemaFile = engine === 'postgres' 
    ? path.join(__dirname, 'schemas', 'postgres_schema.sql')
    : path.join(__dirname, 'schemas', 'sqlite_schema.sql');

  if (!fs.existsSync(schemaFile)) {
    throw new Error(`Archivo de esquema no encontrado: ${schemaFile}`);
  }

  const sqlScript = fs.readFileSync(schemaFile, 'utf8');
  const adapter = createAdapter(engine);
  
  try {
    await adapter.connect();
    await adapter.exec(sqlScript);
    console.log(`[Migraciones LÚMINA] ¡Migración completada con éxito en ${engine.toUpperCase()}!`);
  } catch (error) {
    console.error(`[Migraciones LÚMINA] Error al ejecutar migración en ${engine}:`, error);
    process.exit(1);
  } finally {
    await adapter.close();
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = runMigration;
