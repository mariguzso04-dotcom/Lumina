-- LÚMINA - Esquema SQLite para desarrollo local y pruebas
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user', -- 'user' o 'admin'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    preferred_theme TEXT DEFAULT 'dark',
    music_preferences TEXT DEFAULT '{}',
    accessibility_preferences TEXT DEFAULT '{"reducedMotion":false,"highContrast":false}',
    onboarding_completed INTEGER DEFAULT 0,
    onboarding_answers TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mood_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    emotions TEXT NOT NULL, -- JSON array de emociones
    intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 5),
    factors TEXT DEFAULT '[]', -- JSON array de factores
    context_note TEXT,
    helpful_activities TEXT DEFAULT '[]',
    post_action TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood_tag TEXT,
    is_favorite INTEGER DEFAULT 0,
    is_draft INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS music_tracks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    category TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    is_soundscape INTEGER DEFAULT 0,
    soundscape_preset TEXT,
    license_info TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS music_favorites (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    track_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, track_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (track_id) REFERENCES music_tracks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wellness_activities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- 'respiracion', 'sensorial', 'corporal', 'reflexion', 'creativa'
    duration_minutes INTEGER NOT NULL,
    instructions TEXT NOT NULL, -- JSON array o texto formateado con pasos
    recommended_for TEXT DEFAULT '[]', -- JSON array de emociones asociadas
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activity_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    activity_id TEXT NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES wellness_activities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS support_resources (
    id TEXT PRIMARY KEY,
    country TEXT NOT NULL,
    country_code TEXT NOT NULL,
    service_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    description TEXT NOT NULL,
    website TEXT,
    is_emergency INTEGER DEFAULT 1,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON mood_entries(user_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON journal_entries(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_music_tracks_cat ON music_tracks(category, is_active);
CREATE INDEX IF NOT EXISTS idx_music_fav_user ON music_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_support_country ON support_resources(country_code, is_active);

-- ===================================================================
-- SECCIÓN "MI MÚSICA": Artistas favoritos, Canciones favoritas y Listas personales
-- ===================================================================

CREATE TABLE IF NOT EXISTS favorite_artists (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'spotify', -- 'spotify' | 'youtube' | 'other'
    external_id TEXT,
    image_url TEXT,
    genres TEXT DEFAULT '[]',
    external_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, platform, external_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_favorite_tracks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    platform TEXT NOT NULL DEFAULT 'spotify', -- 'spotify' | 'youtube'
    external_id TEXT NOT NULL,
    cover_url TEXT,
    duration_seconds INTEGER DEFAULT 0,
    preview_url TEXT,
    external_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, platform, external_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_playlists (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS playlist_tracks (
    id TEXT PRIMARY KEY,
    playlist_id TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    platform TEXT NOT NULL DEFAULT 'spotify', -- 'spotify' | 'youtube'
    external_id TEXT NOT NULL,
    cover_url TEXT,
    duration_seconds INTEGER DEFAULT 0,
    preview_url TEXT,
    external_url TEXT,
    position INTEGER DEFAULT 0,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(playlist_id, platform, external_id),
    FOREIGN KEY (playlist_id) REFERENCES user_playlists(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_fav_artists_user ON favorite_artists(user_id);
CREATE INDEX IF NOT EXISTS idx_fav_tracks_user ON user_favorite_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_playlists_user ON user_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_pl ON playlist_tracks(playlist_id);

