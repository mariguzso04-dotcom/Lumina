import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  HeartIcon, BookIcon, MusicIcon, WindIcon, 
  CompassIcon, ChartIcon, StarIcon, SettingsIcon,
  SparklesIcon
} from '../components/Icons';
import { moodService } from '../services/api';

export default function Dashboard({ onNavigate }) {
  const { user } = useAuth();
  const [recentMood, setRecentMood] = useState(null);
  const [loadingMood, setLoadingMood] = useState(true);

  // Formato de fecha en español
  const todayFormatted = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  // Saludo contextual según la hora del día
  const getContextualGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 20) return 'Buenas tardes';
    return 'Buenas noches';
  };

  useEffect(() => {
    async function fetchRecent() {
      try {
        const res = await moodService.list({ limit: 1 });
        if (res.success && res.data && res.data.length > 0) {
          setRecentMood(res.data[0]);
        }
      } catch (e) {
        // silencioso
      } finally {
        setLoadingMood(false);
      }
    }
    fetchRecent();
  }, []);

  const cards = [
    {
      id: 'mood',
      title: 'Mi estado emocional',
      desc: 'Registrá tus sentimientos actuales, su intensidad y los factores asociados.',
      icon: HeartIcon,
      badge: recentMood ? `Último: ${recentMood.emotions.join(', ')}` : 'Registrar ahora'
    },
    {
      id: 'journal',
      title: 'Mi diario privado',
      desc: 'Escribí con libertad, desahogá pensamientos o guardá reflexiones íntimas.',
      icon: BookIcon,
      badge: 'Espacio confidencial'
    },
    {
      id: 'my-music',
      title: 'Mi Música (Spotify & YouTube)',
      desc: 'Buscá canciones, coleccioná a tus artistas predilectos y creá listas de paz.',
      icon: MusicIcon,
      badge: 'Nueva Sección ✨'
    },
    {
      id: 'music',
      title: 'Sonidos Ambientales',
      desc: 'Lluvia serena, bosque, melodías de piano y frecuencias relajantes.',
      icon: SparklesIcon,
      badge: 'Paisajes sonoros'
    },
    {
      id: 'breathing',
      title: 'Respirar y volver al presente',
      desc: 'Círculo visual suave para desacelerar y regular el ritmo respiratorio.',
      icon: WindIcon,
      badge: 'Pausa guiada'
    },
    {
      id: 'refuge',
      title: 'Mi refugio',
      desc: 'Herramientas y sugerencias personalizadas según cómo te sentís hoy.',
      icon: CompassIcon,
      badge: 'Personalizado'
    },
    {
      id: 'history',
      title: 'Mi historial emocional',
      desc: 'Calendario y tendencias personales sin juicios ni diagnósticos médicos.',
      icon: ChartIcon,
      badge: 'Gráficos y registros'
    },
    {
      id: 'activities',
      title: 'Actividades de bienestar',
      desc: 'Grounding 5-4-3-2-1, relajación corporal y orden de pensamientos.',
      icon: SparklesIcon,
      badge: 'Ejercicios breves'
    },
    {
      id: 'profile',
      title: 'Mi perfil y privacidad',
      desc: 'Preferencias sensoriales, accesibilidad, exportar datos y ajustes.',
      icon: SettingsIcon,
      badge: 'Control de datos'
    }
  ];

  return (
    <div className="container page-container">
      {/* Encabezado contextual */}
      <header style={{ marginBottom: '36px' }}>
        <p style={{ color: '#A4CBB3', fontSize: '0.92rem', marginBottom: '4px', letterSpacing: '0.04em' }}>
          {capitalizedDate}
        </p>
        <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.6rem)', color: '#F1F1EB', marginBottom: '8px' }}>
          {getContextualGreeting()}, {user?.display_name || 'amigo/a'}.
        </h1>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.15rem', color: '#A4CBB3' }}>
          "Este momento también merece un espacio para vos."
        </p>
      </header>

      {/* Banner de Registro Rápido */}
      <section 
        className="card"
        style={{
          marginBottom: '36px',
          background: 'linear-gradient(135deg, rgba(23, 40, 32, 0.75) 0%, rgba(16, 22, 18, 0.85) 100%)',
          border: '1px solid rgba(164, 203, 179, 0.25)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#F1F1EB', marginBottom: '4px' }}>
            ¿Cómo te gustaría acompañarte hoy?
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#A9AFAC', margin: 0 }}>
            Una pausa de dos minutos para escuchar lo que tu cuerpo y mente necesitan.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => onNavigate('mood')}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          >
            <HeartIcon size={16} />
            <span>Registrar cómo me siento</span>
          </button>
          <button 
            onClick={() => onNavigate('breathing')}
            className="btn-secondary"
            style={{ padding: '10px 20px', fontSize: '0.9rem' }}
          >
            <WindIcon size={16} />
            <span>Respirar un momento</span>
          </button>
        </div>
      </section>

      {/* Grid de 8 Tarjetas Principales */}
      <section 
        aria-label="Acceso a módulos de LÚMINA"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px'
        }}
      >
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.id}
              onClick={() => onNavigate(c.id)}
              className="card card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '180px'
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onNavigate(c.id)}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(40, 102, 75, 0.3)',
                    border: '1px solid rgba(164, 203, 179, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#A4CBB3'
                  }}>
                    <Icon size={22} />
                  </div>
                  <span style={{
                    fontSize: '0.74rem',
                    color: '#A4CBB3',
                    backgroundColor: 'rgba(164, 203, 179, 0.1)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(164, 203, 179, 0.18)'
                  }}>
                    {c.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.15rem', color: '#F1F1EB', marginBottom: '6px' }}>
                  {c.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#A9AFAC', lineHeight: '1.5' }}>
                  {c.desc}
                </p>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: '#A4CBB3', fontSize: '0.85rem', fontWeight: 500 }}>
                <span>Abrir espacio</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
