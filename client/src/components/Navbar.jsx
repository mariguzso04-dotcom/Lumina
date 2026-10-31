import React from 'react';
import { useAuth } from '../context/AuthContext';
import { MoonIcon, LifeBuoyIcon, UserIcon, ShieldIcon } from './Icons';

export default function Navbar({ onNavigate, currentPage }) {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();

  return (
    <header 
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 500,
        backgroundColor: 'rgba(16, 19, 17, 0.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
        padding: '14px 24px'
      }}
    >
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logotipo y Lema */}
        <div 
          onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'welcome')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate(isAuthenticated ? 'dashboard' : 'welcome')}
          aria-label="Ir a la página de inicio de LÚMINA"
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #172820 0%, #28664B 100%)',
            border: '1px solid rgba(164, 203, 179, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#A4CBB3',
            boxShadow: '0 0 15px rgba(40, 102, 75, 0.3)'
          }}>
            <MoonIcon size={20} />
          </div>
          <div>
            <span style={{ 
              fontFamily: 'var(--font-serif)', 
              fontSize: '1.35rem', 
              fontWeight: 600, 
              letterSpacing: '0.08em',
              color: '#F1F1EB'
            }}>
              LÚMINA
            </span>
            <span style={{ 
              display: 'block', 
              fontSize: '0.72rem', 
              color: '#A9AFAC', 
              letterSpacing: '0.04em',
              marginTop: '-2px'
            }}>
              Refugio emocional
            </span>
          </div>
        </div>

        {/* Acciones principales y sesión */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Botón de apoyo y seguridad emocional siempre visible */}
          <button 
            onClick={() => onNavigate('support')}
            className="btn-ghost"
            style={{
              color: '#e4b363',
              border: '1px solid rgba(228, 179, 99, 0.3)',
              backgroundColor: 'rgba(228, 179, 99, 0.08)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem'
            }}
            title="Líneas de ayuda y apoyo emocional verificadas"
          >
            <LifeBuoyIcon size={16} />
            <span className="hide-on-mobile">Apoyo y crisis</span>
          </button>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isAdmin && (
                <button
                  onClick={() => onNavigate('admin')}
                  className="btn-ghost"
                  style={{
                    color: '#A4CBB3',
                    fontSize: '0.85rem',
                    border: '1px solid rgba(164, 203, 179, 0.25)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-full)'
                  }}
                  title="Panel de Administración"
                >
                  <ShieldIcon size={16} />
                  <span className="hide-on-mobile">Admin</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('profile')}
                className="btn-ghost"
                style={{
                  color: '#F1F1EB',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(32, 37, 34, 0.6)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <UserIcon size={16} />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  {user?.display_name || 'Mi Espacio'}
                </span>
              </button>

              <button
                onClick={logout}
                className="btn-ghost"
                style={{ color: '#A9AFAC', fontSize: '0.85rem', padding: '6px 10px' }}
                title="Cerrar sesión"
              >
                Salir
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => onNavigate('login')}
                className="btn-ghost"
                style={{ color: '#F1F1EB', fontSize: '0.9rem' }}
              >
                Ingresar
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.88rem' }}
              >
                Comenzar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
