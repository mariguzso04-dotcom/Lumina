const config = require('../config');

// Token en caché para Spotify
let spotifyAccessToken = null;
let spotifyTokenExpiresAt = 0;

// Biblioteca curada de artistas y canciones para bienestar, reflexión y calma
const CURATED_ARTISTS = [
  {
    id: 'art_ludovico_einaudi',
    name: 'Ludovico Einaudi',
    platform: 'spotify',
    external_id: '2IUtNvHptz84sB1J4O5b07',
    image_url: 'https://images.unsplash.com/photo-1520523839898-5071282543e2?auto=format&fit=crop&w=400&q=80',
    genres: ['Neoclásica', 'Piano', 'Minimalismo'],
    external_url: 'https://open.spotify.com/artist/2IUtNvHptz84sB1J4O5b07'
  },
  {
    id: 'art_coldplay',
    name: 'Coldplay',
    platform: 'spotify',
    external_id: '4gzpq5YKM9GDflUPAsMuBm',
    image_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80',
    genres: ['Alt-Rock', 'Pop', 'Acústico'],
    external_url: 'https://open.spotify.com/artist/4gzpq5YKM9GDflUPAsMuBm'
  },
  {
    id: 'art_cigarettes_after_sex',
    name: 'Cigarettes After Sex',
    platform: 'spotify',
    external_id: '1QAJqy2G1KVxOG69fLYpn9',
    image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
    genres: ['Dream Pop', 'Ambient Pop', 'Slowcore'],
    external_url: 'https://open.spotify.com/artist/1QAJqy2G1KVxOG69fLYpn9'
  },
  {
    id: 'art_bon_iver',
    name: 'Bon Iver',
    platform: 'spotify',
    external_id: '4LEiUm1SRbFMgfqnQTwUbQ',
    image_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=400&q=80',
    genres: ['Indie Folk', 'Acoustic', 'Atmospheric'],
    external_url: 'https://open.spotify.com/artist/4LEiUm1SRbFMgfqnQTwUbQ'
  },
  {
    id: 'art_aurora',
    name: 'AURORA',
    platform: 'spotify',
    external_id: '1WgXqy2Dd70QQOU7Ay074N',
    image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80',
    genres: ['Art Pop', 'Nordic Folk', 'Ethereal'],
    external_url: 'https://open.spotify.com/artist/1WgXqy2Dd70QQOU7Ay074N'
  },
  {
    id: 'art_yiruma',
    name: 'Yiruma',
    platform: 'spotify',
    external_id: '0fauHpmUXI120n9Q0ptp4R',
    image_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80',
    genres: ['Piano Solo', 'Instrumental', 'Calma'],
    external_url: 'https://open.spotify.com/artist/0fauHpmUXI120n9Q0ptp4R'
  },
  {
    id: 'art_max_richter',
    name: 'Max Richter',
    platform: 'spotify',
    external_id: '2Kqb423K283K3u7d1zM6Jq',
    image_url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=400&q=80',
    genres: ['Post-Minimalismo', 'Cine', 'Ambient'],
    external_url: 'https://open.spotify.com/artist/2Kqb423K283K3u7d1zM6Jq'
  },
  {
    id: 'art_billie_eilish',
    name: 'Billie Eilish',
    platform: 'spotify',
    external_id: '6qqNVTkY8uBg9cP3Jd7DAH',
    image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    genres: ['Alt-Pop', 'Vocal', 'Intimista'],
    external_url: 'https://open.spotify.com/artist/6qqNVTkY8uBg9cP3Jd7DAH'
  }
];

