const crypto = require('crypto');
const { getDB } = require('../db');

// Métricas agregadas anónimas (SIN acceso a diarios privados ni notas personales)
async function getMetrics(req, res, next) {
  try {
    const db = await getDB();
    const userCount = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const moodCount = await db.get('SELECT COUNT(*) as count FROM mood_entries');
    const journalCount = await db.get('SELECT COUNT(*) as count FROM journal_entries');
    const activityCount = await db.get('SELECT COUNT(*) as count FROM activity_history');
    const tracksCount = await db.get('SELECT COUNT(*) as count FROM music_tracks');
    const supportCount = await db.get('SELECT COUNT(*) as count FROM support_resources');

    res.json({
      success: true,
      privacy_notice: 'Por diseño y compromiso ético de LÚMINA, los administradores NO tienen acceso a los diarios privados ni al contenido personal de los usuarios.',
      data: {
        total_registered_users: userCount ? userCount.count : 0,
        total_mood_checkins: moodCount ? moodCount.count : 0,
        total_journal_entries_count_only: journalCount ? journalCount.count : 0,
        total_activities_completed: activityCount ? activityCount.count : 0,
        total_music_tracks: tracksCount ? tracksCount.count : 0,
        total_support_resources: supportCount ? supportCount.count : 0
      }
    });
  } catch (err) {
    next(err);
  }
}

// Gestión de actividades de bienestar
async function createActivity(req, res, next) {
  try {
    const { title, description, category, duration_minutes, instructions, recommended_for } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ success: false, error: 'Título, descripción y categoría son requeridos.' });
    }

    const id = 'act_' + crypto.randomUUID();
    const db = await getDB();
    await db.run(
      `INSERT INTO wellness_activities (id, title, description, category, duration_minutes, instructions, recommended_for, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        id,
        title.trim(),
        description.trim(),
        category.trim(),
        parseInt(duration_minutes, 10) || 5,
        typeof instructions === 'string' ? instructions : JSON.stringify(instructions || []),
        typeof recommended_for === 'string' ? recommended_for : JSON.stringify(recommended_for || [])
      ]
    );

    const created = await db.get('SELECT * FROM wellness_activities WHERE id = ?', [id]);
    res.status(201).json({ success: true, message: 'Actividad creada exitosamente.', data: created });
  } catch (err) {
    next(err);
  }
}

async function updateActivity(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, category, duration_minutes, instructions, recommended_for, is_active } = req.body;
    const db = await getDB();

    const existing = await db.get('SELECT id FROM wellness_activities WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Actividad no encontrada.' });
    }

    const updates = [];
    const params = [];

    if (title) { updates.push('title = ?'); params.push(title.trim()); }
    if (description) { updates.push('description = ?'); params.push(description.trim()); }
    if (category) { updates.push('category = ?'); params.push(category.trim()); }
    if (duration_minutes !== undefined) { updates.push('duration_minutes = ?'); params.push(parseInt(duration_minutes, 10)); }
    if (instructions !== undefined) {
      updates.push('instructions = ?');
      params.push(typeof instructions === 'string' ? instructions : JSON.stringify(instructions));
    }
    if (recommended_for !== undefined) {
      updates.push('recommended_for = ?');
      params.push(typeof recommended_for === 'string' ? recommended_for : JSON.stringify(recommended_for));
    }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }

    params.push(id);
    await db.run(`UPDATE wellness_activities SET ${updates.join(', ')} WHERE id = ?`, params);

    const updated = await db.get('SELECT * FROM wellness_activities WHERE id = ?', [id]);
    res.json({ success: true, message: 'Actividad actualizada.', data: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteActivity(req, res, next) {
  try {
    const { id } = req.params;
    const db = await getDB();
    await db.run('DELETE FROM wellness_activities WHERE id = ?', [id]);
    res.json({ success: true, message: 'Actividad eliminada correctamente.' });
  } catch (err) {
    next(err);
  }
}

// Gestión de pistas de música
async function createTrack(req, res, next) {
  try {
    const { title, artist, category, audio_url, is_soundscape, soundscape_preset, license_info, duration_seconds } = req.body;
    if (!title || !category || !audio_url) {
      return res.status(400).json({ success: false, error: 'Título, categoría y audio_url son obligatorios.' });
    }

    const id = 'trk_' + crypto.randomUUID();
    const db = await getDB();
    await db.run(
      `INSERT INTO music_tracks (id, title, artist, category, audio_url, is_soundscape, soundscape_preset, license_info, duration_seconds, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        id,
        title.trim(),
        artist ? artist.trim() : 'LÚMINA Sonidos',
        category.trim(),
        audio_url.trim(),
        is_soundscape ? 1 : 0,
        soundscape_preset || null,
        license_info || 'Licencia libre de uso personal',
        parseInt(duration_seconds, 10) || 300
      ]
    );

    const created = await db.get('SELECT * FROM music_tracks WHERE id = ?', [id]);
    res.status(201).json({ success: true, message: 'Pista creada exitosamente.', data: created });
  } catch (err) {
    next(err);
  }
}

