import React from 'react';
import { HomeIcon, HeartIcon, BookIcon, MusicIcon, WindIcon } from './Icons';

export default function MobileNavigation({ currentPage, onNavigate }) {
  const items = [
    { id: 'dashboard', label: 'Espacio', icon: HomeIcon },
    { id: 'mood', label: 'Sentir', icon: HeartIcon },
    { id: 'journal', label: 'Diario', icon: BookIcon },
    { id: 'my-music', label: 'Mi Música', icon: MusicIcon },
    { id: 'breathing', label: 'Respirar', icon: WindIcon }
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Navegación inferior móvil"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 800,
        backgroundColor: 'rgba(16, 19, 17, 0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0',
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))'
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              background: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: isActive ? '#A4CBB3' : '#79837e',
              fontSize: '0.72rem',
              fontWeight: isActive ? 600 : 400,
              padding: '4px 10px',
              borderRadius: '8px'
            }}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