const CURATED_TRACKS = [
  {
    id: 'trk_nuvole_bianche',
    title: 'Nuvole Bianche',
    artist: 'Ludovico Einaudi',
    album: 'Una Mattina',
    platform: 'spotify',
    external_id: '3weNRklVDqq4J3Ghn5HQv7',
    cover_url: 'https://images.unsplash.com/photo-1520523839898-5071282543e2?auto=format&fit=crop&w=300&q=80',
    duration_seconds: 357,
    preview_url: null,
    external_url: 'https://open.spotify.com/track/3weNRklVDqq4J3Ghn5HQv7'
  },
  {
    id: 'trk_experience',
    title: 'Experience',
    artist: 'Ludovico Einaudi',
    album: 'In a Time Lapse',
    platform: 'spotify',
    external_id: '1BncfTTo42TIq0HptMAflY',
    cover_url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=300&q=80',
    duration_seconds: 315,
    preview_url: null,
    external_url: 'https://open.spotify.com/track/1BncfTTo42TIq0HptMAflY'
  },
  {
    id: 'trk_fix_you',
    title: 'Fix You',
    artist: 'Coldplay',
    album: 'X&Y',
    platform: 'spotify',
    external_id: '7LVHVU3tWfcxj5aiP2Jw4t',
    cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
    duration_seconds: 295,
    preview_url: null,
    external_url: 'https://open.spotify.com/track/7LVHVU3tWfcxj5aiP2Jw4t'
  },
  {
    id: 'trk_apocalypse',
    title: 'Apocalypse',
    artist: 'Cigarettes After Sex',
    album: 'Cigarettes After Sex',
    platform: 'spotify',
    external_id: '3AVrWABHpIXezUN968zrBt',
    cover_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80',
    duration_seconds: 290,
    preview_url: null,
    external_url: 'https://open.spotify.com/track/3AVrWABHpIXezUN968zrBt'
  },
  {
    id: 'trk_holocene',
    title: 'Holocene',
    artist: 'Bon Iver',
    album: 'Bon Iver',
    platform: 'spotify',
    external_id: '4fbvZwSnH19tGhVeomMI7E',
    cover_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=300&q=80',
    duration_seconds: 337,
    preview_url: null,
    external_url: 'https://open.spotify.com/track/4fbvZwSnH19tGhVeomMI7E'
  },
  {
    id: 'trk_river_flows',
    title: 'River Flows In You',
    artist: 'Yiruma',
    album: 'First Love',
    platform: 'spotify',
    external_id: '64rL4R03ospsAIfG6WF747',
    cover_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=300&q=80',
    duration_seconds: 188,
    preview_url: null,
    external_url: 'https://open.spotify.com/track/64rL4R03ospsAIfG6WF747'
  },
  {
    id: 'trk_weightless',
    title: 'Weightless (Calma Profunda)',
    artist: 'Marconi Union',
    album: 'Weightless (Ambient)',
    platform: 'youtube',
    external_id: 'UfcAVejslrU',
    cover_url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=300&q=80',
    duration_seconds: 485,
    preview_url: null,
    external_url: 'https://www.youtube.com/watch?v=UfcAVejslrU'
  },
  {
    id: 'trk_lofi_sleep',
    title: 'Lo-Fi Chill & Calma Nocturna',
    artist: 'Lofi Girl',
    album: 'Peaceful Sleep Beats',
    platform: 'youtube',
    external_id: 'jfKfPfyJRdk',
    cover_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80',
    duration_seconds: 600,
    preview_url: null,
    external_url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk'
  },
  {
    id: 'trk_clair_de_lune',
    title: 'Clair de Lune',
    artist: 'Claude Debussy',
    album: 'Suite Bergamasque',
    platform: 'youtube',
    external_id: 'WNcsUNKlAKw',
    cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=300&q=80',
    duration_seconds: 300,
    preview_url: null,
    external_url: 'https://www.youtube.com/watch?v=WNcsUNKlAKw'
  },
  {
    id: 'trk_runaway',
    title: 'Runaway',
    artist: 'AURORA',
    album: 'All My Demons Greeting Me As A Friend',
    platform: 'spotify',
    external_id: '1v1oIWf2X9e49QSoTIeeRx',
    cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=80',
    duration_seconds: 248,
    preview_url: null,
    external_url: 'https://open.spotify.com/track/1v1oIWf2X9e49QSoTIeeRx'
  }
];

// Obtención de token de Spotify via Client Credentials Flow
async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const now = Date.now();
  if (spotifyAccessToken && now < spotifyTokenExpiresAt) {
    return spotifyAccessToken;
  }

  try {
    const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${creds}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!res.ok) return null;
    const data = await res.json();
    spotifyAccessToken = data.access_token;
    spotifyTokenExpiresAt = now + (data.expires_in - 60) * 1000;
    return spotifyAccessToken;
  } catch (err) {
    console.warn('[Spotify API] Error al obtener token:', err.message);
    return null;
  }
}

