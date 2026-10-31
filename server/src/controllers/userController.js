const { getDB } = require('../db');
const { hashPassword, comparePassword } = require('../utils/hash');

async function getProfile(req, res, next) {
  try {
    const db = await getDB();
    const user = await db.get(
      'SELECT id, email, display_name, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    const preferences = await db.get(
      'SELECT preferred_theme, music_preferences, accessibility_preferences, onboarding_completed, onboarding_answers FROM user_preferences WHERE user_id = ?',
      [req.user.id]
    );

    let parsedMusic = {};
    let parsedAccess = { reducedMotion: false, highContrast: false };
    let parsedOnboarding = {};

    try {
      if (preferences?.music_preferences) parsedMusic = JSON.parse(preferences.music_preferences);
      if (preferences?.accessibility_preferences) parsedAccess = JSON.parse(preferences.accessibility_preferences);
      if (preferences?.onboarding_answers) parsedOnboarding = JSON.parse(preferences.onboarding_answers);
    } catch (e) {}

    res.json({
      success: true,
      data: {
        user,
        preferences: {
          preferred_theme: preferences?.preferred_theme || 'dark',
          onboarding_completed: preferences ? Boolean(preferences.onboarding_completed) : false,
          music_preferences: parsedMusic,
          accessibility_preferences: parsedAccess,
          onboarding_answers: parsedOnboarding
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { display_name, current_password, new_password, preferences } = req.body;
    const db = await getDB();

    if (display_name && display_name.trim()) {
      await db.run(
        'UPDATE users SET display_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [display_name.trim(), req.user.id]
      );
    }

    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ success: false, error: 'Debes ingresar tu contraseña actual para cambiarla.' });
      }

      const user = await db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
      const valid = await comparePassword(current_password, user.password_hash);
      if (!valid) {
        return res.status(400).json({ success: false, error: 'La contraseña actual no es correcta.' });
      }

      if (new_password.length < 8) {
        return res.status(400).json({ success: false, error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
      }

      const newHash = await hashPassword(new_password);
      await db.run(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newHash, req.user.id]
      );
    }

    if (preferences) {
      const existingPref = await db.get('SELECT id FROM user_preferences WHERE user_id = ?', [req.user.id]);
      const theme = preferences.preferred_theme || 'dark';
      const music = typeof preferences.music_preferences === 'string'
        ? preferences.music_preferences
        : JSON.stringify(preferences.music_preferences || {});
      const access = typeof preferences.accessibility_preferences === 'string'
        ? preferences.accessibility_preferences
        : JSON.stringify(preferences.accessibility_preferences || {});
      const onboardingCompleted = preferences.onboarding_completed ? 1 : 0;
      const onboardingAnswers = typeof preferences.onboarding_answers === 'string'
        ? preferences.onboarding_answers
        : JSON.stringify(preferences.onboarding_answers || {});

      if (existingPref) {
        await db.run(
          `UPDATE user_preferences 
           SET preferred_theme = ?, music_preferences = ?, accessibility_preferences = ?, onboarding_completed = ?, onboarding_answers = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE user_id = ?`,
          [theme, music, access, onboardingCompleted, onboardingAnswers, req.user.id]
        );
      } else {
        await db.run(
          `INSERT INTO user_preferences (id, user_id, preferred_theme, music_preferences, accessibility_preferences, onboarding_completed, onboarding_answers)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          ['pref_' + req.user.id, req.user.id, theme, music, access, onboardingCompleted, onboardingAnswers]
        );
      }
    }

    return getProfile(req, res, next);
  } catch (err) {
    next(err);
  }
}

async function deleteAccount(req, res, next) {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, error: 'Por seguridad, ingresá tu contraseña para confirmar la eliminación.' });
    }

    const db = await getDB();
    const user = await db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Contraseña incorrecta. No se pudo eliminar la cuenta.' });
    }

    // Eliminación en cascada de todos los datos asociados
    await db.run('DELETE FROM users WHERE id = ?', [req.user.id]);

    res.json({
      success: true,
      message: 'Tu cuenta y todos tus datos personales asociados han sido eliminados permanentemente.'
    });
  } catch (err) {
    next(err);
  }
}

async function exportPersonalData(req, res, next) {
  try {
    const db = await getDB();
    const user = await db.get('SELECT id, email, display_name, created_at FROM users WHERE id = ?', [req.user.id]);
    const preferences = await db.get('SELECT * FROM user_preferences WHERE user_id = ?', [req.user.id]);
    const moods = await db.all('SELECT * FROM mood_entries WHERE user_id = ? ORDER BY recorded_at ASC', [req.user.id]);
    const journals = await db.all('SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at ASC', [req.user.id]);
    const activityHistory = await db.all('SELECT * FROM activity_history WHERE user_id = ? ORDER BY completed_at ASC', [req.user.id]);

    const formattedMoods = moods.map(m => {
      let emotions = [];
      let factors = [];
      let helpful = [];
      try { emotions = JSON.parse(m.emotions); } catch (e) { emotions = [m.emotions]; }
      try { factors = JSON.parse(m.factors); } catch (e) {}
      try { helpful = JSON.parse(m.helpful_activities); } catch (e) {}
      return { ...m, emotions, factors, helpful_activities: helpful };
    });

    res.json({
      success: true,
      data: {
        exported_at: new Date().toISOString(),
        description: 'Exportación completa de datos personales y registros en LÚMINA',
        user,
        preferences,
        mood_entries: formattedMoods,
        journal_entries: journals,
        activity_history: activityHistory
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  exportPersonalData
};
