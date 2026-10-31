import React, { useState, useEffect, useRef } from 'react';
import { WindIcon, SparklesIcon } from '../components/Icons';
import { activityService } from '../services/api';

const PATTERNS = {
  suave: {
    name: 'Respiración Suave (4-4)',
    desc: 'Un ritmo natural y fluido sin retenciones. Ideal para principiantes o momentos de tensión leve.',
    steps: [
      { name: 'Inhalá suavemente', duration: 4, scale: 1.35, glowOpacity: 0.8 },
      { name: 'Exhalá despacio', duration: 4, scale: 1.0, glowOpacity: 0.2 }
    ]
  },
  cuadrada: {
    name: 'Respiración Cuadrada (4-4-4-4)',
    desc: 'Equilibra el sistema nervioso mediante fases simétricas de inhalación, retención y exhalación.',
    steps: [
      { name: 'Inhalá', duration: 4, scale: 1.4, glowOpacity: 0.9 },
      { name: 'Sostené con calma', duration: 4, scale: 1.4, glowOpacity: 0.7 },
      { name: 'Exhalá lentamente', duration: 4, scale: 1.0, glowOpacity: 0.2 },
      { name: 'Pausa breve', duration: 4, scale: 1.0, glowOpacity: 0.1 }
    ]
  },
  calma: {
    name: 'Calma Profunda (4-7-8)',
    desc: 'Exhalaciones prolongadas para desacelerar pulsaciones y facilitar el reposo.',
    steps: [
      { name: 'Inhalá por la nariz', duration: 4, scale: 1.35, glowOpacity: 0.8 },
      { name: 'Retención suave', duration: 7, scale: 1.35, glowOpacity: 0.6 },
      { name: 'Exhalá suavemente por la boca', duration: 8, scale: 1.0, glowOpacity: 0.15 }
    ]
  }
};

