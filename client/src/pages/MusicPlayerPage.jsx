import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext';
import { 
  PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon, 
  VolumeIcon, VolumeMuteIcon, StarIcon, MusicIcon 
} from '../components/Icons';

export default function MusicPlayerPage() {
  const { 
    tracks, currentTrack, isPlaying, volume, progress,
    currentTimeFormatted, durationFormatted, favorites,
    playTrack, togglePlay, setVolume, nextTrack, prevTrack, toggleFavorite 
  } = useAudio();

  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (tracks.length > 0) {
      const distinct = [...new Set(tracks.map(t => t.category))].sort();
      setCategories(distinct);
    }
  }, [tracks]);

  const filteredTracks = selectedCategory
    ? tracks.filter(t => t.category === selectedCategory)
    : tracks;

  return (
    <div className="container page-container">
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#F1F1EB', marginBottom: '8px' }}>
          Música y paisajes sonoros
        </h1>
        <p style={{ color: '#A9AFAC', maxWidth: '650px', fontSize: '1rem' }}>
          Sonidos de lluvia, naturaleza, piano y armonías generativas sintetizadas para acompañar tus pausas, lecturas y momentos de reposo.
        </p>
      </header>

      {/* Reproductor Central Grande */}
      <section 
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(23, 40, 32, 0.8) 0%, rgba(16, 22, 18, 0.95) 100%)',
          border: '1px solid rgba(164, 203, 179, 0.28)',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.4), var(--shadow-glow)',
          padding: '36px',
          marginBottom: '36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {/* Arte del disco sonoro con destello */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <div 
            style={{
              position: 'absolute',
              width: '160px',
              height: '160px',
              top: '-15px',
              left: '-15px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(164, 203, 179, 0.25) 0%, transparent 70%)',
              filter: 'blur(15px)',
              pointerEvents: 'none'
            }}
          />
          <div style={{
            width: '130px',
            height: '130px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #172820 0%, #28664B 100%)',
            border: '2px solid rgba(164, 203, 179, 0.4)',
            boxShadow: '0 0 25px rgba(40, 102, 75, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F1F1EB',
            position: 'relative',
            zIndex: 1
          }}>
            <MusicIcon size={52} />
          </div>
        </div>

        {/* Título de pista actual */}
        <h2 style={{ fontSize: '1.6rem', color: '#F1F1EB', marginBottom: '4px' }}>
          {currentTrack ? currentTrack.title : 'Elegí un paisaje sonoro para comenzar'}
        </h2>
        <p style={{ color: '#A4CBB3', fontSize: '0.95rem', marginBottom: '24px' }}>
          {currentTrack ? `${currentTrack.category} • ${currentTrack.artist}` : 'Sonidos acústicos y ambientales libres de derechos'}
        </p>

        {/* Barra de progreso interactiva */}
        <div style={{ width: '100%', maxWidth: '540px', marginBottom: '12px' }}>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#A4CBB3',
              borderRadius: '3px',
              transition: 'width 0.2s linear'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#79837e', marginTop: '6px' }}>
            <span>{currentTimeFormatted}</span>
            <span>{currentTrack?.is_soundscape ? 'En bucle sereno' : durationFormatted}</span>
          </div>
        </div>

        {/* Controles de Reproducción y Volumen */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap',
          marginTop: '12px'
        }}>
          <button
            onClick={prevTrack}
            className="btn-ghost"
            style={{ padding: '10px', color: '#A9AFAC' }}
            aria-label="Pista anterior"
          >
            <SkipBackIcon size={22} />
          </button>

          <button
            onClick={() => {
              if (currentTrack) {
                togglePlay();
              } else if (tracks.length > 0) {
                playTrack(tracks[0]);
              }
            }}
            aria-label={isPlaying ? "Pausar" : "Reproducir"}
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              backgroundColor: '#28664B',
              color: '#F1F1EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(40, 102, 75, 0.5)',
              border: '1px solid rgba(164, 203, 179, 0.3)'
            }}
          >
            {isPlaying ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
          </button>

          <button
            onClick={nextTrack}
            className="btn-ghost"
            style={{ padding: '10px', color: '#A9AFAC' }}
            aria-label="Pista siguiente"
          >
            <SkipForwardIcon size={22} />
          </button>

          {/* Control de volumen integrado */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
            <VolumeIcon size={18} className="" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              aria-label="Nivel de volumen"
              style={{
                width: '100px',
                accentColor: '#A4CBB3',
                cursor: 'pointer'
              }}
            />
          </div>

          {currentTrack && (
            <button
              onClick={() => toggleFavorite(currentTrack.id)}
              className="btn-ghost"
              style={{ padding: '8px', color: favorites.has(currentTrack.id) ? '#e4b363' : '#79837e' }}
              title="Guardar en favoritos"
            >
              <StarIcon size={22} filled={favorites.has(currentTrack.id)} />
            </button>
          )}
        </div>

        {currentTrack && (
          <p style={{ fontSize: '0.78rem', color: '#79837e', marginTop: '20px', margin: 0 }}>
            Licencia: {currentTrack.license_info}
          </p>
        )}
      </section>

      {/* Filtro por Categorías */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <button
          onClick={() => setSelectedCategory('')}
          className={`btn-ghost ${selectedCategory === '' ? 'selected' : ''}`}
          style={{
            borderRadius: 'var(--radius-full)',
            backgroundColor: selectedCategory === '' ? 'rgba(40, 102, 75, 0.4)' : 'rgba(32, 37, 34, 0.6)',
            color: selectedCategory === '' ? '#F1F1EB' : '#A9AFAC',
            fontSize: '0.85rem'
          }}
        >
          Todas las categorías
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`btn-ghost ${selectedCategory === cat ? 'selected' : ''}`}
            style={{
              borderRadius: 'var(--radius-full)',
              backgroundColor: selectedCategory === cat ? 'rgba(40, 102, 75, 0.4)' : 'rgba(32, 37, 34, 0.6)',
              color: selectedCategory === cat ? '#F1F1EB' : '#A9AFAC',
              fontSize: '0.85rem'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lista de pistas disponibles */}
      <section aria-label="Lista de canciones y ambientes">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
          {filteredTracks.map((track) => {
            const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;
            const isFav = favorites.has(track.id);

            return (
              <div
                key={track.id}
                onClick={() => {
                  if (currentTrack?.id === track.id) {
                    togglePlay();
                  } else {
                    playTrack(track);
                  }
                }}
                className="card card-interactive"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: currentTrack?.id === track.id ? '4px solid #A4CBB3' : '1px solid var(--color-border)',
                  backgroundColor: currentTrack?.id === track.id ? 'rgba(40, 102, 75, 0.25)' : undefined
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: isThisTrackPlaying ? '#28664B' : 'rgba(40, 102, 75, 0.2)',
                      color: isThisTrackPlaying ? '#fff' : '#A4CBB3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: '1px solid rgba(164, 203, 179, 0.2)'
                    }}
                    aria-label={isThisTrackPlaying ? `Pausar ${track.title}` : `Reproducir ${track.title}`}
                  >
                    {isThisTrackPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
                  </button>

                  <div style={{ overflow: 'hidden' }}>
                    <h3 style={{ fontSize: '1rem', color: '#F1F1EB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>
                      {track.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#A9AFAC', margin: 0 }}>
                      {track.category} • {track.artist}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(track.id);
                  }}
                  className="btn-ghost"
                  style={{ padding: '8px', color: isFav ? '#e4b363' : '#79837e' }}
                  aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                >
                  <StarIcon size={18} filled={isFav} />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
