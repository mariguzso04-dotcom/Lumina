const crypto = require('crypto');
const { getDB } = require('../db');

const ALLOWED_EMOTIONS = [
  'Alegría', 'Tranquilidad', 'Tristeza', 'Ansiedad',
  'Estrés', 'Enojo', 'Miedo', 'Confusión',
  'Soledad', 'Agotamiento', 'Esperanza', 'Gratitud'
];

async function listMoods(req, res, next) {
  try {
    const { emotion, from, to, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const db = await getDB();

    let sql = 'SELECT * FROM mood_entries WHERE user_id = ?';
    const params = [req.user.id];

    if (from) {
      sql += ' AND recorded_at >= ?';
      params.push(from);
    }
    if (to) {
      sql += ' AND recorded_at <= ?';
      params.push(to);
    }

    sql += ' ORDER BY recorded_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), offset);

    const rows = await db.all(sql, params);

    // Formatear JSONs guardados
    let formatted = rows.map(r => {
      let emotions = [];
      let factors = [];
      let helpful = [];
      try { emotions = JSON.parse(r.emotions); } catch (e) { emotions = [r.emotions]; }
      try { factors = JSON.parse(r.factors); } catch (e) {}
      try { helpful = JSON.parse(r.helpful_activities); } catch (e) {}
      return {
        ...r,
        emotions,
        factors,
        helpful_activities: helpful
      };
    });

    if (emotion) {
      formatted = formatted.filter(entry => entry.emotions.includes(emotion));
    }

    const totalCountRow = await db.get(
      'SELECT COUNT(*) as total FROM mood_entries WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      data: formatted,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: totalCountRow ? totalCountRow.total : formatted.length
      }
    });
  } catch (err) {
    next(err);
  }
}

async function createMood(req, res, next) {
  try {
    const {
      emotions,
      intensity,
      factors = [],
      context_note = '',
      helpful_activities = [],
      post_action = 'terminar',
      recorded_at
    } = req.body;

    if (!emotions || !Array.isArray(emotions) || emotions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Seleccioná al menos una emoción que refleje tu momento.'
      });
    }

    // Validar escala 1 a 5
    const parsedIntensity = parseInt(intensity, 10);
    if (isNaN(parsedIntensity) || parsedIntensity < 1 || parsedIntensity > 5) {
      return res.status(400).json({
        success: false,
        error: 'La intensidad debe ser un valor entre 1 y 5.'
      });
    }

    const entryId = 'mood_' + crypto.randomUUID();
    const dateToRecord = recorded_at ? new Date(recorded_at).toISOString() : new Date().toISOString();

    const db = await getDB();
    await db.run(
      `INSERT INTO mood_entries 
       (id, user_id, recorded_at, emotions, intensity, factors, context_note, helpful_activities, post_action) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entryId,
        req.user.id,
        dateToRecord,
        JSON.stringify(emotions),
        parsedIntensity,
        JSON.stringify(factors),
        context_note ? context_note.trim() : null,
        JSON.stringify(helpful_activities),
        post_action
      ]
    );

    const created = await db.get('SELECT * FROM mood_entries WHERE id = ?', [entryId]);

    res.status(201).json({
      success: true,
      message: 'Tu registro emocional ha sido guardado con cuidado.',
      data: {
        ...created,
        emotions,
        factors,
        helpful_activities
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getMoodById(req, res, next) {
  try {
    const { id } = req.params;
    const db = await getDB();
    const entry = await db.get(
      'SELECT * FROM mood_entries WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Registro emocional no encontrado o no pertenece a tu cuenta.'
      });
    }

    let emotions = [];
    let factors = [];
    let helpful = [];
    try { emotions = JSON.parse(entry.emotions); } catch (e) { emotions = [entry.emotions]; }
    try { factors = JSON.parse(entry.factors); } catch (e) {}
    try { helpful = JSON.parse(entry.helpful_activities); } catch (e) {}

    res.json({
      success: true,
      data: {
        ...entry,
        emotions,
        factors,
        helpful_activities: helpful
      }
    });
  } catch (err) {
    next(err);
  }
}

async function updateMood(req, res, next) {
  try {
    const { id } = req.params;
    const { emotions, intensity, factors, context_note, helpful_activities, post_action } = req.body;
    const db = await getDB();

    const existing = await db.get(
      'SELECT id FROM mood_entries WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Registro no encontrado o no pertenece a tu cuenta.'
      });
    }

    const updates = [];
    const params = [];

    if (emotions && Array.isArray(emotions)) {
      updates.push('emotions = ?');
      params.push(JSON.stringify(emotions));
    }
    if (intensity !== undefined) {
      const parsedIntensity = parseInt(intensity, 10);
      if (parsedIntensity >= 1 && parsedIntensity <= 5) {
        updates.push('intensity = ?');
        params.push(parsedIntensity);
      }
    }
    if (factors !== undefined) {
      updates.push('factors = ?');
      params.push(JSON.stringify(factors));
    }
    if (context_note !== undefined) {
      updates.push('context_note = ?');
      params.push(context_note ? context_note.trim() : null);
    }
    if (helpful_activities !== undefined) {
      updates.push('helpful_activities = ?');
      params.push(JSON.stringify(helpful_activities));
    }
    if (post_action !== undefined) {
      updates.push('post_action = ?');
      params.push(post_action);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id, req.user.id);

    await db.run(
      `UPDATE mood_entries SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );

    return getMoodById(req, res, next);
  } catch (err) {
    next(err);
  }
}

