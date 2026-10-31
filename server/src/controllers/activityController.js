const crypto = require('crypto');
const { getDB } = require('../db');

async function listActivities(req, res, next) {
  try {
    const { category, emotion } = req.query;
    const db = await getDB();

    let sql = 'SELECT * FROM wellness_activities WHERE is_active = 1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY duration_minutes ASC';
    const rows = await db.all(sql, params);

    let formatted = rows.map(r => {
      let instructions = [];
      let recommendedFor = [];
      try { instructions = JSON.parse(r.instructions); } catch (e) { instructions = [r.instructions]; }
      try { recommendedFor = JSON.parse(r.recommended_for); } catch (e) {}

      return {
        ...r,
        instructions,
        recommended_for: recommendedFor
      };
    });

    if (emotion) {
      formatted = formatted.filter(act => 
        act.recommended_for.some(em => em.toLowerCase() === emotion.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
}

async function recordCompletion(req, res, next) {
  try {
    const { activity_id, duration_seconds = 0 } = req.body;

    if (!activity_id) {
      return res.status(400).json({ success: false, error: 'Identificador de actividad requerido.' });
    }

    const db = await getDB();
    const activity = await db.get('SELECT id, title FROM wellness_activities WHERE id = ?', [activity_id]);
    if (!activity) {
      return res.status(404).json({ success: false, error: 'Actividad no encontrada.' });
    }

    const historyId = 'hist_' + crypto.randomUUID();
    await db.run(
      'INSERT INTO activity_history (id, user_id, activity_id, completed_at, duration_seconds) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)',
      [historyId, req.user.id, activity_id, parseInt(duration_seconds, 10) || 0]
    );

    res.status(201).json({
      success: true,
      message: '¡Excelente! Dedicarte este momento es un paso valioso para tu bienestar.',
      data: {
        id: historyId,
        activity_id,
        activity_title: activity.title,
        completed_at: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getUserHistory(req, res, next) {
  try {
    const db = await getDB();
    const sql = `
      SELECT h.*, a.title, a.category, a.duration_minutes
      FROM activity_history h
      INNER JOIN wellness_activities a ON h.activity_id = a.id
      WHERE h.user_id = ?
      ORDER BY h.completed_at DESC
      LIMIT 50
    `;
    const history = await db.all(sql, [req.user.id]);

    res.json({
      success: true,
      data: history
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listActivities,
  recordCompletion,
  getUserHistory
};
