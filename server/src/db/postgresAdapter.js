const { Pool } = require('pg');

class PostgresAdapter {
  constructor(options) {
    this.options = options;
    this.pool = null;
  }

  async connect() {
    if (this.options.connectionString) {
      this.pool = new Pool({
        connectionString: this.options.connectionString,
        ssl: this.options.ssl
      });
    } else {
      this.pool = new Pool({
        host: this.options.host,
        port: this.options.port,
        database: this.options.database,
        user: this.options.user,
        password: this.options.password,
        ssl: this.options.ssl
      });
    }

    // Probar conexión inicial
    const client = await this.pool.connect();
    client.release();
    return this;
  }

  // Convierte marcadores '?' en '$1, $2, ...' para compatibilidad transparente con Postgres
  formatQuery(sql) {
    let paramIndex = 1;
    return sql.replace(/\?/g, () => `$${paramIndex++}`);
  }

  async get(sql, params = []) {
    const formattedSql = this.formatQuery(sql);
    const result = await this.pool.query(formattedSql, params);
    return result.rows[0] || null;
  }

  async all(sql, params = []) {
    const formattedSql = this.formatQuery(sql);
    const result = await this.pool.query(formattedSql, params);
    return result.rows || [];
  }

  async run(sql, params = []) {
    const formattedSql = this.formatQuery(sql);
    const result = await this.pool.query(formattedSql, params);
    return { changes: result.rowCount, rowCount: result.rowCount };
  }

  async exec(sqlScript) {
    await this.pool.query(sqlScript);
    return true;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

module.exports = PostgresAdapter;