async function deleteMood(req, res, next) {
  try {
    const { id } = req.params;
    const db = await getDB();
    const result = await db.run(
      'DELETE FROM mood_entries WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Registro no encontrado o ya eliminado.'
      });
    }

    res.json({
      success: true,
      message: 'El registro emocional ha sido eliminado.'
    });
  } catch (err) {
    next(err);
  }
}

async function getStatistics(req, res, next) {
  try {
    const db = await getDB();
    const entries = await db.all(
      'SELECT * FROM mood_entries WHERE user_id = ? ORDER BY recorded_at ASC',
      [req.user.id]
    );

    const emotionCounts = {};
    ALLOWED_EMOTIONS.forEach(e => { emotionCounts[e] = 0; });

    let totalIntensity = 0;
    const intensityDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const factorCounts = {};
    const timeline = [];

    entries.forEach(entry => {
      totalIntensity += entry.intensity;
      intensityDistribution[entry.intensity] = (intensityDistribution[entry.intensity] || 0) + 1;

      let emotions = [];
      let factors = [];
      try { emotions = JSON.parse(entry.emotions); } catch (e) { emotions = [entry.emotions]; }
      try { factors = JSON.parse(entry.factors); } catch (e) {}

      emotions.forEach(em => {
        emotionCounts[em] = (emotionCounts[em] || 0) + 1;
      });

      factors.forEach(f => {
        factorCounts[f] = (factorCounts[f] || 0) + 1;
      });

      timeline.push({
        id: entry.id,
        date: entry.recorded_at,
        intensity: entry.intensity,
        emotions
      });
    });

    const averageIntensity = entries.length > 0
      ? (totalIntensity / entries.length).toFixed(1)
      : 0;

    // Los factores más frecuentes ordenados
    const topFactors = Object.entries(factorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({
      success: true,
      data: {
        disclaimer: 'Estas estadísticas representan exclusivamente tus registros personales de bienestar y no constituyen diagnósticos médicos ni predicciones clínicas.',
        total_entries: entries.length,
        average_intensity: parseFloat(averageIntensity),
        emotion_counts: emotionCounts,
        intensity_distribution: intensityDistribution,
        top_factors: topFactors,
        timeline
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMoods,
  createMood,
  getMoodById,
  updateMood,
  deleteMood,
  getStatistics
};
