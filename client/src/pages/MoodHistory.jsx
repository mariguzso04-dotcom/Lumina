import React, { useState, useEffect } from 'react';
import { moodService, userService } from '../services/api';
import { ChartIcon, TrashIcon, DownloadIcon } from '../components/Icons';
import Modal from '../components/Modal';

export default function MoodHistory({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState('');
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'stats' | 'calendar'

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, entriesRes] = await Promise.all([
        moodService.getStatistics(),
        moodService.list({ emotion: selectedEmotionFilter || undefined, limit: 100 })
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (entriesRes.success) setEntries(entriesRes.data);
    } catch (e) {
      console.warn('Error al cargar historial emocional:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedEmotionFilter]);

  const handleDelete = async () => {
    if (!entryToDelete) return;
    setDeleting(true);
    try {
      await moodService.delete(entryToDelete.id);
      setEntries(entries.filter(e => e.id !== entryToDelete.id));
      setEntryToDelete(null);
      // Recargar estadísticas actualizadas
      const statsRes = await moodService.getStatistics();
      if (statsRes.success) setStats(statsRes.data);
    } catch (e) {
      alert('No se pudo eliminar el registro.');
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await userService.exportData();
      if (res.success && res.data) {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(res.data, null, 2))}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute('download', `lumina_mis_datos_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    } catch (e) {
      alert('Error al exportar los datos.');
    }
  };

  return (
    <div className="container page-container">
      {/* Encabezado y Descarga */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', color: '#F1F1EB', marginBottom: '6px' }}>
            Mi historial emocional
          </h1>
          <p style={{ color: '#A9AFAC', maxWidth: '650px', fontSize: '0.95rem' }}>
            Un panorama de tus registros personales a lo largo del tiempo para observar tus ritmos con gentileza y sin juicios.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="btn-secondary"
          style={{ fontSize: '0.88rem', padding: '10px 18px' }}
        >
          <DownloadIcon size={16} />
          <span>Exportar mis registros</span>
        </button>
      </div>

      {/* Nota de No-Diagnóstico */}
      <div style={{
        padding: '14px 20px',
        backgroundColor: 'rgba(40, 102, 75, 0.15)',
        border: '1px solid rgba(164, 203, 179, 0.25)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '28px',
        color: '#A4CBB3',
        fontSize: '0.88rem',
        lineHeight: '1.5'
      }}>
        <strong>Aclaración importante:</strong> Estas visualizaciones representan exclusivamente las notas y sensaciones que decidiste registrar. No constituyen diagnósticos clínicos, etiquetas ni predicciones médicas.
      </div>

      {/* Pestañas de Vista */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`btn-ghost ${activeTab === 'timeline' ? 'selected' : ''}`}
          style={{
            fontWeight: activeTab === 'timeline' ? 600 : 400,
            color: activeTab === 'timeline' ? '#F1F1EB' : '#A9AFAC',
            borderBottom: activeTab === 'timeline' ? '2px solid #A4CBB3' : '2px solid transparent',
            borderRadius: '0',
            padding: '8px 16px'
          }}
        >
          Línea de tiempo y notas
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`btn-ghost ${activeTab === 'stats' ? 'selected' : ''}`}
          style={{
            fontWeight: activeTab === 'stats' ? 600 : 400,
            color: activeTab === 'stats' ? '#F1F1EB' : '#A9AFAC',
            borderBottom: activeTab === 'stats' ? '2px solid #A4CBB3' : '2px solid transparent',
            borderRadius: '0',
            padding: '8px 16px'
          }}
        >
          Estadísticas y frecuencias
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`btn-ghost ${activeTab === 'calendar' ? 'selected' : ''}`}
          style={{
            fontWeight: activeTab === 'calendar' ? 600 : 400,
            color: activeTab === 'calendar' ? '#F1F1EB' : '#A9AFAC',
            borderBottom: activeTab === 'calendar' ? '2px solid #A4CBB3' : '2px solid transparent',
            borderRadius: '0',
            padding: '8px 16px'
          }}
        >
          Vista de calendario
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#A9AFAC' }}>
          Cargando tus registros con calma...
        </div>
      ) : (
        <>
          {/* TAB 1: Línea de tiempo */}
          {activeTab === 'timeline' && (
            <div>
              {/* Filtro por emoción */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.88rem', color: '#A9AFAC' }}>Filtrar por emoción:</span>
                <select
                  value={selectedEmotionFilter}
                  onChange={(e) => setSelectedEmotionFilter(e.target.value)}
                  className="form-select"
                  style={{ padding: '6px 14px', fontSize: '0.88rem' }}
                >
                  <option value="">Todas las emociones</option>
                  {stats && Object.keys(stats.emotion_counts).map(em => (
                    <option key={em} value={em}>{em} ({stats.emotion_counts[em]})</option>
                  ))}
                </select>
                {selectedEmotionFilter && (
                  <button onClick={() => setSelectedEmotionFilter('')} className="btn-ghost" style={{ fontSize: '0.8rem' }}>
                    Limpiar filtro
                  </button>
                )}
              </div>

              {entries.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <p style={{ color: '#A9AFAC', marginBottom: '16px' }}>
                    No se encontraron registros para este filtro.
                  </p>
                  <button onClick={() => onNavigate('mood')} className="btn-primary">
                    Crear un registro emocional
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {entries.map((entry) => {
                    const dateObj = new Date(entry.recorded_at);
                    const formattedDate = new Intl.DateTimeFormat('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(dateObj);

                    return (
                      <article
                        key={entry.id}
                        className="card"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          borderLeft: '4px solid #28664B'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{ fontSize: '0.85rem', color: '#A4CBB3' }}>
                            {formattedDate}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{
                              fontSize: '0.82rem',
                              backgroundColor: 'rgba(40, 102, 75, 0.4)',
                              color: '#F1F1EB',
                              padding: '2px 10px',
                              borderRadius: 'var(--radius-full)'
                            }}>
                              Intensidad: {entry.intensity}/5
                            </span>
                            <button
                              onClick={() => setEntryToDelete(entry)}
                              aria-label="Eliminar este registro"
                              style={{ background: 'transparent', color: '#79837e', padding: '4px', cursor: 'pointer' }}
                              onMouseEnter={(e) => e.currentTarget.style.color = '#c96257'}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#79837e'}
                            >
                              <TrashIcon size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Badges de emociones */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {entry.emotions.map((em) => (
                            <span
                              key={em}
                              style={{
                                fontSize: '0.85rem',
                                padding: '4px 12px',
                                borderRadius: 'var(--radius-full)',
                                backgroundColor: 'rgba(32, 37, 34, 0.8)',
                                border: '1px solid var(--color-border)',
                                color: '#F1F1EB'
                              }}
                            >
                              {em}
                            </span>
                          ))}
                        </div>

                        {/* Nota si existe */}
                        {entry.context_note && (
                          <p style={{
                            fontSize: '0.92rem',
                            color: '#F1F1EB',
                            backgroundColor: 'rgba(16, 19, 17, 0.5)',
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-md)',
                            fontStyle: 'italic',
                            margin: 0
                          }}>
                            "{entry.context_note}"
                          </p>
                        )}

                        {/* Factores asociados */}
                        {entry.factors && entry.factors.length > 0 && (
                          <div style={{ fontSize: '0.8rem', color: '#A9AFAC' }}>
                            <span style={{ color: '#79837e' }}>Factores: </span>
                            {entry.factors.join(', ')}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Estadísticas y Frecuencias */}
          {activeTab === 'stats' && stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              {/* Tarjeta de Resumen General */}
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', color: '#F1F1EB', marginBottom: '16px' }}>
                  Resumen de Registros
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ backgroundColor: 'rgba(23, 40, 32, 0.5)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: '#A4CBB3' }}>
                      {stats.total_entries}
                    </span>
                    <p style={{ fontSize: '0.82rem', color: '#A9AFAC', margin: 0 }}>Registros totales</p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(23, 40, 32, 0.5)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 700, color: '#A4CBB3' }}>
                      {stats.average_intensity} / 5
                    </span>
                    <p style={{ fontSize: '0.82rem', color: '#A9AFAC', margin: 0 }}>Intensidad promedio</p>
                  </div>
                </div>

                {/* Factores más frecuentes */}
                {stats.top_factors && stats.top_factors.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ fontSize: '0.95rem', color: '#F1F1EB', marginBottom: '10px' }}>
                      Factores más recurrentes
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {stats.top_factors.map((tf) => (
                        <div key={tf.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#A9AFAC' }}>
                          <span>{tf.name}</span>
                          <span style={{ color: '#A4CBB3', fontWeight: 600 }}>{tf.count} veces</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Frecuencia de Emociones (Barras proporcionales accesibles) */}
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', color: '#F1F1EB', marginBottom: '16px' }}>
                  Frecuencia de Emociones
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(stats.emotion_counts).map(([name, count]) => {
                    const maxVal = Math.max(...Object.values(stats.emotion_counts), 1);
                    const pct = (count / maxVal) * 100;
                    return (
                      <div key={name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                          <span style={{ color: count > 0 ? '#F1F1EB' : '#79837e' }}>{name}</span>
                          <span style={{ color: '#A4CBB3' }}>{count}</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor: count > 0 ? '#28664B' : 'transparent',
                            borderRadius: '4px'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Calendario de bienestar */}
          {activeTab === 'calendar' && (
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', color: '#F1F1EB', marginBottom: '8px' }}>
                Presencia de Registros por Fecha
              </h3>
              <p style={{ color: '#A9AFAC', fontSize: '0.88rem', marginBottom: '24px' }}>
                Cada día con un círculo verde indica que te tomaste al menos un momento para registrar cómo te sentías.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '12px'
              }}>
                {Array.from({ length: 14 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (13 - i));
                  const dateStr = d.toISOString().slice(0, 10);
                  const dayEntries = entries.filter(e => e.recorded_at.startsWith(dateStr));
                  const hasEntry = dayEntries.length > 0;

                  return (
                    <div
                      key={dateStr}
                      style={{
                        padding: '12px 10px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: hasEntry ? 'rgba(40, 102, 75, 0.35)' : 'rgba(26, 32, 28, 0.4)',
                        border: hasEntry ? '1px solid rgba(164, 203, 179, 0.4)' : '1px solid var(--color-border)',
                        textAlign: 'center'
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: '#A9AFAC', display: 'block', textTransform: 'capitalize' }}>
                        {d.toLocaleDateString('es-ES', { weekday: 'short' })}
                      </span>
                      <strong style={{ fontSize: '1.1rem', color: '#F1F1EB', display: 'block', margin: '4px 0' }}>
                        {d.getDate()}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: hasEntry ? '#A4CBB3' : '#79837e' }}>
                        {hasEntry ? `${dayEntries.length} reg.` : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={Boolean(entryToDelete)}
        onClose={() => setEntryToDelete(null)}
        title="¿Eliminar este registro?"
      >
        <div style={{ color: '#A9AFAC', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '16px' }}>
            Esta acción eliminará permanentemente la entrada emocional seleccionada. No podrá recuperarse.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button onClick={() => setEntryToDelete(null)} className="btn-ghost">
              Cancelar
            </button>
            <button onClick={handleDelete} className="btn-danger" disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
