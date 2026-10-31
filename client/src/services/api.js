// Cliente HTTP centralizado para la API de LÚMINA

let authToken = localStorage.getItem('lumina_token') || null;

export function setAuthToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('lumina_token', token);
  } else {
    localStorage.removeItem('lumina_token');
  }
}

export function getAuthToken() {
  return authToken;
}

export async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(endpoint, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || 'Ocurrió un error en la comunicación con el servidor.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Servicios específicos
export const authService = {
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  register: (email, password, display_name) => request('/api/auth/register', { method: 'POST', body: { email, password, display_name } }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  getMe: () => request('/api/auth/me')
};

export const userService = {
  getProfile: () => request('/api/users/me'),
  updateProfile: (data) => request('/api/users/me', { method: 'PATCH', body: data }),
  deleteAccount: (password) => request('/api/users/me', { method: 'DELETE', body: { password } }),
  exportData: () => request('/api/users/export')
};

export const moodService = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/moods${qs ? `?${qs}` : ''}`);
  },
  create: (data) => request('/api/moods', { method: 'POST', body: data }),
  getById: (id) => request(`/api/moods/${id}`),
  update: (id, data) => request(`/api/moods/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => request(`/api/moods/${id}`, { method: 'DELETE' }),
  getStatistics: () => request('/api/moods/statistics')
};

export const journalService = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/journal${qs ? `?${qs}` : ''}`);
  },
  create: (data) => request('/api/journal', { method: 'POST', body: data }),
  getById: (id) => request(`/api/journal/${id}`),
  update: (id, data) => request(`/api/journal/${id}`, { method: 'PATCH', body: data }),
  toggleFavorite: (id) => request(`/api/journal/${id}/favorite`, { method: 'PATCH' }),
  delete: (id) => request(`/api/journal/${id}`, { method: 'DELETE' })
};

export const musicService = {
  // Ambient Soundscapes
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/music${qs ? `?${qs}` : ''}`);
  },
  listCategories: () => request('/api/music/categories'),
  listFavorites: () => request('/api/music/favorites'),
  addFavorite: (trackId) => request(`/api/music/favorites/${trackId}`, { method: 'POST' }),
  removeFavorite: (trackId) => request(`/api/music/favorites/${trackId}`, { method: 'DELETE' }),

  // Mi Música: Search, Favorite Artists, Favorite Tracks, Playlists
  search: (q = '', platform = 'all') => {
    const qs = new URLSearchParams({ q, platform }).toString();
    return request(`/api/music/search?${qs}`);
  },
  listMyArtists: () => request('/api/music/my-artists'),
  addMyArtist: (data) => request('/api/music/my-artists', { method: 'POST', body: data }),
  removeMyArtist: (id) => request(`/api/music/my-artists/${id}`, { method: 'DELETE' }),

  listMyTracks: () => request('/api/music/my-tracks'),
  addMyTrack: (data) => request('/api/music/my-tracks', { method: 'POST', body: data }),
  removeMyTrack: (id) => request(`/api/music/my-tracks/${id}`, { method: 'DELETE' }),

  listPlaylists: () => request('/api/music/playlists'),
  createPlaylist: (data) => request('/api/music/playlists', { method: 'POST', body: data }),
  getPlaylist: (id) => request(`/api/music/playlists/${id}`),
  updatePlaylist: (id, data) => request(`/api/music/playlists/${id}`, { method: 'PATCH', body: data }),
  deletePlaylist: (id) => request(`/api/music/playlists/${id}`, { method: 'DELETE' }),
  addTrackToPlaylist: (playlistId, trackData) => request(`/api/music/playlists/${playlistId}/tracks`, { method: 'POST', body: trackData }),
  removeTrackFromPlaylist: (playlistId, trackId) => request(`/api/music/playlists/${playlistId}/tracks/${trackId}`, { method: 'DELETE' })
};

export const activityService = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/activities${qs ? `?${qs}` : ''}`);
  },
  complete: (activity_id, duration_seconds) => request('/api/activities/complete', { method: 'POST', body: { activity_id, duration_seconds } }),
  getHistory: () => request('/api/activities/history')
};

export const supportService = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/support${qs ? `?${qs}` : ''}`);
  },
  listCountries: () => request('/api/support/countries')
};

export const adminService = {
  getMetrics: () => request('/api/admin/metrics'),
  createActivity: (data) => request('/api/admin/activities', { method: 'POST', body: data }),
  updateActivity: (id, data) => request('/api/admin/activities/:id', { method: 'PATCH', body: data }),
  deleteActivity: (id) => request(`/api/admin/activities/${id}`, { method: 'DELETE' }),
  createTrack: (data) => request('/api/admin/music', { method: 'POST', body: data }),
  updateTrack: (id, data) => request(`/api/admin/music/${id}`, { method: 'PATCH', body: data }),
  deleteTrack: (id) => request(`/api/admin/music/${id}`, { method: 'DELETE' }),
  createSupport: (data) => request('/api/admin/support', { method: 'POST', body: data }),
  updateSupport: (id, data) => request(`/api/admin/support/${id}`, { method: 'PATCH', body: data }),
  deleteSupport: (id) => request(`/api/admin/support/${id}`, { method: 'DELETE' })
};
