import React, { useState, useEffect } from 'react';
import { journalService } from '../services/api';
import { BookIcon, StarIcon, SparklesIcon } from '../components/Icons';

const PROMPTS = [
  '¿Qué estoy sintiendo en este momento?',
  '¿Qué me gustaría expresar y no he podido decir?',
  '¿Qué ha sido lo más difícil hoy?',
  '¿Qué necesito y no he sabido pedir?',
  '¿Qué pequeño detalle agradezco de este día?',
  '¿Qué le diría a alguien que quiero si estuviera pasando por esto?'
];

const MOOD_TAGS = [
  'Tranquilidad', 'Alegría', 'Tristeza', 'Ansiedad',
  'Estrés', 'Gratitud', 'Esperanza', 'Confusión', 'Agotamiento'
];

export default function JournalEditor({ entryId, onNavigate }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodTag, setMoodTag] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [loading, setLoading] = useState(Boolean(entryId));
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPrompts, setShowPrompts] = useState(false);

  useEffect(() => {
    if (entryId) {
      async function loadEntry() {
        try {
          const res = await journalService.getById(entryId);
          if (res.success && res.data) {
            setTitle(res.data.title);
            setContent(res.data.content);
            setMoodTag(res.data.mood_tag || '');
            setIsFavorite(Boolean(res.data.is_favorite));
            setIsDraft(Boolean(res.data.is_draft));
          }
        } catch (e) {
          setErrorMsg('No se pudo cargar la entrada solicitada.');
        } finally {
          setLoading(false);
        }
      }
      loadEntry();
    }
  }, [entryId]);

  const handleInsertPrompt = (promptText) => {
    setContent(prev => (prev ? `${prev}\n\n[Pregunta: ${promptText}]\n` : `[Pregunta: ${promptText}]\n`));
    setShowPrompts(false);
  };

  const handleSave = async (asDraft = false) => {
    if (!title.trim()) {
      setErrorMsg('Por favor, añadí un título a tu reflexión.');
      return;
    }
    setErrorMsg('');
    setSaving(true);

    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        mood_tag: moodTag || null,
        is_favorite: isFavorite,
        is_draft: asDraft
      };

      if (entryId) {
        await journalService.update(entryId, payload);
      } else {
        await journalService.create(payload);
      }

      onNavigate('journal');
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar en el diario.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container page-container" style={{ textAlign: 'center', color: '#A9AFAC' }}>
        Preparando la hoja en blanco...
      </div>
    );
  }

  return (
    <div className="container page-container" style={{ maxWidth: '820px' }}>
      <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#F1F1EB', marginBottom: '4px' }}>
            {entryId ? 'Editar entrada' : 'Nueva página en tu diario'}
          </h1>
          <p style={{ color: '#A9AFAC', fontSize: '0.92rem' }}>
            Tu espacio privado, protegido y libre de cualquier juicio externo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFavorite(!isFavorite)}
          className="btn-ghost"
          style={{ color: isFavorite ? '#e4b363' : '#A9AFAC', gap: '8px' }}
        >
          <StarIcon size={20} filled={isFavorite} />
          <span>{isFavorite ? 'Favorita' : 'Destacar'}</span>
        </button>
      </header>

      {errorMsg && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(201, 98, 87, 0.15)',
          border: '1px solid rgba(201, 98, 87, 0.4)',
          color: '#ff9d94',
          marginBottom: '20px'
        }}>
          {errorMsg}
        </div>
      )}

      {/* Sugerencias de escritura inspiradoras */}
      <div style={{ marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setShowPrompts(!showPrompts)}
          className="btn-secondary"
          style={{ fontSize: '0.88rem', padding: '8px 16px' }}
        >
          <SparklesIcon size={16} />
          <span>{showPrompts ? 'Ocultar preguntas de apoyo' : 'Inspirarme con preguntas de apoyo'}</span>
        </button>

        {showPrompts && (
          <div 
            className="card"
            style={{
              marginTop: '12px',
              backgroundColor: 'rgba(23, 40, 32, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <p style={{ fontSize: '0.85rem', color: '#A4CBB3', margin: 0, fontWeight: 500 }}>
              Hacé clic en una pregunta para insertarla en tu escrito:
            </p>
            {PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsertPrompt(p)}
                style={{
                  textAlign: 'left',
                  background: 'transparent',
                  color: '#F1F1EB',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  border: '1px solid transparent',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(164, 203, 179, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(164, 203, 179, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                ✦ {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
        {/* Título de la entrada */}
        <div className="form-group">
          <label htmlFor="journal-title" className="form-label" style={{ fontSize: '0.95rem' }}>
            Título o sentimiento rector
          </label>
          <input
            id="journal-title"
            type="text"
            placeholder="Ej: Un refugio en medio del ruido..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            style={{ fontSize: '1.2rem', fontWeight: 600 }}
          />
        </div>

        {/* Emoción asociada */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">
            Emoción asociada a esta entrada (Opcional):
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {MOOD_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setMoodTag(moodTag === tag ? '' : tag)}
                className={`emotion-badge ${moodTag === tag ? 'selected' : ''}`}
                style={{ fontSize: '0.85rem' }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Cuerpo del diario */}
        <div className="form-group">
          <label htmlFor="journal-content" className="form-label">
            Escribí libremente
          </label>
          <textarea
            id="journal-content"
            rows="14"
            placeholder="No te preocupes por la puntuación o la coherencia. Dejá salir las palabras a tu propio ritmo..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="form-textarea"
            style={{
              fontSize: '1.05rem',
              lineHeight: '1.8',
              resize: 'vertical'
            }}
          />
        </div>
      </div>

      {/* Botones de Guardar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => onNavigate('journal')}
          className="btn-ghost"
        >
          Volver sin guardar
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="btn-secondary"
            disabled={saving}
          >
            Guardar como borrador
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="btn-primary"
            disabled={saving}
            style={{ padding: '12px 28px' }}
          >
            {saving ? 'Guardando...' : 'Guardar entrada'}
          </button>
        </div>
      </div>
    </div>
  );
}
