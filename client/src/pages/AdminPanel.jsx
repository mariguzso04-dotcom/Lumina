import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { ShieldIcon, SparklesIcon, MusicIcon, LifeBuoyIcon } from '../components/Icons';
import Modal from '../components/Modal';

export default function AdminPanel() {
  const [metrics, setMetrics] = useState(null);
  const [privacyNotice, setPrivacyNotice] = useState('');
  const [loading, setLoading] = useState(true);

  // Formularios para crear contenidos
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [actTitle, setActTitle] = useState('');
  const [actCategory, setActCategory] = useState('respiracion');
  const [actDuration, setActDuration] = useState(5);
  const [actDescription, setActDescription] = useState('');
  const [actInstructions, setActInstructions] = useState('');
  const [savingAct, setSavingAct] = useState(false);

  const [showMusicModal, setShowMusicModal] = useState(false);
  const [trkTitle, setTrkTitle] = useState('');
  const [trkArtist, setTrkArtist] = useState('LÚMINA Sonidos');
  const [trkCategory, setTrkCategory] = useState('Lluvia');
  const [trkPreset, setTrkPreset] = useState('rain');
  const [trkLicense, setTrkLicense] = useState('Licencia libre de uso personal');
  const [savingTrk, setSavingTrk] = useState(false);

  const [msg, setMsg] = useState('');

  const loadMetrics = async () => {
    try {
      const res = await adminService.getMetrics();
      if (res.success) {
        setMetrics(res.data);
        setPrivacyNotice(res.privacy_notice);
      }
    } catch (e) {
      console.warn('Error al cargar métricas de administración:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    setSavingAct(true);
    try {
      const steps = actInstructions.split('\n').filter(s => s.trim().length > 0);
      await adminService.createActivity({
        title: actTitle,
        category: actCategory,
        duration_minutes: parseInt(actDuration, 10),
        description: actDescription,
        instructions: steps,
        recommended_for: ['Estrés', 'Ansiedad']
      });
      setShowActivityModal(false);
      setActTitle('');
      setActDescription('');
      setActInstructions('');
      setMsg('Nueva actividad de bienestar creada exitosamente.');
      loadMetrics();
    } catch (err) {
      alert(err.message || 'Error al crear actividad');
    } finally {
      setSavingAct(false);
    }
  };

  const handleCreateTrack = async (e) => {
    e.preventDefault();
    setSavingTrk(true);
    try {
      await adminService.createTrack({
        title: trkTitle,
        artist: trkArtist,
        category: trkCategory,
        audio_url: `soundscape:${trkPreset}`,
        is_soundscape: 1,
        soundscape_preset: trkPreset,
        license_info: trkLicense,
        duration_seconds: 600
      });
      setShowMusicModal(false);
      setTrkTitle('');
      setMsg('Nueva pista de paisaje sonoro publicada exitosamente.');
      loadMetrics();
    } catch (err) {
      alert(err.message || 'Error al crear pista');
    } finally {
      setSavingTrk(false);
    }
  };

  return (
    <div className="container page-container">
      <header style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#A4CBB3', marginBottom: '6px' }}>
          <ShieldIcon size={22} />
          <span style={{ fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Panel de control
          </span>
        </div>
        <h1 style={{ fontSize: '2.2rem', color: '#F1F1EB', marginBottom: '8px' }}>
          Administración de contenidos LÚMINA
        </h1>
        <p style={{ color: '#A9AFAC', fontSize: '1rem', maxWidth: '700px' }}>
          Gestión de actividades de bienestar, categorías musicales y recursos de apoyo comunitarios.
        </p>
      </header>

      {/* Aviso Estricto de Privacidad Ética */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: 'rgba(40, 102, 75, 0.2)',
        border: '1px solid rgba(164, 203, 179, 0.3)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '28px',
        color: '#F1F1EB',
        fontSize: '0.92rem',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <ShieldIcon size={24} className="" />
        <div>
          <strong>Barrera de privacidad activa:</strong> {privacyNotice || 'Los administradores no tienen acceso al texto de los diarios privados ni a las notas emocionales de los usuarios.'}
        </div>
      </div>

      {msg && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(40, 102, 75, 0.3)',
          border: '1px solid rgba(164, 203, 179, 0.5)',
          color: '#A4CBB3',
          marginBottom: '20px'
        }}>
          {msg}
        </div>
      )}

      {/* Métricas Agregadas */}
      <section style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '1.3rem', color: '#F1F1EB', marginBottom: '16px' }}>
          Métricas agregadas del sistema
        </h2>

        {loading ? (
          <div style={{ color: '#A9AFAC' }}>Cargando métricas...</div>
        ) : metrics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 700, color: '#A4CBB3' }}>
                {metrics.total_registered_users}
              </span>
              <p style={{ fontSize: '0.85rem', color: '#A9AFAC', margin: 0 }}>Usuarios registrados</p>
            </div>

            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 700, color: '#A4CBB3' }}>
                {metrics.total_mood_checkins}
              </span>
              <p style={{ fontSize: '0.85rem', color: '#A9AFAC', margin: 0 }}>Registros de ánimo</p>
            </div>

            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 700, color: '#A4CBB3' }}>
                {metrics.total_journal_entries_count_only}
              </span>
              <p style={{ fontSize: '0.85rem', color: '#A9AFAC', margin: 0 }}>Entradas de diario (anónimas)</p>
            </div>

            <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 700, color: '#A4CBB3' }}>
                {metrics.total_activities_completed}
              </span>
              <p style={{ fontSize: '0.85rem', color: '#A9AFAC', margin: 0 }}>Actividades completadas</p>
            </div>
          </div>
        )}
      </section>

      {/* Acciones de Administración */}
      <section>
        <h2 style={{ fontSize: '1.3rem', color: '#F1F1EB', marginBottom: '16px' }}>
          Gestión de contenidos
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ color: '#A4CBB3', marginBottom: '12px' }}><SparklesIcon size={24} /></div>
            <h3 style={{ fontSize: '1.15rem', color: '#F1F1EB', marginBottom: '8px' }}>
              Actividades de bienestar
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#A9AFAC', marginBottom: '20px' }}>
              Añadí nuevos ejercicios guiados, técnicas de relajación muscular o anclajes sensoriales.
            </p>
            <button onClick={() => setShowActivityModal(true)} className="btn-primary" style={{ width: '100%' }}>
              + Nueva actividad
            </button>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ color: '#A4CBB3', marginBottom: '12px' }}><MusicIcon size={24} /></div>
            <h3 style={{ fontSize: '1.15rem', color: '#F1F1EB', marginBottom: '8px' }}>
              Música y paisajes sonoros
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#A9AFAC', marginBottom: '20px' }}>
              Publicá nuevas pistas acústicas, sonidos de lluvia, río, bosque o melodías de piano.
            </p>
            <button onClick={() => setShowMusicModal(true)} className="btn-primary" style={{ width: '100%' }}>
              + Nueva pista sonora
            </button>
          </div>
        </div>
      </section>

      {/* Modal Crear Actividad */}
      <Modal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        title="Crear nueva actividad de bienestar"
      >
        <form onSubmit={handleCreateActivity}>
          <div className="form-group">
            <label className="form-label">Título de la actividad</label>
            <input
              type="text"
              value={actTitle}
              onChange={(e) => setActTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select
                value={actCategory}
                onChange={(e) => setActCategory(e.target.value)}
                className="form-select"
              >
                <option value="respiracion">Respiración</option>
                <option value="sensorial">Sensorial / Grounding</option>
                <option value="corporal">Relajación corporal</option>
                <option value="reflexion">Reflexión / Orden</option>
                <option value="creativa">Creativa</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Duración (minutos)</label>
              <input
                type="number"
                min="1"
                max="60"
                value={actDuration}
                onChange={(e) => setActDuration(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción breve</label>
            <textarea
              rows="2"
              value={actDescription}
              onChange={(e) => setActDescription(e.target.value)}
              className="form-textarea"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pasos guiados (un paso por línea)</label>
            <textarea
              rows="4"
              value={actInstructions}
              onChange={(e) => setActInstructions(e.target.value)}
              className="form-textarea"
              placeholder="Paso 1...&#10;Paso 2...&#10;Paso 3..."
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={() => setShowActivityModal(false)} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={savingAct}>
              {savingAct ? 'Publicando...' : 'Publicar actividad'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Crear Pista */}
      <Modal
        isOpen={showMusicModal}
        onClose={() => setShowMusicModal(false)}
        title="Publicar paisaje sonoro"
      >
        <form onSubmit={handleCreateTrack}>
          <div className="form-group">
            <label className="form-label">Título de la pista</label>
            <input
              type="text"
              value={trkTitle}
              onChange={(e) => setTrkTitle(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select
                value={trkCategory}
                onChange={(e) => setTrkCategory(e.target.value)}
                className="form-select"
              >
                <option value="Lluvia">Lluvia</option>
                <option value="Bosque y naturaleza">Bosque y naturaleza</option>
                <option value="Sonidos ambientales">Sonidos ambientales</option>
                <option value="Piano">Piano</option>
                <option value="Música tranquila">Música tranquila</option>
                <option value="Concentración">Concentración</option>
                <option value="Descanso">Descanso</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Preset acústico Web Audio</label>
              <select
                value={trkPreset}
                onChange={(e) => setTrkPreset(e.target.value)}
                className="form-select"
              >
                <option value="rain">Lluvia serena</option>
                <option value="forest">Viento de bosque</option>
                <option value="river">Corriente de río</option>
                <option value="ocean">Olas nocturnas</option>
                <option value="drone">Drone armónico</option>
                <option value="night">Grillos y noche</option>
                <option value="piano_ambience">Ambiente de piano</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Licencia</label>
            <input
              type="text"
              value={trkLicense}
              onChange={(e) => setTrkLicense(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={() => setShowMusicModal(false)} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={savingTrk}>
              {savingTrk ? 'Guardando...' : 'Publicar pista'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
