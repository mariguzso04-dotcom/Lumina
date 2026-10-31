const crypto = require('crypto');
const { getDB } = require('../db');
const { searchMusic } = require('../services/musicSearchService');

// ===================================================================
// SECCIÓN ORIGINAL: Música y Paisajes Sonoros Ambientales (100% CONSERVADA)
// ===================================================================

async function listTracks(req, res, next) {
  try {
    const { category } = req.query;
    const db = await getDB();

    let sql = 'SELECT * FROM music_tracks WHERE is_active = 1';
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY title ASC';
    const tracks = await db.all(sql, params);

    let favoriteTrackIds = new Set();
    if (req.user) {
      const favs = await db.all(
        'SELECT track_id FROM music_favorites WHERE user_id = ?',
        [req.user.id]
      );
      favoriteTrackIds = new Set(favs.map(f => f.track_id));
    }

    const formatted = tracks.map(t => ({
      ...t,
      is_soundscape: Boolean(t.is_soundscape),
      is_active: Boolean(t.is_active),
      is_favorite: favoriteTrackIds.has(t.id)
    }));

    res.json({
      success: true,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
}

async function listCategories(req, res, next) {
  try {
    const db = await getDB();
    const rows = await db.all(
      'SELECT DISTINCT category FROM music_tracks WHERE is_active = 1 ORDER BY category ASC'
    );
    const categories = rows.map(r => r.category);

    res.json({
      success: true,
      data: categories
    });
  } catch (err) {
    next(err);
  }
}

async function listFavorites(req, res, next) {
  try {
    const db = await getDB();
    const sql = `
      SELECT t.* FROM music_tracks t
      INNER JOIN music_favorites f ON t.id = f.track_id
      WHERE f.user_id = ? AND t.is_active = 1
      ORDER BY f.created_at DESC
    `;
    const tracks = await db.all(sql, [req.user.id]);

    const formatted = tracks.map(t => ({
      ...t,
      is_soundscape: Boolean(t.is_soundscape),
      is_active: Boolean(t.is_active),
      is_favorite: true
    }));

    res.json({
      success: true,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
}

async function addFavorite(req, res, next) {
  try {
    const { trackId } = req.params;
    const db = await getDB();

    const track = await db.get('SELECT id FROM music_tracks WHERE id = ?', [trackId]);
    if (!track) {
      return res.status(404).json({ success: false, error: 'Pista musical no encontrada.' });
    }

    const favId = 'fav_' + crypto.randomUUID();
    await db.run(
      'INSERT OR IGNORE INTO music_favorites (id, user_id, track_id) VALUES (?, ?, ?)',
      [favId, req.user.id, trackId]
    );

    res.json({
      success: true,
      message: 'Añadida a tus favoritos musicales.',
      data: { track_id: trackId, is_favorite: true }
    });
  } catch (err) {
    next(err);
  }
}

async function removeFavorite(req, res, next) {
  try {
    const { trackId } = req.params;
    const db = await getDB();

    await db.run(
      'DELETE FROM music_favorites WHERE user_id = ? AND track_id = ?',
      [req.user.id, trackId]
    );

    res.json({
      success: true,
      message: 'Eliminada de tus favoritos.',
      data: { track_id: trackId, is_favorite: false }
    });
  } catch (err) {
    next(err);
  }
}

// ===================================================================
// NUEVA SECCIÓN: "MI MÚSICA" (Búsqueda Spotify/YouTube, Artistas, Canciones y Listas)
// ===================================================================

// A. Buscar música y artistas en Spotify y YouTube
async function searchMusicEndpoint(req, res, next) {
  try {
    const { q, platform = 'all' } = req.query;
    const results = await searchMusic(q, platform);
    res.json({
      success: true,
      data: results
    });
  } catch (err) {
    next(err);
  }
}

// B. Artistas favoritos
async function listMyArtists(req, res, next) {
  try {
    const db = await getDB();
    const rows = await db.all(
      'SELECT * FROM favorite_artists WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    const formatted = rows.map(r => {
      let genres = [];
      try { genres = JSON.parse(r.genres); } catch (e) {}
      return { ...r, genres };
    });

    res.json({
      success: true,
      data: formatted
    });
  } catch (err) {
    next(err);
  }
}

async function addMyArtist(req, res, next) {
  try {
    const { artist_name, platform = 'spotify', external_id, image_url, genres = [], external_url } = req.body;
    if (!artist_name || !artist_name.trim()) {
      return res.status(400).json({ success: false, error: 'El nombre del artista es obligatorio.' });
    }

    const db = await getDB();
    const id = 'fav_art_' + crypto.randomUUID();
    const cleanGenres = typeof genres === 'string' ? genres : JSON.stringify(genres);

    await db.run(
      `INSERT OR REPLACE INTO favorite_artists 
       (id, user_id, artist_name, platform, external_id, image_url, genres, external_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        req.user.id,
        artist_name.trim(),
        platform,
        external_id || null,
        image_url || null,
        cleanGenres,
        external_url || null
      ]
    );

    res.status(201).json({
      success: true,
      message: `¡${artist_name} añadido a tus artistas favoritos!`,
      data: { id, artist_name, platform, external_id, image_url, genres }
    });
  } catch (err) {
    next(err);
  }
}

async function removeMyArtist(req, res, next) {
  try {
    const { id } = req.params;
    const db = await getDB();

    await db.run(
      'DELETE FROM favorite_artists WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Artista removido de tus favoritos.'
    });
  } catch (err) {
    next(err);
  }
}

// C. Canciones favoritas (Spotify / YouTube)
async function listMyTracks(req, res, next) {
  try {
    const db = await getDB();
    const rows = await db.all(
      'SELECT * FROM user_favorite_tracks WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    next(err);
  }
}

async function addMyTrack(req, res, next) {
  try {
    const { title, artist, album, platform = 'spotify', external_id, cover_url, duration_seconds = 0, preview_url, external_url } = req.body;
    if (!title || !artist || !external_id) {
      return res.status(400).json({ success: false, error: 'Título, artista e identificador externo son requeridos.' });
    }

    const db = await getDB();
    const id = 'fav_trk_' + crypto.randomUUID();

    await db.run(
      `INSERT OR REPLACE INTO user_favorite_tracks 
       (id, user_id, title, artist, album, platform, external_id, cover_url, duration_seconds, preview_url, external_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        req.user.id,
        title.trim(),
        artist.trim(),
        album ? album.trim() : null,
        platform,
        external_id,
        cover_url || null,
        duration_seconds || 0,
        preview_url || null,
        external_url || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Canción guardada en tus favoritas.',
      data: { id, title, artist, album, platform, external_id, cover_url }
    });
  } catch (err) {
    next(err);
  }
}

async function removeMyTrack(req, res, next) {
  try {
    const { id } = req.params;
    const db = await getDB();

    await db.run(
      'DELETE FROM user_favorite_tracks WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    res.json({
      success: true,
      message: 'Canción eliminada de tus favoritas.'
    });
  } catch (err) {
    next(err);
  }
}

// D. Listas Personales (Playlists)
async function listPlaylists(req, res, next) {
  try {
    const db = await getDB();
    const playlists = await db.all(
      `SELECT p.*, COUNT(t.id) as track_count
       FROM user_playlists p
       LEFT JOIN playlist_tracks t ON p.id = t.playlist_id
       WHERE p.user_id = ?
       GROUP BY p.id
       ORDER BY p.updated_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: playlists
    });
  } catch (err) {
    next(err);
  }
}

async function createPlaylist(req, res, next) {
  try {
    const { name, description = '', cover_url = null } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'El nombre de la lista es obligatorio.' });
    }

    const db = await getDB();
    const id = 'pl_' + crypto.randomUUID();

    await db.run(
      `INSERT INTO user_playlists (id, user_id, name, description, cover_url)
       VALUES (?, ?, ?, ?, ?)`,
      [id, req.user.id, name.trim(), description.trim(), cover_url]
    );

    res.status(201).json({
      success: true,
      message: 'Lista de reproducción creada exitosamente.',
      data: { id, name: name.trim(), description: description.trim(), track_count: 0 }
    });
  } catch (err) {
    next(err);
  }
}

async function getPlaylist(req, res, next) {
  try {
    const { id } = req.params;
    const db = await getDB();

    const playlist = await db.get(
      'SELECT * FROM user_playlists WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Lista no encontrada o no pertenece a tu cuenta.' });
    }

    const tracks = await db.all(
      'SELECT * FROM playlist_tracks WHERE playlist_id = ? ORDER BY position ASC, added_at ASC',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...playlist,
        tracks
      }
    });
  } catch (err) {
    next(err);
  }
}

async function updatePlaylist(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const db = await getDB();

    const existing = await db.get('SELECT id FROM user_playlists WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Lista no encontrada.' });
    }

    const updates = [];
    const params = [];
    if (name && name.trim()) { updates.push('name = ?'); params.push(name.trim()); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description.trim()); }
    updates.push('updated_at = CURRENT_TIMESTAMP');

    params.push(id, req.user.id);
    await db.run(`UPDATE user_playlists SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, params);

    const updated = await db.get('SELECT * FROM user_playlists WHERE id = ?', [id]);
    res.json({ success: true, message: 'Lista actualizada.', data: updated });
  } catch (err) {
    next(err);
  }
}

async function deletePlaylist(req, res, next) {
  try {
    const { id } = req.params;
    const db = await getDB();

    const result = await db.run('DELETE FROM user_playlists WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Lista no encontrada o ya eliminada.' });
    }

    res.json({ success: true, message: 'Lista eliminada correctamente.' });
  } catch (err) {
    next(err);
  }
}

async function addTrackToPlaylist(req, res, next) {
  try {
    const { id: playlistId } = req.params;
    const { title, artist, album, platform = 'spotify', external_id, cover_url, duration_seconds = 0, preview_url, external_url } = req.body;

    if (!title || !artist || !external_id) {
      return res.status(400).json({ success: false, error: 'Datos de la canción incompletos.' });
    }

    const db = await getDB();
    const playlist = await db.get('SELECT id FROM user_playlists WHERE id = ? AND user_id = ?', [playlistId, req.user.id]);
    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Lista de reproducción no encontrada.' });
    }

    const trackId = 'plt_' + crypto.randomUUID();
    await db.run(
      `INSERT OR REPLACE INTO playlist_tracks 
       (id, playlist_id, title, artist, album, platform, external_id, cover_url, duration_seconds, preview_url, external_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trackId,
        playlistId,
        title.trim(),
        artist.trim(),
        album ? album.trim() : null,
        platform,
        external_id,
        cover_url || null,
        duration_seconds || 0,
        preview_url || null,
        external_url || null
      ]
    );

    await db.run('UPDATE user_playlists SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [playlistId]);

    res.status(201).json({
      success: true,
      message: 'Canción agregada a la lista con éxito.'
    });
  } catch (err) {
    next(err);
  }
}

async function removeTrackFromPlaylist(req, res, next) {
  try {
    const { id: playlistId, trackId } = req.params;
    const db = await getDB();

    const playlist = await db.get('SELECT id FROM user_playlists WHERE id = ? AND user_id = ?', [playlistId, req.user.id]);
    if (!playlist) {
      return res.status(404).json({ success: false, error: 'Lista de reproducción no encontrada.' });
    }

    await db.run('DELETE FROM playlist_tracks WHERE id = ? AND playlist_id = ?', [trackId, playlistId]);

    res.json({
      success: true,
      message: 'Canción eliminada de la lista.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  // Originales
  listTracks,
  listCategories,
  listFavorites,
  addFavorite,
  removeFavorite,

  // Nuevos: Mi Música
  searchMusicEndpoint,
  listMyArtists,
  addMyArtist,
  removeMyArtist,
  listMyTracks,
  addMyTrack,
  removeMyTrack,
  listPlaylists,
  createPlaylist,
  getPlaylist,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist
};
