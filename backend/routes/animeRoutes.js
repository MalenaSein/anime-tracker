const express = require('express');
const router = express.Router();
const animeController = require('../controllers/animeController');
const authMiddleware = require('../middleware/authMiddleware');

// ============================================
// RUTAS DE ANIMES
// ============================================

// TODAS estas rutas requieren autenticación
// Por eso usamos authMiddleware antes de cada función
// Si el usuario no está logueado, el middleware rechaza la petición

// GET /api/animes
// Obtener todos los animes del usuario
router.get('/', authMiddleware, animeController.getAnimes);

// POST /api/animes
// Crear un nuevo anime
router.post('/', authMiddleware, animeController.createAnime);

// POST /api/animes/import
// Importar varios animes en lote
router.post('/import', authMiddleware, animeController.importAnimes);

// POST /api/animes/refresh-covers
// Completar portadas faltantes de animes existentes
router.post('/refresh-covers', authMiddleware, animeController.refreshCovers);

// PUT /api/animes/:id
// Actualizar un anime (capítulos, estado, calificación)
router.put('/:id', authMiddleware, animeController.updateAnime);

// DELETE /api/animes/:id
// Eliminar un anime
router.delete('/:id', authMiddleware, animeController.deleteAnime);

module.exports = router;