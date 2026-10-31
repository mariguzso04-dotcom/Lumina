const crypto = require('crypto');
const { getDB } = require('../db');

async function listEntries(req, res, next) {
  try {
    const { search, mood, favorite, is_draft, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const db = await getDB();

    let sql = 'SELECT id, user_id, title, mood_tag, is_favorite, is_draft, created_at, updated_at FROM journal_entries WHERE user_id = ?';
    const params = [req.user.id];

    if (favorite === 'true' || favorite === '1') {
      sql += ' AND is_favorite = 1';
    }

    if (is_draft !== undefined) {
      sql += ' AND is_draft = ?';
      params.push(is_draft === 'true' || is_draft === '1' ? 1 : 0);
    }

    if (mood) {
      sql += ' AND mood_tag = ?';
      params.push(mood);
    }

    if (search && search.trim()) {
      sql += ' AND (title LIKE ? OR content LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), offset);

    const entries = await db.all(sql, params);

    // Omitir texto completo en listados para rapidez y privacidad, o incluir resumen breve
    const formatted = entries.map(e => ({
      ...e,
      is_favorite: Boolean(e.is_favorite),
      is_draft: Boolean(e.is_draft)
    }));

    const countRow = await db.get(
      'SELECT COUNT(*) as total FROM journal_entries WHERE user_id = ?',
      [req.user.id]
    );

    res.json({
      success: true,
      data: formatted,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total: countRow ? countRow.total : formatted.length
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getEntryById(req, res, next) {
  try {
    const { id } = req.params;
    const db = await getDB();
    const entry = await db.get(
      'SELECT * FROM journal_entries WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Entrada de diario no encontrada o no pertenece a tu cuenta.'
      });
    }

    res.json({
      success: true,
      data: {
        ...entry,
        is_favorite: Boolean(entry.is_favorite),
        is_draft: Boolean(entry.is_draft)
      }
    });
  } catch (err) {
    next(err);
  }
}

async function createEntry(req, res, next) {
  try {
    const { title, content, mood_tag, is_favorite = false, is_draft = false } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, asigná un título o palabra a tu entrada.'
      });
    }

    if (!is_draft && (!content || !content.trim())) {
      return res.status(400).json({
        success: false,
        error: 'El contenido del diario no puede estar vacío a menos que sea un borrador.'
      });
    }

    const entryId = 'jnl_' + crypto.randomUUID();
    const db = await getDB();

    await db.run(
      `INSERT INTO journal_entries 
       (id, user_id, title, content, mood_tag, is_favorite, is_draft, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        entryId,
        req.user.id,
        title.trim(),
        content ? content.trim() : '',
        mood_tag || null,
        is_favorite ? 1 : 0,
        is_draft ? 1 : 0
      ]
    );

    const created = await db.get('SELECT * FROM journal_entries WHERE id = ?', [entryId]);

    res.status(201).json({
      success: true,
      message: is_draft ? 'Borrador guardado con éxito.' : 'Tu entrada ha sido resguardada en tu espacio privado.',
      data: {
        ...created,
        is_favorite: Boolean(created.is_favorite),
        is_draft: Boolean(created.is_draft)
      }
    });
  } catch (err) {
    next(err);
  }
}

async function updateEntry(req, res, next) {
  try {
    const { id } = req.params;
    const { title, content, mood_tag, is_favorite, is_draft } = req.body;
    const db = await getDB();

    const existing = await db.get(
      'SELECT id FROM journal_entries WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Entrada no encontrada o no pertenece a tu cuenta.'
      });
    }

    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title.trim());
    }
    if (content !== undefined) {
      updates.push('content = ?');
      params.push(content.trim());
    }
    if (mood_tag !== undefined) {
      updates.push('mood_tag = ?');
      params.push(mood_tag || null);
    }
    if (is_favorite !== undefined) {
      updates.push('is_favorite = ?');
      params.push(is_favorite ? 1 : 0);
    }
    if (is_draft !== undefined) {
      updates.push('is_draft = ?');
      params.push(is_draft ? 1 : 0);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id, req.user.id);

    await db.run(
      `UPDATE journal_entries SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );

    return getEntryById(req, res, next);
  } catch (err) {
    next(err);
  }
}

async function toggleFavorite(req, res, next) {
  try {
    const { id } = req.params;
    const db = await getDB();
    const entry = await db.get(
      'SELECT id, is_favorite FROM journal_entries WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Entrada no encontrada.'
      });
    }

    const newFavorite = entry.is_favorite ? 0 : 1;
    await db.run(
      'UPDATE journal_entries SET is_favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [newFavorite, id, req.user.id]
    );

    res.json({
      success: true,
      message: newFavorite ? 'Marcada como favorita.' : 'Desmarcada de favoritos.',
      data: { id, is_favorite: Boolean(newFavorite) }
    });
  } catch (err) {
    next(err);
  }
}

async function deleteEntry(req, res, next) {
  try {
    const { id } = req.params;
    const db = await getDB();
    const result = await db.run(
      'DELETE FROM journal_entries WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: 'Entrada no encontrada o ya eliminada.'
      });
    }

    res.json({
      success: true,
      message: 'La entrada ha sido eliminada permanentemente de tu diario.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listEntries,
  getEntryById,
  createEntry,
  updateEntry,
  toggleFavorite,
  deleteEntry
};
