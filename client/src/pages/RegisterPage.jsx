import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MoonIcon } from '../components/Icons';

export default function RegisterPage({ onNavigate }) {
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, displayName);
      onNavigate('onboarding');
    } catch (err) {
      setErrorMsg(err.message || 'Error al registrar la cuenta.');
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
          maxWidth: '460px',
          width: '100%',
          padding: '36px',
          backgroundColor: '#17221b',
          border: '1px solid rgba(164, 203, 179, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
            Crear tu refugio
          </h1>
          <p style={{ color: '#A9AFAC', fontSize: '0.9rem' }}>
            Un espacio donde no tenés que tener todas las respuestas.
          </p>
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
            <label htmlFor="reg-name" className="form-label">
              ¿Cómo te gustaría que te llamemos?
            </label>
            <input
              id="reg-name"
              type="text"
              required
              placeholder="Tu nombre o alias"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">
              Correo electrónico
            </label>
            <input
              id="reg-email"
              type="email"
              required
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">
              Contraseña segura
            </label>
            <input
              id="reg-password"
              type="password"
              required
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm" className="form-label">
              Confirmar contraseña
            </label>
            <input
              id="reg-confirm"
              type="password"
              required
              placeholder="Repetí tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '12px', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Creando tu espacio...' : 'Comenzar en LÚMINA'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: '#A9AFAC' }}>
          ¿Ya tenés una cuenta?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            style={{ background: 'transparent', color: '#A4CBB3', textDecoration: 'underline', fontWeight: 500 }}
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
