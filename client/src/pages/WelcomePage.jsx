import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { MoonIcon, HeartIcon, BookIcon, MusicIcon, WindIcon, CompassIcon } from '../components/Icons';
import Modal from '../components/Modal';

export default function WelcomePage({ onNavigate }) {
  const { isAuthenticated } = useAuth();
  const [showAboutModal, setShowAboutModal] = useState(false);

  const handleEnter = () => {
    if (isAuthenticated) {
      onNavigate('dashboard');
    } else {
      onNavigate('login');
    }
  };

  return (
    <main 
      style={{
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        position: 'relative',
        textAlign: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Composición visual central luminosa */}
      <div 
        style={{
          position: 'relative',
          marginBottom: '32px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Halo de luz suave difuminada */}
        <div 
          style={{
            position: 'absolute',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(164, 203, 179, 0.22) 0%, rgba(40, 102, 75, 0.15) 50%, transparent 75%)',
            filter: 'blur(30px)',
            pointerEvents: 'none'
          }}
        />

        {/* Círculo celestial con luna */}
        <div 
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #172820 0%, #101311 100%)',
            border: '2px solid rgba(164, 203, 179, 0.35)',
            boxShadow: '0 0 35px rgba(40, 102, 75, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#A4CBB3',
            position: 'relative',
            zIndex: 1
          }}
        >
          <MoonIcon size={64} />
        </div>
      </div>

      {/* Título Principal */}
      <h1 
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.8rem, 6vw, 4.2rem)',
          fontWeight: 600,
          color: '#F1F1EB',
          letterSpacing: '0.06em',
          marginBottom: '8px'
        }}
      >
        LÚMINA
      </h1>

      {/* Subtítulo Poético */}
      <p 
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
          color: '#A4CBB3',
          marginBottom: '24px',
          fontWeight: 400
        }}
      >
        Un espacio para volver a vos.
      </p>

      {/* Texto de Bienvenida */}
      <p 
        style={{
          maxWidth: '580px',
          fontSize: '1.1rem',
          lineHeight: '1.7',
          color: '#A9AFAC',
          marginBottom: '40px'
        }}
      >
        "No tenés que tener todas las respuestas. Podés empezar por cómo te sentís hoy."
      </p>

      {/* Botones Principales */}
      <div 
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'center',
          marginBottom: '60px',
          position: 'relative',
          zIndex: 2
        }}
      >
        <button 
          onClick={handleEnter}
          className="btn-primary"
          style={{ padding: '15px 36px', fontSize: '1.05rem' }}
        >
          Entrar a mi espacio
        </button>

        <button 
          onClick={() => setShowAboutModal(true)}
          className="btn-secondary"
          style={{ padding: '15px 32px', fontSize: '1.05rem' }}
        >
          Conocer LÚMINA
        </button>
      </div>

      {/* Pilares clave */}
      <section 
        aria-label="Herramientas del refugio LÚMINA"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          maxWidth: '960px',
          width: '100%',
          marginTop: '20px'
        }}
      >
        <div className="card" style={{ padding: '20px', textAlign: 'left' }}>
          <div style={{ color: '#A4CBB3', marginBottom: '10px' }}><HeartIcon size={24} /></div>
          <h3 style={{ fontSize: '1.05rem', color: '#F1F1EB', marginBottom: '6px' }}>Registro íntimo</h3>
          <p style={{ fontSize: '0.88rem', color: '#A9AFAC' }}>
            Nombrá lo que sentís sin juicios, reconociendo intensidad y factores que te influyen.
          </p>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'left' }}>
          <div style={{ color: '#A4CBB3', marginBottom: '10px' }}><BookIcon size={24} /></div>
          <h3 style={{ fontSize: '1.05rem', color: '#F1F1EB', marginBottom: '6px' }}>Diario confidencial</h3>
          <p style={{ fontSize: '0.88rem', color: '#A9AFAC' }}>
            Un cuaderno personal protegido con acceso exclusivo por usuario, jamás expuesto.
          </p>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'left' }}>
          <div style={{ color: '#A4CBB3', marginBottom: '10px' }}><WindIcon size={24} /></div>
          <h3 style={{ fontSize: '1.05rem', color: '#F1F1EB', marginBottom: '6px' }}>Respiración y pausa</h3>
          <p style={{ fontSize: '0.88rem', color: '#A9AFAC' }}>
            Ejercicios visuales suaves para volver al presente a tu propio compás.
          </p>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'left' }}>
          <div style={{ color: '#A4CBB3', marginBottom: '10px' }}><MusicIcon size={24} /></div>
          <h3 style={{ fontSize: '1.05rem', color: '#F1F1EB', marginBottom: '6px' }}>Paisajes sonoros</h3>
          <p style={{ fontSize: '0.88rem', color: '#A9AFAC' }}>
            Lluvia, bosque y armonías sintetizadas para ambientar tu concentración o descanso.
          </p>
        </div>
      </section>

      {/* Modal Conocer LÚMINA */}
      <Modal 
        isOpen={showAboutModal} 
        onClose={() => setShowAboutModal(false)}
        title="Acerca de LÚMINA"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', lineHeight: '1.7', color: '#A9AFAC' }}>
          <p>
            <strong style={{ color: '#F1F1EB' }}>LÚMINA</strong> nace como un refugio digital diseñado para ofrecer serenidad, privacidad y herramientas prácticas de autorregulación emocional.
          </p>
          <p>
            Vivimos en un entorno acelerado donde a menudo se exige productividad inmediata y certezas constantes. LÚMINA te propone una pausa consciente: un lugar para volver a vos, escuchar tus emociones sin diagnósticos automáticos ni etiquetas clínicas, y hallar sosiego.
          </p>
          <div style={{ 
            backgroundColor: 'rgba(40, 102, 75, 0.2)', 
            border: '1px solid rgba(164, 203, 179, 0.25)', 
            padding: '16px', 
            borderRadius: 'var(--radius-md)' 
          }}>
            <p style={{ fontSize: '0.9rem', color: '#F1F1EB', margin: 0 }}>
              <strong>Compromiso con tu privacidad:</strong> Tus registros de diario y estado emocional son estrictamente privados. No son compartidos, no se emplean para publicidad ni son accesibles para administradores.
            </p>
          </div>
          <p style={{ fontSize: '0.88rem' }}>
            * LÚMINA es una herramienta complementaria de bienestar y no reemplaza la atención de profesionales de salud mental o servicios de emergencia médica.
          </p>
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => { setShowAboutModal(false); handleEnter(); }}
              className="btn-primary"
            >
              Comenzar experiencia
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
