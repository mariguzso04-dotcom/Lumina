import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState({
    preferred_theme: 'dark',
    onboarding_completed: false,
    accessibility_preferences: { reducedMotion: false, highContrast: false },
    music_preferences: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await authService.getMe();
        if (res.success && res.data) {
          setUser(res.data.user);
          if (res.data.preferences) {
            setPreferences(res.data.preferences);
          }
        }
      } catch (err) {
        console.warn('[Lumina Auth] Sesión previa expirada');
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data) {
        setAuthToken(res.data.token);
        setUser(res.data.user);
        if (res.data.preferences) {
          setPreferences(res.data.preferences);
        }
        return res.data;
      }
      throw new Error(res.error || 'Error al iniciar sesión');
    } catch (err) {
      // Modo de contingencia para previsualizaciones en Netlify si el backend remoto aún no está conectado
      const isDemoUser = (email || '').toLowerCase().includes('demo');
      const isAdminUser = (email || '').toLowerCase().includes('admin');

      if ((isDemoUser || isAdminUser) && (!err.status || err.status === 404 || err.status === 502 || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError'))) {
        console.warn('[LÚMINA] Modo de navegación sin conexión activado para demostración en Netlify.');
        const mockUser = {
          id: isDemoUser ? 'usr_demo_preview' : 'usr_admin_preview',
          email: email.toLowerCase(),
          display_name: isDemoUser ? 'Alma Serena (Demo)' : 'Guardián LÚMINA (Admin)',
          role: isAdminUser ? 'admin' : 'user'
        };
        const mockPrefs = {
          preferred_theme: 'dark',
          onboarding_completed: true,
          accessibility_preferences: { reducedMotion: false, highContrast: false },
          music_preferences: {}
        };
        setUser(mockUser);
        setPreferences(mockPrefs);
        setAuthToken('preview_demo_token');
        return { user: mockUser, preferences: mockPrefs, token: 'preview_demo_token' };
      }
      throw err;
    }
  };

  const register = async (email, password, display_name) => {
    const res = await authService.register(email, password, display_name);
    if (res.success && res.data) {
      setAuthToken(res.data.token);
      setUser(res.data.user);
      if (res.data.preferences) {
        setPreferences(res.data.preferences);
      }
      return res.data;
    }
    throw new Error(res.error || 'Error al registrar la cuenta');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {}
    setAuthToken(null);
    setUser(null);
  };

  const updatePreferences = async (newPrefs) => {
    const res = await userService.updateProfile({ preferences: newPrefs });
    if (res.success && res.data) {
      setPreferences(res.data.preferences);
      return res.data.preferences;
    }
  };

  const updateProfile = async (data) => {
    const res = await userService.updateProfile(data);
    if (res.success && res.data) {
      setUser(res.data.user);
      if (res.data.preferences) {
        setPreferences(res.data.preferences);
      }
      return res.data;
    }
  };

  const value = {
    user,
    preferences,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    loading,
    login,
    register,
    logout,
    updatePreferences,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return ctx;
}
