const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class SQLiteAdapter {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          return reject(new Error(`Error al conectar con SQLite: ${err.message}`));
        }
        // Activar claves foráneas en SQLite
        this.db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
          if (pragmaErr) {
            return reject(new Error(`Error al activar foreign_keys: ${pragmaErr.message}`));
          }
          resolve(this);
        });
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  async exec(sqlScript) {
    return new Promise((resolve, reject) => {
      this.db.exec(sqlScript, (err) => {
        if (err) return reject(err);
        resolve(true);
      });
    });
  }

  async close() {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      this.db.close((err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}

module.exports = SQLiteAdapter;
