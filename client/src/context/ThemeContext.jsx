import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [reducedMotion, setReducedMotion] = useState(() => {
    return localStorage.getItem('lumina_reduced_motion') === 'true' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('lumina_high_contrast') === 'true';
  });

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    localStorage.setItem('lumina_high_contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('lumina_reduced_motion', reducedMotion);
  }, [reducedMotion]);

  const toggleReducedMotion = () => setReducedMotion(prev => !prev);
  const toggleHighContrast = () => setHighContrast(prev => !prev);

  return (
    <ThemeContext.Provider value={{ reducedMotion, highContrast, toggleReducedMotion, toggleHighContrast }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme debe ser utilizado dentro de un ThemeProvider');
  }
  return ctx;
}
