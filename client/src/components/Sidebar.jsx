import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, HeartIcon, BookIcon, MusicIcon, WindIcon, 
  CompassIcon, SparklesIcon, ChartIcon, LifeBuoyIcon, 
  SettingsIcon, ShieldIcon 
} from './Icons';

export default function Sidebar({ currentPage, onNavigate }) {
  const { isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Mi Espacio', icon: HomeIcon },
    { id: 'mood', label: 'Estado Emocional', icon: HeartIcon },
    { id: 'journal', label: 'Diario Privado', icon: BookIcon },
    { id: 'my-music', label: 'Mi Música', icon: MusicIcon },
    { id: 'music', label: 'Sonidos Ambientales', icon: SparklesIcon },
    { id: 'breathing', label: 'Respirar y Volver', icon: WindIcon },
    { id: 'refuge', label: 'Mi Refugio', icon: CompassIcon },
    { id: 'activities', label: 'Actividades', icon: SparklesIcon },
    { id: 'history', label: 'Mi Historial', icon: ChartIcon },
    { id: 'support', label: 'Apoyo y Seguridad', icon: LifeBuoyIcon },
    { id: 'profile', label: 'Perfil y Privacidad', icon: SettingsIcon }
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Administración', icon: ShieldIcon });
  }

  return (
    <aside
      className="desktop-sidebar"
      style={{
        width: '260px',
        flexShrink: 0,
        backgroundColor: 'rgba(23, 40, 32, 0.45)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--color-border)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 'calc(100vh - 70px)'
      }}
    >
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <p style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#79837e',
          padding: '0 12px 10px 12px',
          fontWeight: 600
        }}>
          Navegación
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '11px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'rgba(40, 102, 75, 0.35)' : 'transparent',
                color: isActive ? '#F1F1EB' : '#A9AFAC',
                fontWeight: isActive ? 600 : 400,
                border: isActive ? '1px solid rgba(164, 203, 179, 0.3)' : '1px solid transparent',
                textAlign: 'left',
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(164, 203, 179, 0.08)';
                  e.currentTarget.style.color = '#F1F1EB';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#A9AFAC';
                }
              }}
            >
              <span style={{ color: isActive ? '#A4CBB3' : 'inherit' }}>
                <Icon size={19} />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Nota íntima al pie de la barra lateral */}
      <div style={{
        padding: '16px',
        backgroundColor: 'rgba(16, 19, 17, 0.6)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        marginTop: '20px'
      }}>
        <p style={{ fontSize: '0.8rem', color: '#A9AFAC', fontStyle: 'italic', margin: 0 }}>
          "Un día a la vez. No tenés que resolver todo hoy."
        </p>
      </div>
    </aside>
  );
}
