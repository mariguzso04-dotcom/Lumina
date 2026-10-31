import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CompassIcon, HeartIcon, MusicIcon } from '../components/Icons';

export default function OnboardingWizard({ onComplete }) {
  const { preferences, updatePreferences } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedContext, setSelectedContext] = useState('');
  const [selectedAmbience, setSelectedAmbience] = useState([]);
  const [saving, setSaving] = useState(false);

  const goalOptions = [
    'Calmar la ansiedad.',
    'Acompañarme en momentos de tristeza.',
    'Manejar el estrés.',
    'Entender mis emociones.',
    'Mejorar mis hábitos de bienestar.',
    'Explorar las herramientas disponibles.'
  ];

  const contextOptions = [
    'Tengo un diagnóstico profesional.',
    'Estoy pasando por un momento difícil, pero no tengo un diagnóstico.',
    'Prefiero no responder.',
    'Quiero explorar sin indicar ninguna condición.'
  ];

  const ambienceOptions = [
    'Sonidos de lluvia suave y tormenta lejana',
    'Viento entre los árboles del bosque',
    'Melodías de piano acústico',
    'Tonos verdes oscuros y luz difuminada',
    'Ejercicios guiados de respiración',
    'Silencio y espacio libre de estímulos'
  ];

  const handleToggleAmbience = (item) => {
    if (selectedAmbience.includes(item)) {
      setSelectedAmbience(selectedAmbience.filter(a => a !== item));
    } else {
      setSelectedAmbience([...selectedAmbience, item]);
    }
  };

  const handleFinish = async (skip = false) => {
    setSaving(true);
    try {
      const answers = skip ? {} : {
        goal: selectedGoal,
        context: selectedContext,
        ambience: selectedAmbience
      };

      await updatePreferences({
        onboarding_completed: true,
        onboarding_answers: answers
      });
    } catch (e) {
      console.warn('Error al guardar preferencias de onboarding:', e);
    } finally {
      setSaving(false);
      onComplete();
    }
  };

  return (
    <div 
      style={{
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px'
      }}
    >
      <div 
        className="card"
        style={{
          maxWidth: '680px',
          width: '100%',
          padding: '36px',
          backgroundColor: '#17221b',
          border: '1px solid rgba(164, 203, 179, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Progreso del Onboarding */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[1, 2, 3].map((s) => (
              <div 
                key={s}
                style={{
                  width: '32px',
                  height: '4px',
                  borderRadius: '2px',
                  backgroundColor: step >= s ? '#A4CBB3' : 'rgba(255, 255, 255, 0.1)',
                  transition: 'background-color 0.3s ease'
                }}
              />
            ))}
          </div>
          <span style={{ fontSize: '0.85rem', color: '#A9AFAC' }}>Paso {step} de 3</span>
        </div>

        {/* Paso 1: Objetivo deseado */}
        {step === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#A4CBB3', marginBottom: '10px' }}>
              <CompassIcon size={22} />
              <span style={{ fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Tu intención
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#F1F1EB', marginBottom: '12px' }}>
              ¿Qué te gustaría encontrar en LÚMINA?
            </h2>
            <p style={{ color: '#A9AFAC', marginBottom: '24px', fontSize: '0.95rem' }}>
              Podés elegir una opción orientativa. Esto nos ayuda a priorizar accesos acordes en tu refugio.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
              {goalOptions.map((goal) => {
                const isSelected = selectedGoal === goal;
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setSelectedGoal(goal)}
                    style={{
                      textAlign: 'left',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'rgba(40, 102, 75, 0.4)' : 'rgba(26, 32, 28, 0.6)',
                      border: isSelected ? '1px solid #A4CBB3' : '1px solid var(--color-border)',
                      color: isSelected ? '#F1F1EB' : '#A9AFAC',
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                type="button" 
                onClick={() => handleFinish(true)} 
                className="btn-ghost"
              >
                Omitir
              </button>
              <button 
                type="button" 
                onClick={() => setStep(2)} 
                className="btn-primary"
                disabled={!selectedGoal}
                style={{ opacity: selectedGoal ? 1 : 0.6 }}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Paso 2: Contexto voluntario */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#A4CBB3', marginBottom: '10px' }}>
              <HeartIcon size={22} />
              <span style={{ fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Tu bienestar
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#F1F1EB', marginBottom: '12px' }}>
              ¿Hay algo que quieras contarnos sobre tu bienestar emocional?
            </h2>
            <p style={{ color: '#A9AFAC', marginBottom: '24px', fontSize: '0.95rem' }}>
              Esta respuesta es completamente opcional. LÚMINA nunca te exigirá declarar ninguna condición ni realizará diagnósticos clínicos.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
              {contextOptions.map((opt) => {
                const isSelected = selectedContext === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setSelectedContext(opt)}
                    style={{
                      textAlign: 'left',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'rgba(40, 102, 75, 0.4)' : 'rgba(26, 32, 28, 0.6)',
                      border: isSelected ? '1px solid #A4CBB3' : '1px solid var(--color-border)',
                      color: isSelected ? '#F1F1EB' : '#A9AFAC',
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="btn-ghost"
              >
                Atrás
              </button>
              <button 
                type="button" 
                onClick={() => setStep(3)} 
                className="btn-primary"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* Paso 3: Preferencias de ambiente */}
        {step === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#A4CBB3', marginBottom: '10px' }}>
              <MusicIcon size={22} />
              <span style={{ fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Tu refugio sensorial
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#F1F1EB', marginBottom: '12px' }}>
              ¿Qué ambiente te ayuda a sentirte a gusto?
            </h2>
            <p style={{ color: '#A9AFAC', marginBottom: '24px', fontSize: '0.95rem' }}>
              Podés marcar todos los que te agraden. Podrás modificarlos más tarde en tus ajustes.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '32px' }}>
              {ambienceOptions.map((amb) => {
                const isSelected = selectedAmbience.includes(amb);
                return (
                  <button
                    key={amb}
                    type="button"
                    onClick={() => handleToggleAmbience(amb)}
                    style={{
                      textAlign: 'left',
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'rgba(40, 102, 75, 0.4)' : 'rgba(26, 32, 28, 0.6)',
                      border: isSelected ? '1px solid #A4CBB3' : '1px solid var(--color-border)',
                      color: isSelected ? '#F1F1EB' : '#A9AFAC',
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{amb}</span>
                    <span style={{ color: isSelected ? '#A4CBB3' : '#79837e' }}>
                      {isSelected ? '✓' : '+'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                type="button" 
                onClick={() => setStep(2)} 
                className="btn-ghost"
              >
                Atrás
              </button>
              <button 
                type="button" 
                onClick={() => handleFinish(false)} 
                className="btn-primary"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Entrar a mi espacio'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
