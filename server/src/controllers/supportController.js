const { getDB } = require('../db');

async function listSupport(req, res, next) {
  try {
    const { country, country_code, emergency } = req.query;
    const db = await getDB();

    let sql = 'SELECT * FROM support_resources WHERE is_active = 1';
    const params = [];

    if (country_code) {
      sql += ' AND country_code = ?';
      params.push(country_code.toUpperCase());
    } else if (country) {
      sql += ' AND (country LIKE ? OR country_code LIKE ?)';
      params.push(`%${country}%`, `%${country}%`);
    }

    if (emergency !== undefined) {
      sql += ' AND is_emergency = ?';
      params.push(emergency === 'true' || emergency === '1' ? 1 : 0);
    }

    sql += ' ORDER BY is_emergency DESC, country ASC, service_name ASC';
    const resources = await db.all(sql, params);

    const formatted = resources.map(r => ({
      ...r,
      is_emergency: Boolean(r.is_emergency),
      is_active: Boolean(r.is_active)
    }));

    res.json({
      success: true,
      disclaimer: 'LÚMINA es una herramienta digital de acompañamiento y bienestar personal. No proporciona atención médica, psicológica de urgencia ni diagnósticos clínicos. Si estás en una situación de peligro inmediato o experimentás pensamientos de hacerte daño, por favor contactá de inmediato con las líneas gratuitas de ayuda o los servicios de urgencia de tu localidad.',
      data: formatted
    });
  } catch (err) {
    next(err);
  }
}

async function listCountries(req, res, next) {
  try {
    const db = await getDB();
    const rows = await db.all(
      'SELECT DISTINCT country, country_code FROM support_resources WHERE is_active = 1 ORDER BY country ASC'
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listSupport,
  listCountries
};
