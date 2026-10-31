import React, { useState, useEffect } from 'react';
import { activityService } from '../services/api';
import { SparklesIcon, CompassIcon, HeartIcon } from '../components/Icons';
import Modal from '../components/Modal';

export default function WellnessActivities({ onNavigate }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    async function loadActivities() {
      try {
        const res = await activityService.list();
        if (res.success && res.data) {
          setActivities(res.data);
        }
      } catch (e) {
        console.warn('Error al cargar actividades:', e);
      } finally {
        setLoading(false);
      }
    }
    loadActivities();
  }, []);

  const startExercise = (activity) => {
    setSelectedActivity(activity);
    setActiveStepIndex(0);
    setSessionCompleted(false);
  };

  const handleNextStep = () => {
    if (activeStepIndex < selectedActivity.instructions.length - 1) {
      setActiveStepIndex(prev => prev + 1);
    } else {
      finishExercise();
    }
  };

  const finishExercise = async () => {
    setCompleting(true);
    try {
      await activityService.complete(selectedActivity.id, selectedActivity.duration_minutes * 60);
      setSessionCompleted(true);
    } catch (e) {
      console.warn('Error al guardar completitud de actividad:', e);
      setSessionCompleted(true);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="container page-container">
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#F1F1EB', marginBottom: '8px' }}>
          Actividades de bienestar y calma
        </h1>
        <p style={{ color: '#A9AFAC', maxWidth: '650px', fontSize: '1rem' }}>
          Ejercicios breves basados en conexión sensorial, desahogo y descanso para momentos de sobrecarga, angustia o tensión.
        </p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#A9AFAC' }}>
          Cargando actividades disponibles...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {activities.map((act) => (
            <div
              key={act.id}
              className="card card-interactive"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '230px'
              }}
              onClick={() => startExercise(act)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={{
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#A4CBB3',
                    backgroundColor: 'rgba(40, 102, 75, 0.3)',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)'
                  }}>
                    {act.category}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#A9AFAC' }}>
                    ~{act.duration_minutes} min
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', color: '#F1F1EB', marginBottom: '8px' }}>
                  {act.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#A9AFAC', lineHeight: '1.6' }}>
                  {act.description}
                </p>
              </div>

              <div style={{
                marginTop: '18px',
                borderTop: '1px solid rgba(164, 203, 179, 0.1)',
                paddingTop: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.82rem', color: '#79837e' }}>
                  {act.instructions.length} pasos guiados
                </span>
                <span style={{ color: '#A4CBB3', fontSize: '0.9rem', fontWeight: 600 }}>
                  Realizar ejercicio →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Interactivo de Ejecución de la Actividad */}
      <Modal
        isOpen={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
        title={selectedActivity?.title || 'Actividad de bienestar'}
        maxWidth="620px"
      >
        {selectedActivity && !sessionCompleted && (
          <div>
            {/* Progreso de pasos */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
              {selectedActivity.instructions.map((_, idx) => (
                <div
                  key={idx}
                  style={{
                    height: '4px',
                    flex: 1,
                    borderRadius: '2px',
                    backgroundColor: activeStepIndex >= idx ? '#A4CBB3' : 'rgba(255, 255, 255, 0.1)'
                  }}
                />
              ))}
            </div>

            <span style={{ fontSize: '0.85rem', color: '#A4CBB3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Paso {activeStepIndex + 1} de {selectedActivity.instructions.length}
            </span>

            {/* Tarjeta del paso actual */}
            <div style={{
              backgroundColor: 'rgba(23, 40, 32, 0.6)',
              border: '1px solid rgba(164, 203, 179, 0.25)',
              padding: '24px',
              borderRadius: 'var(--radius-md)',
              margin: '16px 0 28px 0',
              minHeight: '140px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <p style={{
                fontSize: '1.15rem',
                lineHeight: '1.7',
                color: '#F1F1EB',
                margin: 0
              }}>
                {selectedActivity.instructions[activeStepIndex]}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setSelectedActivity(null)}
                className="btn-ghost"
              >
                Cerrar
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                {activeStepIndex > 0 && (
                  <button
                    onClick={() => setActiveStepIndex(prev => prev - 1)}
                    className="btn-secondary"
                  >
                    Anterior
                  </button>
                )}
                <button
                  onClick={handleNextStep}
                  className="btn-primary"
                  disabled={completing}
                >
                  {activeStepIndex === selectedActivity.instructions.length - 1 ? 'Finalizar actividad' : 'Siguiente paso →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {sessionCompleted && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(40, 102, 75, 0.4)',
              color: '#A4CBB3',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <SparklesIcon size={28} />
            </div>

            <h3 style={{ fontSize: '1.4rem', color: '#F1F1EB', marginBottom: '8px' }}>
              Actividad completada
            </h3>
            <p style={{ color: '#A9AFAC', fontSize: '0.95rem', marginBottom: '24px', lineHeight: '1.6' }}>
              Has dedicado tiempo valioso a cuidar tu bienestar. Este momento queda registrado en tu historial personal.
            </p>

            <button
              onClick={() => setSelectedActivity(null)}
              className="btn-primary"
            >
              Regresar a las actividades
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