export default function BreathingExercise({ onNavigate }) {
  const [selectedPatternKey, setSelectedPatternKey] = useState('suave');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepSecondsLeft, setStepSecondsLeft] = useState(4);
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState(0);
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(3);
  const [completed, setCompleted] = useState(false);

  const pattern = PATTERNS[selectedPatternKey];
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setStepSecondsLeft(prev => {
        if (prev <= 1) {
          // Cambiar al siguiente paso del ciclo
          setCurrentStepIndex(curr => (curr + 1) % pattern.steps.length);
          const nextIndex = (currentStepIndex + 1) % pattern.steps.length;
          return pattern.steps[nextIndex].duration;
        }
        return prev - 1;
      });

      setTotalSecondsElapsed(prev => {
        const nextSec = prev + 1;
        if (nextSec >= targetDurationMinutes * 60) {
          handleFinishSession(nextSec);
        }
        return nextSec;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, currentStepIndex, pattern, targetDurationMinutes]);

  const handleStart = () => {
    setTotalSecondsElapsed(0);
    setCurrentStepIndex(0);
    setStepSecondsLeft(pattern.steps[0].duration);
    setCompleted(false);
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (totalSecondsElapsed > 15) {
      handleFinishSession(totalSecondsElapsed);
    }
  };

  const handleFinishSession = async (seconds) => {
    setIsRunning(false);
    setCompleted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Guardar en historial de actividades si duró más de 15 segundos
    try {
      await activityService.complete('act_respiracion_suave', seconds);
    } catch (e) {
      console.warn('Error al registrar actividad en historial:', e);
    }
  };

  const currentStep = pattern.steps[currentStepIndex];

  return (
    <div className="container page-container" style={{ maxWidth: '780px', textAlign: 'center' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#F1F1EB', marginBottom: '8px' }}>
          Respirar y volver al presente
        </h1>
        <p style={{ color: '#A9AFAC', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Una guía visual suave para reconectar con el compás de tu cuerpo. No fuerces inhalaciones ni retenciones.
        </p>
      </header>

      {/* Aclaración amable de confort */}
      <div style={{
        padding: '12px 18px',
        backgroundColor: 'rgba(23, 40, 32, 0.6)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '28px',
        fontSize: '0.86rem',
        color: '#A9AFAC'
      }}>
        💡 <strong>Recomendación:</strong> Si cualquier ejercicio de respiración te produce mareo o incomodidad, detenelo inmediatamente y respirá con normalidad.
      </div>

      {!isRunning && !completed ? (
        <div className="card" style={{ padding: '32px', textAlign: 'left', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#F1F1EB', marginBottom: '16px' }}>
            Configurá tu ejercicio
          </h2>

          {/* Patrones de respiración */}
          <div style={{ marginBottom: '24px' }}>
            <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>
              Patrón de respiración:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(PATTERNS).map(([key, pat]) => {
                const isSelected = selectedPatternKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedPatternKey(key)}
                    style={{
                      textAlign: 'left',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'rgba(40, 102, 75, 0.35)' : 'rgba(26, 32, 28, 0.6)',
                      border: isSelected ? '1px solid #A4CBB3' : '1px solid var(--color-border)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <strong style={{ color: isSelected ? '#A4CBB3' : '#F1F1EB', display: 'block', fontSize: '1rem' }}>
                      {pat.name}
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: '#A9AFAC', display: 'block', marginTop: '2px' }}>
                      {pat.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duración deseada */}
          <div style={{ marginBottom: '32px' }}>
            <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>
              Duración estimada:
            </label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[1, 2, 3, 5].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setTargetDurationMinutes(mins)}
                  className={`btn-ghost ${targetDurationMinutes === mins ? 'selected' : ''}`}
                  style={{
                    backgroundColor: targetDurationMinutes === mins ? 'rgba(40, 102, 75, 0.4)' : 'rgba(32, 37, 34, 0.6)',
                    color: targetDurationMinutes === mins ? '#F1F1EB' : '#A9AFAC',
                    border: targetDurationMinutes === mins ? '1px solid #A4CBB3' : '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-full)',
                    padding: '8px 20px'
                  }}
                >
                  {mins} {mins === 1 ? 'minuto' : 'minutos'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleStart}
              className="btn-primary"
              style={{ padding: '14px 38px', fontSize: '1.05rem' }}
            >
              Comenzar ejercicio de respiración
            </button>
          </div>
        </div>
      ) : isRunning ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Círculo de Respiración Animado */}
          <div className="breathing-circle-container">
            <div
              className="breathing-glow"
              style={{
                transform: `scale(${currentStep.scale * 1.15})`,
                opacity: currentStep.glowOpacity
              }}
            />
            <div
              className="breathing-disc"
              style={{
                transform: `scale(${currentStep.scale})`
              }}
            >
              <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#F1F1EB', textAlign: 'center', padding: '0 10px' }}>
                {currentStep.name}
              </span>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: '#A4CBB3', marginTop: '6px' }}>
                {stepSecondsLeft}s
              </span>
            </div>
          </div>

          <p style={{ color: '#A9AFAC', fontSize: '0.95rem', marginBottom: '24px' }}>
            Tiempo transcurrido: {Math.floor(totalSecondsElapsed / 60)}:{(totalSecondsElapsed % 60).toString().padStart(2, '0')} / {targetDurationMinutes}:00
          </p>

          <button
            onClick={handleStop}
            className="btn-secondary"
            style={{ padding: '10px 28px', color: '#ff9d94', borderColor: 'rgba(201, 98, 87, 0.3)' }}
          >
            Detener ejercicio
          </button>
        </div>
      ) : (
        /* Pantalla de finalización amable */
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(40, 102, 75, 0.4)',
            color: '#A4CBB3',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <SparklesIcon size={32} />
          </div>

          <h2 style={{ fontSize: '1.6rem', color: '#F1F1EB', marginBottom: '8px' }}>
            Gracias por regalarte esta pausa
          </h2>
          <p style={{ color: '#A9AFAC', maxWidth: '480px', margin: '0 auto 24px auto', fontSize: '1rem', lineHeight: '1.6' }}>
            Completaste {Math.floor(totalSecondsElapsed / 60)} min {totalSecondsElapsed % 60} s de respiración consciente. Notá cómo se siente tu cuerpo en este instante.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setCompleted(false); setIsRunning(false); }}
              className="btn-secondary"
            >
              Otro ciclo de respiración
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="btn-primary"
            >
              Volver a mi espacio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
