import React, { useState } from 'react';
import { moodService } from '../services/api';
import { HeartIcon, BookIcon, MusicIcon, WindIcon, SparklesIcon } from '../components/Icons';
import Modal from '../components/Modal';

const EMOTIONS_LIST = [
  { name: 'Alegría', color: '#e4b363' },
  { name: 'Tranquilidad', color: '#A4CBB3' },
  { name: 'Tristeza', color: '#6ca0b8' },
  { name: 'Ansiedad', color: '#d97d64' },
  { name: 'Estrés', color: '#e08f62' },
  { name: 'Enojo', color: '#c96257' },
  { name: 'Miedo', color: '#9b76a6' },
  { name: 'Confusión', color: '#889e90' },
  { name: 'Soledad', color: '#7a8ba3' },
  { name: 'Agotamiento', color: '#918b82' },
  { name: 'Esperanza', color: '#6ec596' },
  { name: 'Gratitud', color: '#e6c875' }
];

const FACTORS_LIST = [
  'Trabajo / Estudio', 'Familia', 'Pareja', 'Amistades',
  'Falta de sueño', 'Salud física', 'Clima / Ambiente',
  'Sobrecarga mental', 'Tiempo a solas', 'Noticias'
];

const ACTIVITIES_LIST = [
  'Respiración guiada', 'Música o sonidos de lluvia',
  'Escribir en el diario', 'Caminata corta',
  'Tomar una infusión caliente', 'Hablar con alguien de confianza'
];

const INTENSITY_DESCRIPTIONS = {
  1: '1 — Muy leve / apenas perceptible',
  2: '2 — Suave / manejable',
  3: '3 — Presente / moderada',
  4: '4 — Intensa / requiere atención',
  5: '5 — Muy intensa / abrumadora'
};