// Búsqueda en API oficial de Spotify
async function searchSpotify(query) {
  const token = await getSpotifyToken();
  if (!token) return null;

  try {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,artist&limit=10`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) return null;
    const data = await res.json();

    const tracks = (data.tracks?.items || []).map(t => ({
      id: `sp_trk_${t.id}`,
      title: t.name,
      artist: t.artists.map(a => a.name).join(', '),
      album: t.album.name,
      platform: 'spotify',
      external_id: t.id,
      cover_url: t.album.images?.[0]?.url || null,
      duration_seconds: Math.floor(t.duration_ms / 1000),
      preview_url: t.preview_url,
      external_url: t.external_urls.spotify
    }));

    const artists = (data.artists?.items || []).map(a => ({
      id: `sp_art_${a.id}`,
      name: a.name,
      platform: 'spotify',
      external_id: a.id,
      image_url: a.images?.[0]?.url || null,
      genres: a.genres || [],
      external_url: a.external_urls.spotify
    }));

    return { tracks, artists };
  } catch (err) {
    console.warn('[Spotify API] Error en búsqueda:', err.message);
    return null;
  }
}

// Búsqueda en API oficial de YouTube
async function searchYouTube(query) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&videoCategoryId=10&maxResults=10&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    const tracks = (data.items || []).map(item => ({
      id: `yt_trk_${item.id.videoId}`,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      album: 'YouTube Music',
      platform: 'youtube',
      external_id: item.id.videoId,
      cover_url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
      duration_seconds: 0,
      preview_url: null,
      external_url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    return { tracks, artists: [] };
  } catch (err) {
    console.warn('[YouTube API] Error en búsqueda:', err.message);
    return null;
  }
}

// Búsqueda pública en iTunes Search API (Sin claves requeridas, devuelve audios de vista previa y carátulas reales)
async function searchPublicCatalog(query) {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=12`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    const tracks = (data.results || []).map(r => ({
      id: `it_trk_${r.trackId}`,
      title: r.trackName,
      artist: r.artistName,
      album: r.collectionName,
      platform: 'spotify', // compatible con el reproductor
      external_id: String(r.trackId),
      cover_url: r.artworkUrl100 ? r.artworkUrl100.replace('100x100bb', '600x600bb') : null,
      duration_seconds: Math.floor((r.trackTimeMillis || 0) / 1000),
      preview_url: r.previewUrl,
      external_url: r.trackViewUrl
    }));

    const artistsMap = new Map();
    (data.results || []).forEach(r => {
      if (!artistsMap.has(r.artistId)) {
        artistsMap.set(r.artistId, {
          id: `it_art_${r.artistId}`,
          name: r.artistName,
          platform: 'spotify',
          external_id: String(r.artistId),
          image_url: r.artworkUrl100 ? r.artworkUrl100.replace('100x100bb', '600x600bb') : null,
          genres: [r.primaryGenreName || 'Música'],
          external_url: r.artistViewUrl || null
        });
      }
    });

    return { tracks, artists: Array.from(artistsMap.values()).slice(0, 4) };
  } catch (err) {
    return null;
  }
}

// Función principal de búsqueda con fallback inteligente
async function searchMusic(query, platform = 'all') {
  const cleanQ = (query || '').trim().toLowerCase();
  if (!cleanQ) {
    // Si la búsqueda está vacía, devuelve el catálogo curado de bienvenida
    return {
      tracks: CURATED_TRACKS,
      artists: CURATED_ARTISTS
    };
  }

  let resultsTracks = [];
  let resultsArtists = [];

  // 1. Probar Spotify oficial si están configuradas las credenciales
  if (platform === 'all' || platform === 'spotify') {
    const spotifyRes = await searchSpotify(cleanQ);
    if (spotifyRes && spotifyRes.tracks.length > 0) {
      resultsTracks.push(...spotifyRes.tracks);
      resultsArtists.push(...spotifyRes.artists);
    }
  }

  // 2. Probar YouTube oficial si está configurada la API Key
  if (platform === 'all' || platform === 'youtube') {
    const ytRes = await searchYouTube(cleanQ);
    if (ytRes && ytRes.tracks.length > 0) {
      resultsTracks.push(...ytRes.tracks);
    }
  }

  // 3. Si no hay resultados de APIs propietarias o no están configuradas las claves, usar catálogo público en vivo
  if (resultsTracks.length === 0) {
    const publicRes = await searchPublicCatalog(cleanQ);
    if (publicRes && publicRes.tracks.length > 0) {
      resultsTracks.push(...publicRes.tracks);
      resultsArtists.push(...publicRes.artists);
    }
  }

  // 4. Búsqueda local en el catálogo curado de LÚMINA
  const localTracks = CURATED_TRACKS.filter(t => 
    t.title.toLowerCase().includes(cleanQ) || 
    t.artist.toLowerCase().includes(cleanQ) || 
    t.album.toLowerCase().includes(cleanQ)
  );

  const localArtists = CURATED_ARTISTS.filter(a =>
    a.name.toLowerCase().includes(cleanQ) ||
    a.genres.some(g => g.toLowerCase().includes(cleanQ))
  );

  // Fusionar evitando duplicados de ID
  const trackMap = new Map();
  [...resultsTracks, ...localTracks].forEach(t => trackMap.set(t.external_id || t.id, t));

  const artistMap = new Map();
  [...resultsArtists, ...localArtists].forEach(a => artistMap.set(a.name.toLowerCase(), a));

  let finalTracks = Array.from(trackMap.values());
  let finalArtists = Array.from(artistMap.values());

  // Filtrado final por plataforma solicitada
  if (platform === 'spotify') {
    finalTracks = finalTracks.filter(t => t.platform === 'spotify');
    finalArtists = finalArtists.filter(a => a.platform === 'spotify');
  } else if (platform === 'youtube') {
    finalTracks = finalTracks.filter(t => t.platform === 'youtube');
  }

  return {
    tracks: finalTracks,
    artists: finalArtists,
    has_spotify_configured: Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET),
    has_youtube_configured: Boolean(process.env.YOUTUBE_API_KEY)
  };
}

module.exports = {
  searchMusic,
  CURATED_ARTISTS,
  CURATED_TRACKS
};
