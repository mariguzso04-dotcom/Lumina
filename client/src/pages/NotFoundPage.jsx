import React from 'react';
import { MoonIcon } from '../components/Icons';

export default function NotFoundPage({ onNavigate }) {
  return (
    <div className="container page-container" style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'rgba(40, 102, 75, 0.3)',
        color: '#A4CBB3',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <MoonIcon size={32} />
      </div>

      <h1 style={{ fontSize: '2.5rem', color: '#F1F1EB', marginBottom: '12px' }}>
        404 — Sendero no encontrado
      </h1>
      <p style={{ color: '#A9AFAC', maxWidth: '460px', margin: '0 auto 28px auto', fontSize: '1rem' }}>
        Parece que este rincón aún no ha sido explorado o la página ha cambiado de lugar. Siempre podés regresar a tu espacio seguro.
      </p>

      <button onClick={() => onNavigate('dashboard')} className="btn-primary">
        Regresar a mi espacio
      </button>
    </div>
  );
}
