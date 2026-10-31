const express = require('express');
const router = express.Router();
const musicController = require('../controllers/musicController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

// --- Paisajes sonoros originales de LÚMINA ---
router.get('/', optionalAuth, musicController.listTracks);
router.get('/categories', musicController.listCategories);
router.get('/favorites', requireAuth, musicController.listFavorites);
router.post('/favorites/:trackId', requireAuth, musicController.addFavorite);
router.delete('/favorites/:trackId', requireAuth, musicController.removeFavorite);

// --- Sección Mi Música: Búsqueda Spotify & YouTube ---
router.get('/search', optionalAuth, musicController.searchMusicEndpoint);

// --- Sección Mi Música: Artistas Favoritos ---
router.get('/my-artists', requireAuth, musicController.listMyArtists);
router.post('/my-artists', requireAuth, musicController.addMyArtist);
router.delete('/my-artists/:id', requireAuth, musicController.removeMyArtist);

// --- Sección Mi Música: Canciones Favoritas ---
router.get('/my-tracks', requireAuth, musicController.listMyTracks);
router.post('/my-tracks', requireAuth, musicController.addMyTrack);
router.delete('/my-tracks/:id', requireAuth, musicController.removeMyTrack);

// --- Sección Mi Música: Listas Personales (Playlists) ---
router.get('/playlists', requireAuth, musicController.listPlaylists);
router.post('/playlists', requireAuth, musicController.createPlaylist);
router.get('/playlists/:id', requireAuth, musicController.getPlaylist);
router.patch('/playlists/:id', requireAuth, musicController.updatePlaylist);
router.delete('/playlists/:id', requireAuth, musicController.deletePlaylist);
router.post('/playlists/:id/tracks', requireAuth, musicController.addTrackToPlaylist);
router.delete('/playlists/:id/tracks/:trackId', requireAuth, musicController.removeTrackFromPlaylist);

module.exports = router;

