import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MoonIcon } from '../components/Icons';

export default function LoginPage({ onNavigate }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.preferences && !data.preferences.onboarding_completed) {
        onNavigate('onboarding');
      } else {
        onNavigate('dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const [selectedRole, setSelectedRole] = useState('demo');

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    if (role === 'demo') {
      setEmail('demo@lumina.bienestar');
      setPassword('DemoLumina2026!');
    } else if (role === 'admin') {
      setEmail('admin@lumina.bienestar');
      setPassword('AdminLumina2026!');
    }
  };

  const handleQuickLogin = async (role) => {
    setErrorMsg('');
    setLoading(true);
    const targetEmail = role === 'admin' ? 'admin@lumina.bienestar' : 'demo@lumina.bienestar';
    const targetPass = role === 'admin' ? 'AdminLumina2026!' : 'DemoLumina2026!';
    try {
      const data = await login(targetEmail, targetPass);
      if (data.preferences && !data.preferences.onboarding_completed) {
        onNavigate('onboarding');
      } else {
        onNavigate('dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 20px'
    }}>
      <div 
        className="card"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '36px',
          backgroundColor: '#17221b',
          border: '1px solid rgba(164, 203, 179, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'rgba(40, 102, 75, 0.35)',
            color: '#A4CBB3',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            border: '1px solid rgba(164, 203, 179, 0.3)'
          }}>
            <MoonIcon size={26} />
          </div>
          <h1 style={{ fontSize: '1.8rem', color: '#F1F1EB', marginBottom: '4px' }}>
            Volver a tu refugio
          </h1>
          <p style={{ color: '#A9AFAC', fontSize: '0.9rem' }}>
            Ingresá a tu espacio personal o selecciona tu rol de acceso.
          </p>
        </div>

        {/* Selector Visual de Roles: Cliente vs Administrador */}
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#101712',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(164, 203, 179, 0.2)'
        }}>
          <p style={{ fontSize: '0.8rem', color: '#A4CBB3', margin: '0 0 10px 0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Seleccionar Rol de Demostración:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => handleSelectRole('demo')}
              style={{
                padding: '12px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: selectedRole === 'demo' ? 'rgba(40, 102, 75, 0.45)' : 'rgba(255,255,255,0.03)',
                border: selectedRole === 'demo' ? '1px solid #A4CBB3' : '1px solid rgba(164, 203, 179, 0.15)',
                color: selectedRole === 'demo' ? '#F1F1EB' : '#A9AFAC',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: selectedRole === 'demo' ? '#A4CBB3' : '#F1F1EB' }}>
                👤 Cliente / Usuario
              </div>
              <div style={{ fontSize: '0.74rem', color: '#79837e', marginTop: '2px' }}>
                Refugio, diario y música
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRole('admin')}
              style={{
                padding: '12px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: selectedRole === 'admin' ? 'rgba(40, 102, 75, 0.45)' : 'rgba(255,255,255,0.03)',
                border: selectedRole === 'admin' ? '1px solid #A4CBB3' : '1px solid rgba(164, 203, 179, 0.15)',
                color: selectedRole === 'admin' ? '#F1F1EB' : '#A9AFAC',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: selectedRole === 'admin' ? '#A4CBB3' : '#F1F1EB' }}>
                🛡️ Administrador
              </div>
              <div style={{ fontSize: '0.74rem', color: '#79837e', marginTop: '2px' }}>
                Catálogo y panel métricas
              </div>
            </button>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin(selectedRole)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: 'rgba(164, 203, 179, 0.15)',
                border: '1px solid rgba(164, 203, 179, 0.3)',
                borderRadius: 'var(--radius-sm)',
                color: '#A4CBB3',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ⚡ Entrar inmediatamente como {selectedRole === 'admin' ? 'Administrador' : 'Cliente'}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(201, 98, 87, 0.15)',
            border: '1px solid rgba(201, 98, 87, 0.4)',
            color: '#ff9d94',
            fontSize: '0.88rem',
            marginBottom: '20px'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              required
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Verificando...' : 'Entrar a mi espacio'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: '#A9AFAC' }}>
          ¿Aún no tenés tu espacio?{' '}
          <button
            type="button"
            onClick={() => onNavigate('register')}
            style={{ background: 'transparent', color: '#A4CBB3', textDecoration: 'underline', fontWeight: 500 }}
          >
            Crear cuenta gratis
          </button>
        </div>
      </div>
    </div>
  );
}
