import React, { useState, useEffect } from 'react';
import { journalService } from '../services/api';
import { BookIcon, StarIcon, EditIcon, TrashIcon, SearchIcon } from '../components/Icons';
import Modal from '../components/Modal';

export default function Journal({ onNavigate, onEditEntry }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedEntryView, setSelectedEntryView] = useState(null);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await journalService.list({
        search: searchQuery || undefined,
        favorite: filterFavorite ? 'true' : undefined
      });
      if (res.success && res.data) {
        setEntries(res.data);
      }
    } catch (e) {
      console.warn('Error al cargar diario:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [searchQuery, filterFavorite]);

  const handleToggleFavorite = async (e, id) => {
    e.stopPropagation();
    try {
      const res = await journalService.toggleFavorite(id);
      if (res.success) {
        setEntries(entries.map(ent => 
          ent.id === id ? { ...ent, is_favorite: res.data.is_favorite } : ent
        ));
      }
    } catch (err) {
      console.warn('Error al marcar favorito:', err);
    }
  };

  const handleDelete = async () => {
    if (!entryToDelete) return;
    setDeleting(true);
    try {
      await journalService.delete(entryToDelete.id);
      setEntries(entries.filter(e => e.id !== entryToDelete.id));
      setEntryToDelete(null);
      if (selectedEntryView?.id === entryToDelete.id) {
        setSelectedEntryView(null);
      }
    } catch (err) {
      alert('Error al eliminar la entrada.');
    } finally {
      setDeleting(false);
    }
  };

  const openEntryDetail = async (id) => {
    try {
      const res = await journalService.getById(id);
      if (res.success && res.data) {
        setSelectedEntryView(res.data);
      }
    } catch (e) {
      alert('No se pudo abrir el detalle de la entrada.');
    }
  };

  return (
    <div className="container page-container">
      {/* Encabezado y Acción Nueva Entrada */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', color: '#F1F1EB', marginBottom: '6px' }}>
            Mi diario privado
          </h1>
          <p style={{ color: '#A9AFAC', fontSize: '0.95rem' }}>
            Un refugio confidencial para plasmar lo que sentís sin censura ni juicios.
          </p>
        </div>

        <button
          onClick={() => onNavigate('journal-new')}
          className="btn-primary"
          style={{ padding: '12px 24px', fontSize: '0.95rem' }}
        >
          <BookIcon size={18} />
          <span>Escribir nueva entrada</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '28px'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#79837e' }}>
            <SearchIcon size={18} />
          </span>
          <input
            type="text"
            placeholder="Buscar por palabras en tus escritos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '42px' }}
          />
        </div>

        <button
          onClick={() => setFilterFavorite(!filterFavorite)}
          className={`btn-secondary ${filterFavorite ? 'selected' : ''}`}
          style={{
            borderColor: filterFavorite ? '#e4b363' : undefined,
            color: filterFavorite ? '#e4b363' : '#A9AFAC',
            fontSize: '0.9rem'
          }}
        >
          <StarIcon size={16} filled={filterFavorite} />
          <span>Favoritas</span>
        </button>
      </div>

      {/* Lista de Entradas */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#A9AFAC' }}>
          Abriendo tu cuaderno con cuidado...
        </div>
      ) : entries.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(40, 102, 75, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#A4CBB3',
            marginBottom: '16px'
          }}>
            <BookIcon size={32} />
          </div>
          <h2 style={{ fontSize: '1.35rem', color: '#F1F1EB', marginBottom: '8px' }}>
            Tu diario está listo para recibirte
          </h2>
          <p style={{ color: '#A9AFAC', maxWidth: '480px', margin: '0 auto 24px auto', fontSize: '0.95rem' }}>
            No tenés que escribir una novela ni estructurar tus ideas. Una sola frase sobre lo que hoy pesa o alegra tu corazón es suficiente.
          </p>
          <button onClick={() => onNavigate('journal-new')} className="btn-primary">
            Comenzar a escribir
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {entries.map((entry) => {
            const dateObj = new Date(entry.created_at);
            const formattedDate = new Intl.DateTimeFormat('es-ES', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }).format(dateObj);

            return (
              <article
                key={entry.id}
                onClick={() => openEntryDetail(entry.id)}
                className="card card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '210px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: '#A4CBB3' }}>
                      {formattedDate} {entry.is_draft ? '• Borrador' : ''}
                    </span>
                    <button
                      onClick={(e) => handleToggleFavorite(e, entry.id)}
                      aria-label={entry.is_favorite ? "Quitar de favoritos" : "Marcar como favorita"}
                      style={{ background: 'transparent', padding: '4px', color: entry.is_favorite ? '#e4b363' : '#79837e' }}
                    >
                      <StarIcon size={18} filled={entry.is_favorite} />
                    </button>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: '#F1F1EB', marginBottom: '8px' }}>
                    {entry.title}
                  </h3>

                  {entry.mood_tag && (
                    <span style={{
                      fontSize: '0.78rem',
                      padding: '2px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(40, 102, 75, 0.3)',
                      color: '#A4CBB3',
                      display: 'inline-block',
                      marginBottom: '12px'
                    }}>
                      Emoción: {entry.mood_tag}
                    </span>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(164, 203, 179, 0.1)',
                  paddingTop: '12px',
                  marginTop: '12px'
                }}>
                  <span style={{ fontSize: '0.82rem', color: '#A9AFAC' }}>
                    Tocar para leer completo
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEntry(entry.id);
                      }}
                      className="btn-ghost"
                      style={{ padding: '6px', color: '#A4CBB3' }}
                      title="Editar entrada"
                    >
                      <EditIcon size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEntryToDelete(entry);
                      }}
                      className="btn-ghost"
                      style={{ padding: '6px', color: '#c96257' }}
                      title="Eliminar entrada"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal para ver entrada completa */}
      <Modal
        isOpen={Boolean(selectedEntryView)}
        onClose={() => setSelectedEntryView(null)}
        title={selectedEntryView?.title || 'Entrada de diario'}
        maxWidth="680px"
      >
        {selectedEntryView && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: '#A4CBB3' }}>
                {new Intl.DateTimeFormat('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }).format(new Date(selectedEntryView.created_at))}
              </span>
              {selectedEntryView.mood_tag && (
                <span style={{
                  fontSize: '0.82rem',
                  padding: '3px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(40, 102, 75, 0.4)',
                  color: '#F1F1EB'
                }}>
                  {selectedEntryView.mood_tag}
                </span>
              )}
            </div>

            <div style={{
              whiteSpace: 'pre-wrap',
              fontSize: '1.05rem',
              lineHeight: '1.8',
              color: '#F1F1EB',
              fontFamily: 'var(--font-sans)',
              marginBottom: '28px'
            }}>
              {selectedEntryView.content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => {
                  const id = selectedEntryView.id;
                  setSelectedEntryView(null);
                  onEditEntry(id);
                }}
                className="btn-secondary"
              >
                <EditIcon size={16} />
                <span>Editar</span>
              </button>
              <button
                onClick={() => setSelectedEntryView(null)}
                className="btn-primary"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <Modal
        isOpen={Boolean(entryToDelete)}
        onClose={() => setEntryToDelete(null)}
        title="¿Deseas eliminar esta entrada?"
      >
        <div style={{ color: '#A9AFAC', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '16px' }}>
            Se eliminará permanentemente la entrada <strong style={{ color: '#F1F1EB' }}>"{entryToDelete?.title}"</strong> de tu diario confidencial.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button onClick={() => setEntryToDelete(null)} className="btn-ghost">
              Cancelar
            </button>
            <button onClick={handleDelete} className="btn-danger" disabled={deleting}>
              {deleting ? 'Eliminando...' : 'Sí, eliminar entrada'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
