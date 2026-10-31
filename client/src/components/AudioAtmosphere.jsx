import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { 
  PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon, 
  VolumeIcon, VolumeMuteIcon, StarIcon, MusicIcon 
} from './Icons';

export default function AudioAtmosphere({ onNavigate }) {
  const { 
    currentTrack, isPlaying, volume, progress, 
    togglePlay, setVolume, nextTrack, prevTrack, 
    favorites, toggleFavorite 
  } = useAudio();

  const [isMuted, setIsMuted] = useState(false);
  const [prevVol, setPrevVol] = useState(volume);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!currentTrack) return null;

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(prevVol || 0.5);
      setIsMuted(false);
    } else {
      setPrevVol(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const isFav = favorites.has(currentTrack.id);

  return (
    <aside 
      aria-label="Reproductor de audio ambiental"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 900,
        maxWidth: isCollapsed ? '70px' : '420px',
        width: '100%',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div 
        className="card"
        style={{
          padding: isCollapsed ? '12px' : '16px 20px',
          backgroundColor: 'rgba(23, 32, 27, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(164, 203, 179, 0.25)',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5), 0 0 25px rgba(40, 102, 75, 0.25)',
          borderRadius: isCollapsed ? '50px' : '20px'
        }}
      >
        {isCollapsed ? (
          <button 
            onClick={() => setIsCollapsed(false)}
            aria-label="Expandir reproductor musical"
            style={{
              background: 'transparent',
              color: '#A4CBB3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '46px'
            }}
          >
            <MusicIcon size={24} />
          </button>
        ) : (
          <div>
            {/* Cabecera y controles de colapso */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', overflow: 'hidden' }}
                onClick={() => onNavigate && onNavigate('music')}
                title="Hacé clic para ver la biblioteca completa"
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(40, 102, 75, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#A4CBB3',
                  flexShrink: 0
                }}>
                  <MusicIcon size={16} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ 
                    fontSize: '0.88rem', 
                    fontWeight: 600, 
                    color: '#F1F1EB', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    margin: 0
                  }}>
                    {currentTrack.title}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#A9AFAC', margin: 0 }}>
                    {currentTrack.category} • {currentTrack.artist}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={() => toggleFavorite(currentTrack.id)}
                  aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                  style={{ background: 'transparent', padding: '6px', color: isFav ? '#e4b363' : '#A9AFAC' }}
                >
                  <StarIcon size={18} filled={isFav} />
                </button>
                <button
                  onClick={() => setIsCollapsed(true)}
                  aria-label="Minimizar reproductor"
                  style={{ background: 'transparent', padding: '6px', color: '#A9AFAC' }}
                >
                  —
                </button>
              </div>
            </div>

            {/* Barra de progreso sutil */}
            <div 
              style={{
                width: '100%',
                height: '3px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '2px',
                marginBottom: '12px',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: '#A4CBB3',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>

            {/* Fila de controles de reproducción y volumen */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={prevTrack} 
                  aria-label="Pista anterior"
                  style={{ background: 'transparent', color: '#A9AFAC', padding: '6px' }}
                >
                  <SkipBackIcon size={16} />
                </button>

                <button 
                  onClick={togglePlay} 
                  aria-label={isPlaying ? "Pausar sonido" : "Reproducir sonido"}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#28664B',
                    color: '#F1F1EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 10px rgba(40, 102, 75, 0.4)'
                  }}
                >
                  {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
                </button>

                <button 
                  onClick={nextTrack} 
                  aria-label="Siguiente pista"
                  style={{ background: 'transparent', color: '#A9AFAC', padding: '6px' }}
                >
                  <SkipForwardIcon size={16} />
                </button>
              </div>

              {/* Control de volumen */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button 
                  onClick={handleMuteToggle}
                  aria-label={isMuted ? "Activar sonido" : "Silenciar"}
                  style={{ background: 'transparent', color: '#A9AFAC', padding: '4px' }}
                >
                  {isMuted || volume === 0 ? <VolumeMuteIcon size={16} /> : <VolumeIcon size={16} />}
                </button>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setIsMuted(false);
                    setVolume(parseFloat(e.target.value));
                  }}
                  aria-label="Volumen del sonido"
                  style={{
                    width: '65px',
                    accentColor: '#A4CBB3',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