async function updateTrack(req, res, next) {
  try {
    const { id } = req.params;
    const { title, artist, category, audio_url, is_soundscape, soundscape_preset, license_info, duration_seconds, is_active } = req.body;
    const db = await getDB();

    const existing = await db.get('SELECT id FROM music_tracks WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Pista no encontrada.' });
    }

    const updates = [];
    const params = [];
    if (title) { updates.push('title = ?'); params.push(title.trim()); }
    if (artist) { updates.push('artist = ?'); params.push(artist.trim()); }
    if (category) { updates.push('category = ?'); params.push(category.trim()); }
    if (audio_url) { updates.push('audio_url = ?'); params.push(audio_url.trim()); }
    if (is_soundscape !== undefined) { updates.push('is_soundscape = ?'); params.push(is_soundscape ? 1 : 0); }
    if (soundscape_preset !== undefined) { updates.push('soundscape_preset = ?'); params.push(soundscape_preset); }
    if (license_info) { updates.push('license_info = ?'); params.push(license_info); }
    if (duration_seconds !== undefined) { updates.push('duration_seconds = ?'); params.push(parseInt(duration_seconds, 10)); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }

    params.push(id);
    await db.run(`UPDATE music_tracks SET ${updates.join(', ')} WHERE id = ?`, params);

    const updated = await db.get('SELECT * FROM music_tracks WHERE id = ?', [id]);
    res.json({ success: true, message: 'Pista actualizada.', data: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteTrack(req, res, next) {
  try {
    const { id } = req.params;
    const db = await getDB();
    await db.run('DELETE FROM music_tracks WHERE id = ?', [id]);
    res.json({ success: true, message: 'Pista eliminada correctamente.' });
  } catch (err) {
    next(err);
  }
}

// Gestión de recursos de apoyo
async function createSupportResource(req, res, next) {
  try {
    const { country, country_code, service_name, phone, description, website, is_emergency } = req.body;
    if (!country || !country_code || !service_name || !phone) {
      return res.status(400).json({ success: false, error: 'País, código, nombre del servicio y teléfono son requeridos.' });
    }

    const id = 'sup_' + crypto.randomUUID();
    const db = await getDB();
    await db.run(
      `INSERT INTO support_resources (id, country, country_code, service_name, phone, description, website, is_emergency, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        id,
        country.trim(),
        country_code.trim().toUpperCase(),
        service_name.trim(),
        phone.trim(),
        description ? description.trim() : '',
        website ? website.trim() : null,
        is_emergency ? 1 : 0
      ]
    );

    const created = await db.get('SELECT * FROM support_resources WHERE id = ?', [id]);
    res.status(201).json({ success: true, message: 'Recurso de apoyo registrado.', data: created });
  } catch (err) {
    next(err);
  }
}

async function updateSupportResource(req, res, next) {
  try {
    const { id } = req.params;
    const { country, country_code, service_name, phone, description, website, is_emergency, is_active } = req.body;
    const db = await getDB();

    const existing = await db.get('SELECT id FROM support_resources WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Recurso de apoyo no encontrado.' });
    }

    const updates = [];
    const params = [];
    if (country) { updates.push('country = ?'); params.push(country.trim()); }
    if (country_code) { updates.push('country_code = ?'); params.push(country_code.trim().toUpperCase()); }
    if (service_name) { updates.push('service_name = ?'); params.push(service_name.trim()); }
    if (phone) { updates.push('phone = ?'); params.push(phone.trim()); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description.trim()); }
    if (website !== undefined) { updates.push('website = ?'); params.push(website ? website.trim() : null); }
    if (is_emergency !== undefined) { updates.push('is_emergency = ?'); params.push(is_emergency ? 1 : 0); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }

    params.push(id);
    await db.run(`UPDATE support_resources SET ${updates.join(', ')} WHERE id = ?`, params);

    const updated = await db.get('SELECT * FROM support_resources WHERE id = ?', [id]);
    res.json({ success: true, message: 'Recurso actualizado con éxito.', data: updated });
  } catch (err) {
    next(err);
  }
}

async function deleteSupportResource(req, res, next) {
  try {
    const { id } = req.params;
    const db = await getDB();
    await db.run('DELETE FROM support_resources WHERE id = ?', [id]);
    res.json({ success: true, message: 'Recurso de apoyo eliminado.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMetrics,
  createActivity,
  updateActivity,
  deleteActivity,
  createTrack,
  updateTrack,
  deleteTrack,
  createSupportResource,
  updateSupportResource,
  deleteSupportResource
};
