const crypto = require('crypto');
const { getDB } = require('../db');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/token');

async function register(req, res, next) {
  try {
    const { email, password, display_name } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Por favor, ingresá un correo electrónico válido.' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, error: 'La contraseña debe contener al menos 8 caracteres.' });
    }

    if (!display_name || display_name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Por favor, ingresá un nombre o cómo te gustaría que te llamemos.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanName = display_name.trim();

    const db = await getDB();
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);

    if (existing) {
      return res.status(409).json({ success: false, error: 'Ya existe una cuenta registrada con este correo electrónico.' });
    }

    const userId = 'usr_' + crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const prefId = 'pref_' + crypto.randomUUID();

    await db.run(
      'INSERT INTO users (id, email, password_hash, display_name, role) VALUES (?, ?, ?, ?, ?)',
      [userId, normalizedEmail, passwordHash, cleanName, 'user']
    );

    await db.run(
      'INSERT INTO user_preferences (id, user_id, preferred_theme, onboarding_completed) VALUES (?, ?, ?, ?)',
      [prefId, userId, 'dark', 0]
    );

    const user = {
      id: userId,
      email: normalizedEmail,
      display_name: cleanName,
      role: 'user'
    };

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      message: 'Bienvenido/a a LÚMINA. Tu espacio personal ha sido creado.',
      data: {
        user,
        token,
        preferences: {
          preferred_theme: 'dark',
          onboarding_completed: 0,
          accessibility_preferences: { reducedMotion: false, highContrast: false }
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Por favor, completá tu correo y contraseña.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const db = await getDB();
    const user = await db.get(
      'SELECT id, email, password_hash, display_name, role, created_at FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (!user) {
      return res.status(401).json({ success: false, error: 'Credenciales incorrectas. Verificá tu correo y contraseña.' });
    }

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Credenciales incorrectas. Verificá tu correo y contraseña.' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });

    const preferences = await db.get(
      'SELECT preferred_theme, music_preferences, accessibility_preferences, onboarding_completed, onboarding_answers FROM user_preferences WHERE user_id = ?',
      [user.id]
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
      message: 'Sesión iniciada con éxito.',
      data: {
        user: {
          id: user.id,
          email: user.email,
          display_name: user.display_name,
          role: user.role,
          created_at: user.created_at
        },
        token,
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

async function getMe(req, res, next) {
  try {
    const db = await getDB();
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
        user: req.user,
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

async function logout(req, res) {
  res.json({
    success: true,
    message: 'Sesión cerrada correctamente. Que tengas un momento de paz.'
  });
}

module.exports = {
  register,
  login,
  getMe,
  logout
};