export default function MoodTracker({ onNavigate }) {
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [intensity, setIntensity] = useState(3);
  const [selectedFactors, setSelectedFactors] = useState([]);
  const [customFactor, setCustomFactor] = useState('');
  const [note, setNote] = useState('');
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [lastCreatedId, setLastCreatedId] = useState(null);

  const toggleEmotion = (name) => {
    if (selectedEmotions.includes(name)) {
      setSelectedEmotions(selectedEmotions.filter(e => e !== name));
    } else {
      setSelectedEmotions([...selectedEmotions, name]);
    }
  };

  const toggleFactor = (item) => {
    if (selectedFactors.includes(item)) {
      setSelectedFactors(selectedFactors.filter(f => f !== item));
    } else {
      setSelectedFactors([...selectedFactors, item]);
    }
  };

  const addCustomFactor = () => {
    if (customFactor.trim() && !selectedFactors.includes(customFactor.trim())) {
      setSelectedFactors([...selectedFactors, customFactor.trim()]);
      setCustomFactor('');
    }
  };

  const toggleActivity = (act) => {
    if (selectedActivities.includes(act)) {
      setSelectedActivities(selectedActivities.filter(a => a !== act));
    } else {
      setSelectedActivities([...selectedActivities, act]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedEmotions.length === 0) {
      setErrorMsg('Por favor, seleccioná al menos una emoción para registrar.');
      return;
    }
    setErrorMsg('');
    setSaving(true);

    try {
      const res = await moodService.create({
        emotions: selectedEmotions,
        intensity: parseInt(intensity, 10),
        factors: selectedFactors,
        context_note: note,
        helpful_activities: selectedActivities
      });

      if (res.success && res.data) {
        setLastCreatedId(res.data.id);
        setShowPostModal(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar el registro emocional.');
    } finally {
      setSaving(false);
    }
  };

  const handlePostAction = async (action) => {
    if (lastCreatedId && action !== 'terminar') {
      try {
        await moodService.update(lastCreatedId, { post_action: action });
      } catch (e) {}
    }
    setShowPostModal(false);

    if (action === 'escribir') onNavigate('journal-new');
    else if (action === 'musica') onNavigate('music');
    else if (action === 'respirar') onNavigate('breathing');
    else if (action === 'actividad') onNavigate('activities');
    else onNavigate('dashboard');
  };

  return (
    <div className="container page-container" style={{ maxWidth: '800px' }}>
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#F1F1EB', marginBottom: '8px' }}>
          Mi estado emocional
        </h1>
        <p style={{ color: '#A9AFAC', fontSize: '1.05rem' }}>
          Nombrar lo que sentimos es el primer paso para volver a la calma. No hay respuestas correctas o incorrectas.
        </p>
      </header>

      {errorMsg && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(201, 98, 87, 0.15)',
          border: '1px solid rgba(201, 98, 87, 0.4)',
          color: '#ff9d94',
          marginBottom: '24px'
        }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* 1. Selección de Emociones */}
        <section className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#F1F1EB', marginBottom: '6px' }}>
            1. ¿Qué emociones reconocés en vos ahora?
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#A9AFAC', marginBottom: '16px' }}>
            Podés elegir una o varias.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {EMOTIONS_LIST.map((em) => {
              const isSelected = selectedEmotions.includes(em.name);
              return (
                <button
                  type="button"
                  key={em.name}
                  onClick={() => toggleEmotion(em.name)}
                  className={`emotion-badge ${isSelected ? 'selected' : ''}`}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.92rem',
                    borderColor: isSelected ? em.color : undefined
                  }}
                >
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: em.color,
                    display: 'inline-block'
                  }} />
                  <span>{em.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Escala de Intensidad */}
        <section className="card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#F1F1EB' }}>
              2. Intensidad subjetiva de este momento
            </h2>
            <span style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: '#A4CBB3',
              backgroundColor: 'rgba(40, 102, 75, 0.3)',
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)'
            }}>
              {intensity} / 5
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#A9AFAC', marginBottom: '20px' }}>
            {INTENSITY_DESCRIPTIONS[intensity]}
          </p>

          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
            style={{
              width: '100%',
              accentColor: '#A4CBB3',
              cursor: 'pointer',
              height: '8px'
            }}
            aria-label="Escala de intensidad emocional de 1 a 5"
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#79837e', marginTop: '8px' }}>
            <span>1 (Leve)</span>
            <span>2 (Suave)</span>
            <span>3 (Presente)</span>
            <span>4 (Intensa)</span>
            <span>5 (Abrumadora)</span>
          </div>
        </section>

        {/* 3. Factores Asociados */}
        <section className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#F1F1EB', marginBottom: '6px' }}>
            3. Factores o desencadenantes que influyen hoy
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#A9AFAC', marginBottom: '16px' }}>
            Opcional: te ayudará a reconocer qué situaciones impactan en tu bienestar.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {FACTORS_LIST.map((factor) => {
              const isSelected = selectedFactors.includes(factor);
              return (
                <button
                  type="button"
                  key={factor}
                  onClick={() => toggleFactor(factor)}
                  className={`emotion-badge ${isSelected ? 'selected' : ''}`}
                >
                  {factor}
                </button>
              );
            })}
          </div>

          {/* Factor personalizado */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Agregar otro factor..."
              value={customFactor}
              onChange={(e) => setCustomFactor(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFactor())}
              className="form-input"
              style={{ flex: 1, padding: '8px 14px', fontSize: '0.88rem' }}
            />
            <button
              type="button"
              onClick={addCustomFactor}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            >
              Agregar
            </button>
          </div>
        </section>

        {/* 4. Nota de Contexto */}
        <section className="card" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#F1F1EB', marginBottom: '6px' }}>
            4. Una nota para vos (Opcional)
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#A9AFAC', marginBottom: '12px' }}>
            Cualquier detalle que quieras recordar de este instante.
          </p>

          <textarea
            rows="3"
            placeholder="¿Qué pasa por tu mente ahora mismo?..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="form-textarea"
            style={{ width: '100%', resize: 'vertical' }}
          />
        </section>

        {/* 5. Actividades que podrían ayudar */}
        <section className="card" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#F1F1EB', marginBottom: '6px' }}>
            5. ¿Qué podría hacerte bien ahora?
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#A9AFAC', marginBottom: '16px' }}>
            Marcá una intención amable para este momento.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {ACTIVITIES_LIST.map((act) => {
              const isSelected = selectedActivities.includes(act);
              return (
                <button
                  type="button"
                  key={act}
                  onClick={() => toggleActivity(act)}
                  className={`emotion-badge ${isSelected ? 'selected' : ''}`}
                >
                  {act}
                </button>
              );
            })}
          </div>
        </section>

        {/* Botones de acción */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="btn-ghost"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
            style={{ padding: '12px 28px', fontSize: '1rem' }}
          >
            {saving ? 'Guardando en tu refugio...' : 'Guardar registro'}
          </button>
        </div>
      </form>

      {/* Modal post-registro */}
      <Modal
        isOpen={showPostModal}
        onClose={() => handlePostAction('terminar')}
        title="Tu registro ha sido guardado con cuidado"
      >
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(40, 102, 75, 0.4)',
            color: '#A4CBB3',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <HeartIcon size={30} />
          </div>

          <h3 style={{ fontSize: '1.35rem', color: '#F1F1EB', marginBottom: '8px' }}>
            ¿Qué te gustaría hacer ahora?
          </h3>
          <p style={{ color: '#A9AFAC', fontSize: '0.95rem', marginBottom: '24px' }}>
            Podés continuar acompañándote con alguna de estas herramientas o regresar a tu panel.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '380px', margin: '0 auto 24px auto' }}>
            <button
              onClick={() => handlePostAction('escribir')}
              className="btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '12px 18px' }}
            >
              <BookIcon size={18} />
              <span>Escribir en mi diario privado</span>
            </button>

            <button
              onClick={() => handlePostAction('musica')}
              className="btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '12px 18px' }}
            >
              <MusicIcon size={18} />
              <span>Escuchar música y sonidos de calma</span>
            </button>

            <button
              onClick={() => handlePostAction('respirar')}
              className="btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '12px 18px' }}
            >
              <WindIcon size={18} />
              <span>Hacer una pausa para respirar</span>
            </button>

            <button
              onClick={() => handlePostAction('actividad')}
              className="btn-secondary"
              style={{ justifyContent: 'flex-start', padding: '12px 18px' }}
            >
              <SparklesIcon size={18} />
              <span>Explorar actividades de bienestar</span>
            </button>
          </div>

          <button
            onClick={() => handlePostAction('terminar')}
            className="btn-primary"
            style={{ width: '100%', maxWidth: '380px' }}
          >
            Simplemente terminar por hoy
          </button>
        </div>
      </Modal>
    </div>
  );
}
