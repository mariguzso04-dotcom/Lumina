import React, { useState, useEffect, useRef } from 'react';
import { 
  musicService 
} from '../services/api';
import { 
  SearchIcon, MusicIcon, HeartIcon, PlusIcon, TrashIcon, 
  PlayIcon, ExternalLinkIcon, ListMusicIcon, CloseIcon, SparklesIcon,
  CheckIcon
} from '../components/Icons';

export default function MyMusicPage({ onNavigate }) {
  // Tabs: 'search', 'favorites', 'artists', 'playlists'
  const [activeTab, setActiveTab] = useState('search');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  
  // Collections state
  const [myFavorites, setMyFavorites] = useState([]);
  const [myArtists, setMyArtists] = useState([]);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [activePlaylistDetail, setActivePlaylistDetail] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [notification, setNotification] = useState(null);

  // Modal create playlist state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  // Modal add track to playlist state
  const [selectedTrackForPlaylist, setSelectedTrackForPlaylist] = useState(null);

  // Active Embedded Player state
  const [currentPlayback, setCurrentPlayback] = useState(null); // { title, artist, platform, external_id, preview_url, cover_url }
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);

  // Notification helper
  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 3800);
  };

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoadingData(true);
    try {
      const [favTracksRes, favArtistsRes, playlistsRes] = await Promise.allSettled([
        musicService.listMyTracks(),
        musicService.listMyArtists(),
        musicService.listPlaylists()
      ]);

      if (favTracksRes.status === 'fulfilled' && favTracksRes.value.success) {
        setMyFavorites(favTracksRes.value.data || []);
      }
      if (favArtistsRes.status === 'fulfilled' && favArtistsRes.value.success) {
        setMyArtists(favArtistsRes.value.data || []);
      }
      if (playlistsRes.status === 'fulfilled' && playlistsRes.value.success) {
        setMyPlaylists(playlistsRes.value.data || []);
      }
    } catch (err) {
      console.error('Error al cargar datos musicales:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Si la búsqueda está vacía, hacer una búsqueda inicial con curaduría relajante
      handlePerformSearch('');
      return;
    }

    const timer = setTimeout(() => {
      handlePerformSearch(searchQuery);
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery, platformFilter]);

  const handlePerformSearch = async (query) => {
    setIsSearching(true);
    setSearchError('');
    try {
      const res = await musicService.search(query, platformFilter);
      if (res.success) {
        setSearchResults(res.data.tracks || []);
      } else {
        setSearchError('No se pudieron obtener resultados en este momento.');
      }
    } catch (err) {
      setSearchError('Error de conexión al buscar música.');
    } finally {
      setIsSearching(false);
    }
  };

  // Quick suggestion clicks
  const handleQuickTagClick = (tag) => {
    setSearchQuery(tag);
  };

  // Check if track is already in favorites
  const isTrackFavorite = (externalId) => {
    return myFavorites.some(t => t.external_id === externalId);
  };

  // Toggle Track Favorite
  const handleToggleFavoriteTrack = async (track) => {
    const existing = myFavorites.find(t => t.external_id === track.external_id);
    if (existing) {
      try {
        await musicService.removeMyTrack(existing.id);
        setMyFavorites(prev => prev.filter(t => t.id !== existing.id));
        showNotification(`"${track.title}" eliminada de tus favoritas.`);
      } catch (err) {
        showNotification('Error al eliminar de favoritas.', 'error');
      }
    } else {
      try {
        const payload = {
          title: track.title,
          artist: track.artist,
          album: track.album || null,
          platform: track.platform || 'spotify',
          external_id: track.external_id,
          cover_url: track.cover_url || null,
          duration_seconds: track.duration_seconds || 0,
          preview_url: track.preview_url || null,
          external_url: track.external_url || null
        };
        const res = await musicService.addMyTrack(payload);
        if (res.success && res.data) {
          setMyFavorites(prev => [res.data, ...prev]);
          showNotification(`¡"${track.title}" agregada a tus favoritas!`);
        }
      } catch (err) {
        showNotification('Error al guardar en favoritas.', 'error');
      }
    }
  };

  // Toggle Artist Favorite
  const handleToggleArtist = async (artistName, platform = 'spotify', externalId = null, imageUrl = null) => {
    const existing = myArtists.find(a => a.artist_name.toLowerCase() === artistName.toLowerCase());
    if (existing) {
      try {
        await musicService.removeMyArtist(existing.id);
        setMyArtists(prev => prev.filter(a => a.id !== existing.id));
        showNotification(`${artistName} removido de tus artistas.`);
      } catch (err) {
        showNotification('Error al remover artista.', 'error');
      }
    } else {
      try {
        const res = await musicService.addMyArtist({
          artist_name: artistName,
          platform,
          external_id: externalId,
          image_url: imageUrl,
          genres: ['Relajación', 'LÚMINA']
        });
        if (res.success && res.data) {
          setMyArtists(prev => [res.data, ...prev]);
          showNotification(`¡${artistName} añadido a tus artistas favoritos!`);
        }
      } catch (err) {
        showNotification('Error al agregar artista.', 'error');
      }
    }
  };

  // Check if artist is favorite
  const isArtistFavorite = (artistName) => {
    return myArtists.some(a => a.artist_name.toLowerCase() === (artistName || '').toLowerCase());
  };

  // Create new Playlist
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      const res = await musicService.createPlaylist({
        name: newPlaylistName.trim(),
        description: newPlaylistDesc.trim()
      });
      if (res.success && res.data) {
        setMyPlaylists(prev => [res.data, ...prev]);
        showNotification(`Lista "${newPlaylistName}" creada exitosamente.`);
        setNewPlaylistName('');
        setNewPlaylistDesc('');
        setIsCreateModalOpen(false);
      }
    } catch (err) {
      showNotification('Error al crear la lista.', 'error');
    }
  };

  // Delete Playlist
  const handleDeletePlaylist = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la lista "${name}"?`)) return;
    try {
      await musicService.deletePlaylist(id);
      setMyPlaylists(prev => prev.filter(p => p.id !== id));
      if (activePlaylistDetail && activePlaylistDetail.id === id) {
        setActivePlaylistDetail(null);
      }
      showNotification(`Lista "${name}" eliminada.`);
    } catch (err) {
      showNotification('Error al eliminar la lista.', 'error');
    }
  };

  // View Playlist details
  const handleOpenPlaylist = async (playlistId) => {
    try {
      const res = await musicService.getPlaylist(playlistId);
      if (res.success) {
        setActivePlaylistDetail(res.data);
      }
    } catch (err) {
      showNotification('Error al abrir la lista.', 'error');
    }
  };

  // Add track to playlist
  const handleAddTrackToPlaylist = async (playlistId) => {
    if (!selectedTrackForPlaylist) return;
    try {
      const track = selectedTrackForPlaylist;
      await musicService.addTrackToPlaylist(playlistId, {
        title: track.title,
        artist: track.artist,
        album: track.album || null,
        platform: track.platform || 'spotify',
        external_id: track.external_id,
        cover_url: track.cover_url || null,
        duration_seconds: track.duration_seconds || 0,
        preview_url: track.preview_url || null,
        external_url: track.external_url || null
      });

      showNotification(`Canción añadida a tu lista.`);
      setSelectedTrackForPlaylist(null);
      // Actualizar conteo en playlists
      setMyPlaylists(prev => prev.map(p => {
        if (p.id === playlistId) {
          return { ...p, track_count: (p.track_count || 0) + 1 };
        }
        return p;
      }));
      // Si esa playlist está abierta, recargarla
      if (activePlaylistDetail && activePlaylistDetail.id === playlistId) {
        handleOpenPlaylist(playlistId);
      }
    } catch (err) {
      showNotification('Error al añadir canción a la lista.', 'error');
    }
  };

  // Remove track from playlist
  const handleRemoveTrackFromPlaylist = async (playlistId, trackDbId) => {
    try {
      await musicService.removeTrackFromPlaylist(playlistId, trackDbId);
      if (activePlaylistDetail) {
        setActivePlaylistDetail(prev => ({
          ...prev,
          tracks: prev.tracks.filter(t => t.id !== trackDbId)
        }));
      }
      setMyPlaylists(prev => prev.map(p => {
        if (p.id === playlistId) {
          return { ...p, track_count: Math.max(0, (p.track_count || 1) - 1) };
        }
        return p;
      }));
      showNotification('Canción quitada de la lista.');
    } catch (err) {
      showNotification('Error al quitar canción.', 'error');
    }
  };

  // Start playback
  const handlePlayTrack = (track) => {
    setCurrentPlayback(track);
    setIsPlayerMinimized(false);
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '1280px', margin: '0 auto', color: '#F1F1EB' }}>
      
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: notification.type === 'error' ? 'rgba(201, 98, 87, 0.95)' : 'rgba(40, 102, 75, 0.95)',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 500,
          animation: 'fadeIn 0.3s ease'
        }}>
          {notification.type === 'error' ? '⚠️' : '✨'}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{
        marginBottom: '28px',
        background: 'linear-gradient(135deg, rgba(23, 40, 32, 0.8) 0%, rgba(16, 19, 17, 0.9) 100%)',
        border: '1px solid rgba(164, 203, 179, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(164, 203, 179, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: 'rgba(40, 102, 75, 0.4)',
            color: '#A4CBB3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(164, 203, 179, 0.3)'
          }}>
            <MusicIcon size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', margin: 0, color: '#F1F1EB' }}>
              Mi Música
            </h1>
            <p style={{ margin: 0, color: '#A4CBB3', fontSize: '0.92rem' }}>
              Búsqueda en Spotify y YouTube, artistas que te inspiran y listas para sanar.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '24px',
          borderBottom: '1px solid rgba(164, 203, 179, 0.15)',
          paddingBottom: '4px',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'search', label: 'Búsqueda & Descubrir', icon: SearchIcon },
            { id: 'favorites', label: `Canciones Favoritas (${myFavorites.length})`, icon: HeartIcon },
            { id: 'artists', label: `Artistas Favoritos (${myArtists.length})`, icon: SparklesIcon },
            { id: 'playlists', label: `Mis Listas (${myPlaylists.length})`, icon: ListMusicIcon }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setActivePlaylistDetail(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  backgroundColor: isActive ? 'rgba(40, 102, 75, 0.45)' : 'transparent',
                  color: isActive ? '#A4CBB3' : '#A9AFAC',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #A4CBB3' : '2px solid transparent',
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* PESTAÑA A: BÚSQUEDA Y DESCUBRIMIENTO                          */}
      {/* ============================================================== */}
      {activeTab === 'search' && (
        <section>
          {/* Barra de búsqueda y filtros */}
          <div style={{
            backgroundColor: '#17221b',
            border: '1px solid rgba(164, 203, 179, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#79837e' }}>
                  <SearchIcon size={20} />
                </span>
                <input
                  type="text"
                  placeholder="Buscar artistas, canciones, álbumes o melodías..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    backgroundColor: '#101712',
                    border: '1px solid rgba(164, 203, 179, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: '#F1F1EB',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#79837e',
                      cursor: 'pointer'
                    }}
                  >
                    <CloseIcon size={18} />
                  </button>
                )}
              </div>

              {/* Selector de plataforma */}
              <div style={{ display: 'flex', gap: '6px', backgroundColor: '#101712', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(164, 203, 179, 0.2)' }}>
                {[
                  { id: 'all', label: 'Todo' },
                  { id: 'spotify', label: 'Spotify', color: '#1DB954' },
                  { id: 'youtube', label: 'YouTube', color: '#FF4444' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPlatformFilter(p.id)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: platformFilter === p.id ? 'rgba(40, 102, 75, 0.6)' : 'transparent',
                      color: platformFilter === p.id ? (p.color || '#F1F1EB') : '#79837e',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sugerencias Rápidas */}
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: '#79837e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <SparklesIcon size={14} /> Inspiración:
              </span>
              {[
                'Ludovico Einaudi',
                'Lofi Hip Hop Chill',
                'Piano para el alma',
                'Sonidos de Lluvia y Truenos',
                'Meditación 432Hz',
                'Yiruma',
                'Max Richter',
                'Naturaleza Profunda'
              ].map(tag => (
                <button
                  key={tag}
                  onClick={() => handleQuickTagClick(tag)}
                  style={{
                    backgroundColor: 'rgba(164, 203, 179, 0.08)',
                    border: '1px solid rgba(164, 203, 179, 0.2)',
                    color: '#A4CBB3',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(164, 203, 179, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(164, 203, 179, 0.08)'}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Estado de carga */}
          {isSearching && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#A4CBB3' }}>
              <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid rgba(164, 203, 179, 0.3)', borderTopColor: '#A4CBB3', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '12px', fontSize: '0.95rem' }}>Buscando melodías en Spotify y YouTube...</p>
            </div>
          )}

          {/* Error */}
          {searchError && (
            <div style={{ padding: '16px', backgroundColor: 'rgba(201, 98, 87, 0.15)', border: '1px solid rgba(201, 98, 87, 0.4)', borderRadius: 'var(--radius-md)', color: '#ff9d94', marginBottom: '20px' }}>
              {searchError}
            </div>
          )}

          {/* Resultados de búsqueda */}
          {!isSearching && searchResults.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#F1F1EB', margin: 0 }}>
                  Resultados encontrados ({searchResults.length})
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#79837e' }}>
                  Plataformas: Spotify y YouTube integrados
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px'
              }}>
                {searchResults.map((track) => {
                  const isFav = isTrackFavorite(track.external_id);
                  const isArtFav = isArtistFavorite(track.artist);
                  const isCurrentPlaying = currentPlayback && currentPlayback.external_id === track.external_id;

                  return (
                    <div
                      key={track.id || track.external_id}
                      style={{
                        backgroundColor: '#17221b',
                        border: isCurrentPlaying ? '1px solid #A4CBB3' : '1px solid rgba(164, 203, 179, 0.15)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transition: 'transform 0.2s ease, border-color 0.2s ease',
                        boxShadow: isCurrentPlaying ? '0 0 15px rgba(164, 203, 179, 0.2)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                        {/* Portada */}
                        <div style={{
                          width: '70px',
                          height: '70px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          backgroundColor: '#101712',
                          position: 'relative'
                        }}>
                          {track.cover_url ? (
                            <img
                              src={track.cover_url}
                              alt={track.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#79837e' }}>
                              <MusicIcon size={28} />
                            </div>
                          )}

                          {/* Botón flotante Play */}
                          <button
                            onClick={() => handlePlayTrack(track)}
                            title="Reproducir pista"
                            style={{
                              position: 'absolute',
                              inset: 0,
                              backgroundColor: 'rgba(0,0,0,0.45)',
                              border: 'none',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              opacity: isCurrentPlaying ? 1 : 0.85,
                              transition: 'opacity 0.2s ease'
                            }}
                          >
                            <PlayIcon size={24} />
                          </button>
                        </div>

                        {/* Metadatos */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 
                            title={track.title}
                            style={{
                              margin: '0 0 4px 0',
                              fontSize: '0.98rem',
                              fontWeight: 600,
                              color: isCurrentPlaying ? '#A4CBB3' : '#F1F1EB',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {track.title}
                          </h4>

                          <p
                            title={track.artist}
                            style={{
                              margin: '0 0 6px 0',
                              fontSize: '0.84rem',
                              color: '#A9AFAC',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {track.artist}
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {/* Platform badge */}
                            <span style={{
                              fontSize: '0.7rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 600,
                              backgroundColor: track.platform === 'spotify' ? 'rgba(29, 185, 84, 0.2)' : 'rgba(255, 68, 68, 0.2)',
                              color: track.platform === 'spotify' ? '#1DB954' : '#FF6666'
                            }}>
                              {track.platform === 'spotify' ? 'Spotify' : 'YouTube'}
                            </span>

                            {track.duration_seconds > 0 && (
                              <span style={{ fontSize: '0.72rem', color: '#79837e' }}>
                                {Math.floor(track.duration_seconds / 60)}:{(track.duration_seconds % 60).toString().padStart(2, '0')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '14px',
                        paddingTop: '10px',
                        borderTop: '1px solid rgba(164, 203, 179, 0.1)'
                      }}>
                        {/* Play Action */}
                        <button
                          onClick={() => handlePlayTrack(track)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'transparent',
                            border: 'none',
                            color: isCurrentPlaying ? '#A4CBB3' : '#F1F1EB',
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}
                        >
                          <PlayIcon size={14} />
                          <span>{isCurrentPlaying ? 'Sonando' : 'Escuchar'}</span>
                        </button>

                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {/* Agregar / Quitar de Canciones Favoritas */}
                          <button
                            onClick={() => handleToggleFavoriteTrack(track)}
                            title={isFav ? "Quitar de mis canciones favoritas" : "Guardar en mis canciones favoritas"}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: isFav ? '#e4b363' : '#79837e',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '4px',
                              transition: 'transform 0.15s ease'
                            }}
                          >
                            <HeartIcon size={18} />
                          </button>

                          {/* Seguir / Guardar Artista */}
                          <button
                            onClick={() => handleToggleArtist(track.artist, track.platform, null, track.cover_url)}
                            title={isArtFav ? "Artista en tus favoritos" : "Guardar artista en favoritos"}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: isArtFav ? '#A4CBB3' : '#79837e',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '4px'
                            }}
                          >
                            <SparklesIcon size={18} />
                          </button>

                          {/* Agregar a Playlist */}
                          <button
                            onClick={() => setSelectedTrackForPlaylist(track)}
                            title="Añadir a una lista personal"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#79837e',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '4px'
                            }}
                          >
                            <PlusIcon size={18} />
                          </button>

                          {/* Enlace original */}
                          {track.external_url && (
                            <a
                              href={track.external_url}
                              target="_blank"
                              rel="noreferrer"
                              title="Abrir en plataforma oficial"
                              style={{
                                color: '#79837e',
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              <ExternalLinkIcon size={16} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isSearching && searchResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#79837e' }}>
              <MusicIcon size={42} />
              <h3 style={{ color: '#A9AFAC', marginTop: '12px' }}>Explora tu música para el bienestar</h3>
              <p style={{ maxWidth: '480px', margin: '6px auto 0 auto', fontSize: '0.9rem' }}>
                Escribe el nombre de tu artista preferido o selecciona uno de los temas sugeridos para empezar a escuchar.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA B: CANCIONES FAVORITAS                                 */}
      {/* ============================================================== */}
      {activeTab === 'favorites' && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', margin: '0 0 4px 0', color: '#F1F1EB' }}>
                Mis Canciones Favoritas
              </h2>
              <p style={{ margin: 0, color: '#A9AFAC', fontSize: '0.88rem' }}>
                Tu santuario musical guardado en LÚMINA.
              </p>
            </div>

            {myFavorites.length > 0 && (
              <button
                onClick={() => handlePlayTrack(myFavorites[0])}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}
              >
                <PlayIcon size={16} />
                <span>Reproducir todo</span>
              </button>
            )}
          </div>

          {myFavorites.length === 0 ? (
            <div style={{
              backgroundColor: '#17221b',
              border: '1px dashed rgba(164, 203, 179, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '60px 20px',
              textAlign: 'center'
            }}>
              <HeartIcon size={40} className="" />
              <h3 style={{ color: '#F1F1EB', marginTop: '14px', fontSize: '1.2rem' }}>Aún no guardaste canciones favoritas</h3>
              <p style={{ color: '#A9AFAC', maxWidth: '420px', margin: '8px auto 20px auto', fontSize: '0.9rem' }}>
                Explora canciones en Spotify y YouTube desde el buscador y presiona el corazón para tenerlas siempre a mano.
              </p>
              <button
                onClick={() => setActiveTab('search')}
                className="btn-primary"
              >
                Ir al buscador
              </button>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#17221b',
              border: '1px solid rgba(164, 203, 179, 0.2)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(164, 203, 179, 0.15)', color: '#79837e', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '14px 18px', width: '50px' }}>#</th>
                    <th style={{ padding: '14px 18px' }}>Título</th>
                    <th style={{ padding: '14px 18px' }}>Álbum / Origen</th>
                    <th style={{ padding: '14px 18px' }}>Plataforma</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {myFavorites.map((track, idx) => {
                    const isPlaying = currentPlayback && currentPlayback.external_id === track.external_id;
                    return (
                      <tr
                        key={track.id}
                        style={{
                          borderBottom: '1px solid rgba(164, 203, 179, 0.08)',
                          backgroundColor: isPlaying ? 'rgba(40, 102, 75, 0.2)' : 'transparent',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '14px 18px', color: '#79837e' }}>
                          <button
                            onClick={() => handlePlayTrack(track)}
                            style={{ background: 'none', border: 'none', color: isPlaying ? '#A4CBB3' : '#F1F1EB', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            <PlayIcon size={16} />
                          </button>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {track.cover_url && (
                              <img
                                src={track.cover_url}
                                alt={track.title}
                                style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                              />
                            )}
                            <div>
                              <div style={{ color: isPlaying ? '#A4CBB3' : '#F1F1EB', fontWeight: 600 }}>
                                {track.title}
                              </div>
                              <div style={{ color: '#A9AFAC', fontSize: '0.82rem' }}>
                                {track.artist}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#A9AFAC' }}>
                          {track.album || 'LÚMINA Sonoridades'}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            fontSize: '0.74rem',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontWeight: 600,
                            backgroundColor: track.platform === 'spotify' ? 'rgba(29, 185, 84, 0.2)' : 'rgba(255, 68, 68, 0.2)',
                            color: track.platform === 'spotify' ? '#1DB954' : '#FF6666'
                          }}>
                            {track.platform === 'spotify' ? 'Spotify' : 'YouTube'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <button
                              onClick={() => setSelectedTrackForPlaylist(track)}
                              title="Añadir a lista"
                              style={{ background: 'none', border: 'none', color: '#79837e', cursor: 'pointer', padding: '4px' }}
                            >
                              <PlusIcon size={16} />
                            </button>
                            <button
                              onClick={() => handleToggleFavoriteTrack(track)}
                              title="Quitar de favoritas"
                              style={{ background: 'none', border: 'none', color: '#e4b363', cursor: 'pointer', padding: '4px' }}
                            >
                              <TrashIcon size={16} />
                            </button>
                            {track.external_url && (
                              <a
                                href={track.external_url}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#79837e', padding: '4px' }}
                              >
                                <ExternalLinkIcon size={14} />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA C: ARTISTAS FAVORITOS                                  */}
      {/* ============================================================== */}
      {activeTab === 'artists' && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', margin: '0 0 4px 0', color: '#F1F1EB' }}>
                Artistas que Acompañan tu Paz
              </h2>
              <p style={{ margin: 0, color: '#A9AFAC', fontSize: '0.88rem' }}>
                Tus músicos, compositores e intérpretes predilectos.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('search')}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              <SearchIcon size={15} />
              <span>Buscar nuevos artistas</span>
            </button>
          </div>

          {myArtists.length === 0 ? (
            <div style={{
              backgroundColor: '#17221b',
              border: '1px dashed rgba(164, 203, 179, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '60px 20px',
              textAlign: 'center'
            }}>
              <SparklesIcon size={40} />
              <h3 style={{ color: '#F1F1EB', marginTop: '14px', fontSize: '1.2rem' }}>No tienes artistas guardados todavía</h3>
              <p style={{ color: '#A9AFAC', maxWidth: '420px', margin: '8px auto 20px auto', fontSize: '0.9rem' }}>
                Al buscar pistas en la pestaña de Búsqueda, haz clic en la estrella para seguir y guardar a tus artistas.
              </p>
              <button
                onClick={() => setActiveTab('search')}
                className="btn-primary"
              >
                Descubrir artistas
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
              gap: '20px'
            }}>
              {myArtists.map(artist => (
                <div
                  key={artist.id}
                  style={{
                    backgroundColor: '#17221b',
                    border: '1px solid rgba(164, 203, 179, 0.18)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px 20px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative'
                  }}
                >
                  <button
                    onClick={() => handleToggleArtist(artist.artist_name)}
                    title="Eliminar de favoritos"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      color: '#79837e',
                      cursor: 'pointer'
                    }}
                  >
                    <CloseIcon size={16} />
                  </button>

                  <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: '#101712',
                    border: '2px solid rgba(164, 203, 179, 0.4)',
                    marginBottom: '14px'
                  }}>
                    {artist.image_url ? (
                      <img
                        src={artist.image_url}
                        alt={artist.artist_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A4CBB3', fontSize: '1.8rem', fontWeight: 600 }}>
                        {artist.artist_name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#F1F1EB' }}>
                    {artist.artist_name}
                  </h3>

                  <span style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: artist.platform === 'spotify' ? 'rgba(29, 185, 84, 0.15)' : 'rgba(255, 68, 68, 0.15)',
                    color: artist.platform === 'spotify' ? '#1DB954' : '#FF6666',
                    marginBottom: '16px'
                  }}>
                    {artist.platform === 'spotify' ? 'Spotify' : 'YouTube'}
                  </span>

                  <button
                    onClick={() => {
                      setSearchQuery(artist.artist_name);
                      setActiveTab('search');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(40, 102, 75, 0.3)',
                      border: '1px solid rgba(164, 203, 179, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      color: '#A4CBB3',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <SearchIcon size={14} />
                    <span>Ver canciones</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ============================================================== */}
      {/* PESTAÑA D: MIS LISTAS PERSONALES (PLAYLISTS)                   */}
      {/* ============================================================== */}
      {activeTab === 'playlists' && (
        <section>
          {activePlaylistDetail ? (
            /* Vista Detallada de una Lista */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <button
                  onClick={() => setActivePlaylistDetail(null)}
                  style={{
                    backgroundColor: 'rgba(164, 203, 179, 0.1)',
                    border: '1px solid rgba(164, 203, 179, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    color: '#A4CBB3',
                    padding: '8px 14px',
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  ← Volver a todas las listas
                </button>
              </div>

              <div style={{
                backgroundColor: '#17221b',
                border: '1px solid rgba(164, 203, 179, 0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '16px'
              }}>
                <div>
                  <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#A4CBB3', letterSpacing: '0.08em', fontWeight: 600 }}>
                    Lista de Reproducción
                  </span>
                  <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)', margin: '4px 0 8px 0', color: '#F1F1EB' }}>
                    {activePlaylistDetail.name}
                  </h2>
                  <p style={{ margin: 0, color: '#A9AFAC', fontSize: '0.92rem' }}>
                    {activePlaylistDetail.description || 'Sin descripción.'}
                  </p>
                  <p style={{ margin: '8px 0 0 0', color: '#79837e', fontSize: '0.8rem' }}>
                    {activePlaylistDetail.tracks?.length || 0} canciones agregadas
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {activePlaylistDetail.tracks?.length > 0 && (
                    <button
                      onClick={() => handlePlayTrack(activePlaylistDetail.tracks[0])}
                      className="btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <PlayIcon size={16} />
                      <span>Reproducir lista</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePlaylist(activePlaylistDetail.id, activePlaylistDetail.name)}
                    className="btn-secondary"
                    style={{ color: '#ff9d94', borderColor: 'rgba(201, 98, 87, 0.4)' }}
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>

              {/* Lista de pistas */}
              {(!activePlaylistDetail.tracks || activePlaylistDetail.tracks.length === 0) ? (
                <div style={{
                  textAlign: 'center',
                  padding: '50px 20px',
                  backgroundColor: '#17221b',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px dashed rgba(164, 203, 179, 0.2)'
                }}>
                  <p style={{ color: '#A9AFAC', marginBottom: '16px' }}>Esta lista aún no contiene canciones.</p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="btn-primary"
                    style={{ fontSize: '0.88rem' }}
                  >
                    Buscar canciones para agregar
                  </button>
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#17221b',
                  border: '1px solid rgba(164, 203, 179, 0.2)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(164, 203, 179, 0.15)', color: '#79837e', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '14px 18px', width: '50px' }}>#</th>
                        <th style={{ padding: '14px 18px' }}>Título</th>
                        <th style={{ padding: '14px 18px' }}>Artista</th>
                        <th style={{ padding: '14px 18px' }}>Plataforma</th>
                        <th style={{ padding: '14px 18px', textAlign: 'right' }}>Quitar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activePlaylistDetail.tracks.map((track, idx) => {
                        const isPlaying = currentPlayback && currentPlayback.external_id === track.external_id;
                        return (
                          <tr
                            key={track.id}
                            style={{
                              borderBottom: '1px solid rgba(164, 203, 179, 0.08)',
                              backgroundColor: isPlaying ? 'rgba(40, 102, 75, 0.2)' : 'transparent'
                            }}
                          >
                            <td style={{ padding: '14px 18px' }}>
                              <button
                                onClick={() => handlePlayTrack(track)}
                                style={{ background: 'none', border: 'none', color: isPlaying ? '#A4CBB3' : '#F1F1EB', cursor: 'pointer' }}
                              >
                                <PlayIcon size={16} />
                              </button>
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {track.cover_url && (
                                  <img
                                    src={track.cover_url}
                                    alt={track.title}
                                    style={{ width: '38px', height: '38px', borderRadius: '4px', objectFit: 'cover' }}
                                  />
                                )}
                                <span style={{ fontWeight: 600, color: isPlaying ? '#A4CBB3' : '#F1F1EB' }}>
                                  {track.title}
                                </span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 18px', color: '#A9AFAC' }}>
                              {track.artist}
                            </td>
                            <td style={{ padding: '14px 18px' }}>
                              <span style={{
                                fontSize: '0.74rem',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontWeight: 600,
                                backgroundColor: track.platform === 'spotify' ? 'rgba(29, 185, 84, 0.2)' : 'rgba(255, 68, 68, 0.2)',
                                color: track.platform === 'spotify' ? '#1DB954' : '#FF6666'
                              }}>
                                {track.platform === 'spotify' ? 'Spotify' : 'YouTube'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                              <button
                                onClick={() => handleRemoveTrackFromPlaylist(activePlaylistDetail.id, track.id)}
                                title="Quitar de esta lista"
                                style={{ background: 'none', border: 'none', color: '#79837e', cursor: 'pointer' }}
                              >
                                <TrashIcon size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Vista General de Listas */
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-serif)', margin: '0 0 4px 0', color: '#F1F1EB' }}>
                    Tus Listas Temáticas
                  </h2>
                  <p style={{ margin: 0, color: '#A9AFAC', fontSize: '0.88rem' }}>
                    Espacios creados por ti para diferentes momentos de tu día.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}
                >
                  <PlusIcon size={16} />
                  <span>Crear nueva lista</span>
                </button>
              </div>

              {myPlaylists.length === 0 ? (
                <div style={{
                  backgroundColor: '#17221b',
                  border: '1px dashed rgba(164, 203, 179, 0.25)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '60px 20px',
                  textAlign: 'center'
                }}>
                  <ListMusicIcon size={40} />
                  <h3 style={{ color: '#F1F1EB', marginTop: '14px', fontSize: '1.2rem' }}>Crea tu primera lista</h3>
                  <p style={{ color: '#A9AFAC', maxWidth: '440px', margin: '8px auto 20px auto', fontSize: '0.9rem' }}>
                    Organiza canciones como "Mi refugio", "Para días difíciles", "Para estudiar" o "Para descansar".
                  </p>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary"
                  >
                    Crear lista ahora
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '20px'
                }}>
                  {myPlaylists.map(playlist => (
                    <div
                      key={playlist.id}
                      onClick={() => handleOpenPlaylist(playlist.id)}
                      style={{
                        backgroundColor: '#17221b',
                        border: '1px solid rgba(164, 203, 179, 0.2)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '24px',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, border-color 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.borderColor = 'rgba(164, 203, 179, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(164, 203, 179, 0.2)';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(40, 102, 75, 0.35)',
                            color: '#A4CBB3',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <ListMusicIcon size={22} />
                          </div>
                          <span style={{ fontSize: '0.8rem', color: '#79837e' }}>
                            {playlist.track_count || 0} canciones
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.2rem', margin: '0 0 6px 0', color: '#F1F1EB', fontFamily: 'var(--font-serif)' }}>
                          {playlist.name}
                        </h3>

                        <p style={{ margin: 0, color: '#A9AFAC', fontSize: '0.86rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {playlist.description || 'Tu lista personalizada en LÚMINA.'}
                        </p>
                      </div>

                      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.84rem', color: '#A4CBB3', fontWeight: 600 }}>
                          Abrir lista →
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlaylist(playlist.id, playlist.name);
                          }}
                          title="Eliminar lista"
                          style={{ background: 'none', border: 'none', color: '#79837e', cursor: 'pointer', padding: '4px' }}
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREAR NUEVA LISTA PERSONAL                              */}
      {/* ============================================================== */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#17221b',
            border: '1px solid rgba(164, 203, 179, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '30px',
            maxWidth: '460px',
            width: '100%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#F1F1EB', fontFamily: 'var(--font-serif)' }}>
                Nueva Lista Personal
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#79837e', cursor: 'pointer' }}
              >
                <CloseIcon size={20} />
              </button>
            </div>

            {/* Sugerencias de nombres del prompt */}
            <p style={{ fontSize: '0.8rem', color: '#79837e', marginBottom: '8px' }}>Sugerencias recomendadas:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {['Mi refugio', 'Para días difíciles', 'Para estudiar', 'Para descansar', 'Mis canciones favoritas'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNewPlaylistName(s)}
                  style={{
                    backgroundColor: 'rgba(164, 203, 179, 0.1)',
                    border: '1px solid rgba(164, 203, 179, 0.25)',
                    borderRadius: '16px',
                    color: '#A4CBB3',
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            <form onSubmit={handleCreatePlaylist}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Nombre de la lista</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Calma Nocturna"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="form-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '22px' }}>
                <label className="form-label">Descripción (opcional)</label>
                <textarea
                  placeholder="¿Cuál es el propósito o sentimiento de esta lista?"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  className="form-input"
                  rows={3}
                  style={{ width: '100%', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Crear Lista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: AGREGAR PISTA A UNA LISTA PERSONAL                      */}
      {/* ============================================================== */}
      {selectedTrackForPlaylist && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#17221b',
            border: '1px solid rgba(164, 203, 179, 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#F1F1EB' }}>
                Añadir a una lista
              </h3>
              <button
                onClick={() => setSelectedTrackForPlaylist(null)}
                style={{ background: 'none', border: 'none', color: '#79837e', cursor: 'pointer' }}
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#101712',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px'
            }}>
              {selectedTrackForPlaylist.cover_url && (
                <img
                  src={selectedTrackForPlaylist.cover_url}
                  alt={selectedTrackForPlaylist.title}
                  style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                />
              )}
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.92rem', color: '#F1F1EB', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {selectedTrackForPlaylist.title}
                </p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#79837e' }}>
                  {selectedTrackForPlaylist.artist}
                </p>
              </div>
            </div>

            {myPlaylists.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: '#A9AFAC', fontSize: '0.9rem', marginBottom: '12px' }}>
                  Aún no tienes listas creadas.
                </p>
                <button
                  onClick={() => {
                    setSelectedTrackForPlaylist(null);
                    setIsCreateModalOpen(true);
                  }}
                  className="btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Crear mi primera lista
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
                {myPlaylists.map(playlist => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddTrackToPlaylist(playlist.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      backgroundColor: 'rgba(164, 203, 179, 0.08)',
                      border: '1px solid rgba(164, 203, 179, 0.2)',
                      borderRadius: 'var(--radius-md)',
                      color: '#F1F1EB',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(164, 203, 179, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(164, 203, 179, 0.08)'}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{playlist.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#79837e' }}>{playlist.track_count || 0} canciones</div>
                    </div>
                    <span style={{ color: '#A4CBB3', fontSize: '0.85rem' }}>+ Añadir</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* REPRODUCTOR INTEGRADO DOCK (SPOTIFY & YOUTUBE & AUDIO EMBED)   */}
      {/* ============================================================== */}
      {currentPlayback && (
        <div style={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          backgroundColor: '#121814',
          borderTop: '2px solid rgba(164, 203, 179, 0.3)',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.8)',
          zIndex: 9000,
          transition: 'all 0.3s ease',
          padding: isPlayerMinimized ? '10px 24px' : '16px 24px'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Barra superior del dock */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                {currentPlayback.cover_url && (
                  <img
                    src={currentPlayback.cover_url}
                    alt={currentPlayback.title}
                    style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover' }}
                  />
                )}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontWeight: 600, color: '#F1F1EB', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {currentPlayback.title}
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: currentPlayback.platform === 'spotify' ? 'rgba(29, 185, 84, 0.2)' : 'rgba(255, 68, 68, 0.2)',
                      color: currentPlayback.platform === 'spotify' ? '#1DB954' : '#FF6666'
                    }}>
                      {currentPlayback.platform === 'spotify' ? 'Spotify' : 'YouTube'}
                    </span>
                  </div>
                  <div style={{ color: '#A9AFAC', fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentPlayback.artist}
                  </div>
                </div>
              </div>

              {/* Botones de control del dock */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setIsPlayerMinimized(!isPlayerMinimized)}
                  style={{
                    backgroundColor: 'rgba(164, 203, 179, 0.1)',
                    border: '1px solid rgba(164, 203, 179, 0.2)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#A4CBB3',
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  {isPlayerMinimized ? '▲ Expandir Reproductor' : '▼ Minimizar'}
                </button>

                <button
                  onClick={() => setCurrentPlayback(null)}
                  title="Cerrar reproductor"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#79837e',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  <CloseIcon size={20} />
                </button>
              </div>
            </div>

            {/* Contenedor del Iframe / Audio Player si no está minimizado */}
            {!isPlayerMinimized && (
              <div style={{
                marginTop: '6px',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#0a0d0b',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {currentPlayback.platform === 'spotify' && (
                  <iframe
                    title={`Spotify Player - ${currentPlayback.title}`}
                    src={`https://open.spotify.com/embed/track/${currentPlayback.external_id}?utm_source=generator&theme=0`}
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    style={{ borderRadius: '8px' }}
                  />
                )}

                {currentPlayback.platform === 'youtube' && (
                  <iframe
                    title={`YouTube Player - ${currentPlayback.title}`}
                    src={`https://www.youtube-nocookie.com/embed/${currentPlayback.external_id}?autoplay=1&rel=0&modestbranding=1`}
                    width="100%"
                    height="180"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: '8px', maxWidth: '480px' }}
                  />
                )}

                {currentPlayback.platform !== 'spotify' && currentPlayback.platform !== 'youtube' && currentPlayback.preview_url && (
                  <div style={{ width: '100%', padding: '10px' }}>
                    <audio
                      src={currentPlayback.preview_url}
                      controls
                      autoPlay
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
