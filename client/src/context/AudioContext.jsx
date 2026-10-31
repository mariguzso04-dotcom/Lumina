import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { soundscapeGenerator } from '../utils/SoundscapeGenerator';
import { musicService } from '../services/api';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState('0:00');
  const [durationFormatted, setDurationFormatted] = useState('0:00');
  const [favorites, setFavorites] = useState(new Set());

  const audioRef = useRef(new Audio());
  const timerRef = useRef(null);

  const loadTracks = async () => {
    try {
      const res = await musicService.list();
      if (res.success && res.data) {
        setTracks(res.data);
        const favSet = new Set(res.data.filter(t => t.is_favorite).map(t => t.id));
        setFavorites(favSet);
      }
    } catch (err) {
      console.warn('Error al cargar pistas musicales:', err);
    }
  };

  useEffect(() => {
    loadTracks();

    const audio = audioRef.current;
    audio.volume = volume;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        setProgress(pct);
        const m = Math.floor(audio.currentTime / 60);
        const s = Math.floor(audio.currentTime % 60);
        setCurrentTimeFormatted(`${m}:${s < 10 ? '0' : ''}${s}`);
      }
    };

    const handleLoadedMetadata = () => {
      const m = Math.floor(audio.duration / 60);
      const s = Math.floor(audio.duration % 60);
      setDurationFormatted(`${m}:${s < 10 ? '0' : ''}${s}`);
    };

    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      soundscapeGenerator.stop();
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const playTrack = (track) => {
    if (!track) return;
    setCurrentTrack(track);

    if (track.is_soundscape || track.soundscape_preset) {
      // Detener audio HTML5 si estaba sonando
      audioRef.current.pause();
      soundscapeGenerator.setVolume(volume);
      soundscapeGenerator.playPreset(track.soundscape_preset || 'rain');
      setIsPlaying(true);

      // Simular progreso para paisajes infinitos
      let elapsed = 0;
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        elapsed += 1;
        const total = track.duration_seconds || 600;
        setProgress(Math.min(100, (elapsed / total) * 100));
        const m = Math.floor(elapsed / 60);
        const s = Math.floor(elapsed % 60);
        setCurrentTimeFormatted(`${m}:${s < 10 ? '0' : ''}${s}`);
      }, 1000);
    } else {
      soundscapeGenerator.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      audioRef.current.src = track.audio_url;
      audioRef.current.play().catch(e => console.warn('Autoplay bloqueado:', e));
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (currentTrack?.is_soundscape) {
      soundscapeGenerator.stop();
    } else {
      audioRef.current.pause();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
  };

  const resume = () => {
    if (currentTrack) {
      playTrack(currentTrack);
    } else if (tracks.length > 0) {
      playTrack(tracks[0]);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const setVolume = (val) => {
    const v = Math.max(0, Math.min(1, val));
    setVolumeState(v);
    audioRef.current.volume = v;
    soundscapeGenerator.setVolume(v);
  };

  const nextTrack = () => {
    if (tracks.length === 0 || !currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex]);
  };

  const prevTrack = () => {
    if (tracks.length === 0 || !currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIndex]);
  };

  const toggleFavorite = async (trackId) => {
    const isFav = favorites.has(trackId);
    try {
      if (isFav) {
        await musicService.removeFavorite(trackId);
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(trackId);
          return next;
        });
      } else {
        await musicService.addFavorite(trackId);
        setFavorites(prev => new Set([...prev, trackId]));
      }
    } catch (err) {
      console.warn('Error al alternar favorito:', err);
    }
  };

  const value = {
    tracks,
    currentTrack,
    isPlaying,
    volume,
    progress,
    currentTimeFormatted,
    durationFormatted,
    favorites,
    playTrack,
    pause,
    resume,
    togglePlay,
    setVolume,
    nextTrack,
    prevTrack,
    toggleFavorite,
    reloadTracks: loadTracks
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error('useAudio debe ser utilizado dentro de un AudioProvider');
  }
  return ctx;
}
