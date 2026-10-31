import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAudio } from '../context/AudioContext';
import { moodService, activityService } from '../services/api';
import { CompassIcon, HeartIcon, MusicIcon, BookIcon, WindIcon, SparklesIcon } from '../components/Icons';

export default function MyRefuge({ onNavigate }) {
  const { user } = useAuth();
  const { playTrack, tracks } = useAudio();
  const [activeMoodFocus, setActiveMoodFocus] = useState('Ansiedad');
  const [recentMood, setRecentMood] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCurrent() {
      try {
        const res = await moodService.list({ limit: 1 });
        if (res.success && res.data && res.data.length > 0) {
          setRecentMood(res.data[0]);
          if (res.data[0].emotions.length > 0) {
            setActiveMoodFocus(res.data[0].emotions[0]);
          }
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }
    loadCurrent();
  }, []);

  const getRecommendations = (emotion) => {
    switch (emotion) {
      case 'Ansiedad':
      case 'Miedo':
        return {
          title: 'Para momentos de ansiedad o sobreestimulación',
          desc: 'Herramientas suaves para anclar la mente en el presente y soltar la tensión física.',
          items: [
            {
              type: 'activity',
              title: 'Conexión con el presente (5-4-3-2-1)',
              desc: 'Utilizá tus cinco sentidos para regresar aquí y ahora.',
              action: () => onNavigate('activities'),
              btnText: 'Comenzar anclaje'
            },
            {
              type: 'music',
              title: 'Lluvia serena en el cristal',
              desc: 'Ruido rosa suave para calmar el ritmo cardíaco.',
              action: () => {
                const trk = tracks.find(t => t.category === 'Lluvia') || tracks[0];
                playTrack(trk);
              },
              btnText: 'Escuchar lluvia'
            },
            {
              type: 'journal',
              title: 'Nombrar lo que pesa',
              desc: 'Escribir separa lo que sentís de tu identidad real.',
              action: () => onNavigate('journal-new'),
              btnText: 'Abrir cuaderno'
            }
          ]
        };

      case 'Tristeza':
      case 'Soledad':
        return {
          title: 'Para momentos de tristeza o melancolía',
          desc: 'Espacios amables para abrazar tus sentimientos sin exigirte estar bien inmediatamente.',
          items: [
            {
              type: 'music',
              title: 'Notas de piano y sosiego',
              desc: 'Melodías lentas para cobijar tu momento a solas.',
              action: () => {
                const trk = tracks.find(t => t.category === 'Piano') || tracks[0];
                playTrack(trk);
              },
              btnText: 'Poner piano'
            },
            {
              type: 'activity',
              title: 'Guía para acercarte a una persona de confianza',
              desc: 'Sugerencias breves para pedir compañía sin exigencias.',
              action: () => onNavigate('activities'),
              btnText: 'Ver guía'
            },
            {
              type: 'journal',
              title: 'Expresar lo no dicho',
              desc: 'Un espacio íntimo para soltar lágrimas o palabras.',
              action: () => onNavigate('journal-new'),
              btnText: 'Escribir'
            }
          ]
        };

      case 'Estrés':
      case 'Agotamiento':
        return {
          title: 'Para momentos de sobrecarga mental y estrés',
          desc: 'Pausas conscientes para desacelerar y soltar lo que no depende de vos hoy.',
          items: [
            {
              type: 'breathing',
              title: 'Respiración de Calma (4-4)',
              desc: '3 minutos para oxigenar tu mente.',
              action: () => onNavigate('breathing'),
              btnText: 'Iniciar respiración'
            },
            {
              type: 'activity',
              title: 'Espacio para ordenar pensamientos',
              desc: 'Separar lo controlable de lo incontrolable.',
              action: () => onNavigate('activities'),
              btnText: 'Hacer ejercicio'
            },
            {
              type: 'music',
              title: 'Viento en los pinares',
              desc: 'Sonido continuo de naturaleza para descansar la vista.',
              action: () => {
                const trk = tracks.find(t => t.category === 'Bosque y naturaleza') || tracks[0];
                playTrack(trk);
              },
              btnText: 'Escuchar bosque'
            }
          ]
        };

      default:
        return {
          title: 'Exploración libre y serena',
          desc: 'Herramientas de relajación, creatividad y autorregulación emocional.',
          items: [
            {
              type: 'breathing',
              title: 'Respiración consciente',
              desc: 'Reconectar con tu propio compás.',
              action: () => onNavigate('breathing'),
              btnText: 'Respirar'
            },
            {
              type: 'music',
              title: 'Armónicos celestiales',
              desc: 'Vibraciones armónicas para meditar.',
              action: () => {
                const trk = tracks.find(t => t.category === 'Música tranquila') || tracks[0];
                playTrack(trk);
              },
              btnText: 'Escuchar música'
            },
            {
              type: 'journal',
              title: 'Agradecer y registrar',
              desc: 'Celebrar los pequeños instantes de paz.',
              action: () => onNavigate('journal-new'),
              btnText: 'Escribir'
            }
          ]
        };
    }
  };

  const currentRec = getRecommendations(activeMoodFocus);

  return (
    <div className="container page-container">
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#F1F1EB', marginBottom: '8px' }}>
          Mi refugio personalizado
        </h1>
        <p style={{ color: '#A9AFAC', maxWidth: '680px', fontSize: '1rem' }}>
          Un rincón donde las herramientas de LÚMINA se ordenan para acompañarte según lo que hoy elijas transitar.
        </p>
      </header>

      {/* Selector de foco emocional libre */}
      <section className="card" style={{ marginBottom: '32px', backgroundColor: 'rgba(23, 40, 32, 0.6)' }}>
        <p style={{ fontSize: '0.9rem', color: '#A4CBB3', fontWeight: 600, marginBottom: '12px' }}>
          ¿Qué emoción te gustaría acompañar ahora?
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['Ansiedad', 'Tristeza', 'Estrés', 'Agotamiento', 'Tranquilidad', 'Gratitud', 'Exploración general'].map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => setActiveMoodFocus(em)}
              className={`emotion-badge ${activeMoodFocus === em ? 'selected' : ''}`}
              style={{ fontSize: '0.9rem', padding: '8px 16px' }}
            >
              {em}
            </button>
          ))}
        </div>
      </section>

      {/* Sugerencias personalizadas */}
      <section>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem', color: '#F1F1EB', marginBottom: '4px' }}>
            {currentRec.title}
          </h2>
          <p style={{ color: '#A9AFAC', fontSize: '0.95rem' }}>
            {currentRec.desc}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {currentRec.items.map((item, idx) => (
            <div
              key={idx}
              className="card card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '190px'
              }}
              onClick={item.action}
            >
              <div>
                <span style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: '#A4CBB3',
                  backgroundColor: 'rgba(40, 102, 75, 0.3)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  display: 'inline-block',
                  marginBottom: '12px'
                }}>
                  {item.type}
                </span>

                <h3 style={{ fontSize: '1.2rem', color: '#F1F1EB', marginBottom: '6px' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#A9AFAC', lineHeight: '1.5' }}>
                  {item.desc}
                </p>
              </div>

              <div style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: '100%', fontSize: '0.88rem', padding: '10px 16px' }}
                >
                  {item.btnText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
