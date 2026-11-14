const db = require('../config/database');
const { obtenerImagenAnime, obtenerImagenPorDefecto } = require('../services/imageService');
const { normalizeAnimeImport } = require('../utils/animeImport');
const {
  ESTADOS_ANIME,
  isNonEmptyString,
  toInteger,
  isValidEstado,
  isValidRating
} = require('../utils/validation');

// ============================================
// OBTENER TODOS LOS ANIMES DE UN USUARIO
// ============================================
exports.getAnimes = async (req, res) => {
  try {
    const userId = req.user.id;
    const [animes] = await db.query(
      'SELECT * FROM animes WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );
    res.json(animes);
  } catch (error) {
    console.error('❌ Error obteniendo animes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ============================================
// CREAR UN NUEVO ANIME
// ============================================
exports.createAnime = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre, tipo, capitulos_vistos, estado } = req.body;

    if (!isNonEmptyString(nombre)) {
      return res.status(400).json({ error: 'El nombre del anime es obligatorio' });
    }

    const caps = capitulos_vistos === undefined ? 0 : toInteger(capitulos_vistos);
    if (caps === null || caps < 0) {
      return res.status(400).json({ error: 'Los capítulos vistos deben ser un número entero mayor o igual a 0' });
    }

    const estadoValido = estado === undefined
      ? 'viendo'
      : (isValidEstado(estado) ? estado : null);
    if (estadoValido === null) {
      return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${ESTADOS_ANIME.join(', ')}` });
    }

    const tipoValido = isNonEmptyString(tipo) ? tipo.trim() : 'Desconocido';
    const nombreAnime = nombre.trim();

    let imagen_url = await obtenerImagenAnime(nombreAnime);
    if (!imagen_url) {
      imagen_url = obtenerImagenPorDefecto();
    }

    const [result] = await db.query(
      'INSERT INTO animes (user_id, nombre, imagen_url, tipo, capitulos_vistos, estado) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, nombreAnime, imagen_url, tipoValido, caps, estadoValido]
    );

    const [newAnime] = await db.query(
      'SELECT * FROM animes WHERE id = ?',
      [result.insertId]
    );

    console.log('✅ Anime creado con ID:', result.insertId);
    res.status(201).json(newAnime[0]);
  } catch (error) {
    console.error('❌ Error creando anime:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ============================================
// ACTUALIZAR UN ANIME
// ============================================
exports.updateAnime = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { nombre, capitulos_vistos, estado, calificacion, tipo } = req.body;

    const animeId = toInteger(id);
    if (animeId === null) {
      return res.status(400).json({ error: 'ID de anime inválido' });
    }

    if (nombre !== undefined && !isNonEmptyString(nombre)) {
      return res.status(400).json({ error: 'El nombre del anime no puede estar vacío' });
    }
    if (estado !== undefined && !isValidEstado(estado)) {
      return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${ESTADOS_ANIME.join(', ')}` });
    }
    if (!isValidRating(calificacion)) {
      return res.status(400).json({ error: 'La calificación debe ser un entero entre 0 y 5' });
    }
    if (capitulos_vistos !== undefined) {
      const caps = toInteger(capitulos_vistos);
      if (caps === null || caps < 0) {
        return res.status(400).json({ error: 'Los capítulos vistos deben ser un número entero mayor o igual a 0' });
      }
    }

    const [currentAnime] = await db.query(
      'SELECT * FROM animes WHERE id = ? AND user_id = ?',
      [animeId, userId]
    );

    if (currentAnime.length === 0) {
      return res.status(404).json({ error: 'Anime no encontrado' });
    }

    const current = currentAnime[0];

    const updatedNombre = nombre !== undefined ? nombre.trim() : current.nombre;
    const updatedTipo = tipo !== undefined ? (isNonEmptyString(tipo) ? tipo.trim() : 'Desconocido') : current.tipo;
    const updatedCaps = capitulos_vistos !== undefined ? toInteger(capitulos_vistos) : current.capitulos_vistos;
    const updatedEstado = estado !== undefined ? estado : current.estado;
    const updatedCalificacion = calificacion !== undefined ? calificacion : current.calificacion;

    const [result] = await db.query(
      `UPDATE animes
       SET nombre = ?, tipo = ?, capitulos_vistos = ?, estado = ?, calificacion = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [updatedNombre, updatedTipo, updatedCaps, updatedEstado, updatedCalificacion, animeId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Anime no encontrado' });
    }

    const [updatedAnime] = await db.query(
      'SELECT * FROM animes WHERE id = ?',
      [animeId]
    );

    res.json(updatedAnime[0]);
  } catch (error) {
    console.error('❌ Error actualizando anime:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ============================================
// IMPORTAR ANIMES EN LOTE
// POST /api/animes/import
// ============================================
exports.importAnimes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { animes } = req.body;

    if (!Array.isArray(animes) || animes.length === 0) {
      return res.status(400).json({ error: 'Debés enviar una lista de animes' });
    }
    if (animes.length > 500) {
      return res.status(400).json({ error: 'El máximo es 500 animes por importación' });
    }

    const [existingRows] = await db.query(
      'SELECT nombre FROM animes WHERE user_id = ?',
      [userId]
    );
    const existingNames = new Set(
      existingRows.map((row) => row.nombre.trim().toLowerCase())
    );

    const imported = [];
    const errors = [];
    const imagenPorDefecto = obtenerImagenPorDefecto();

    for (let index = 0; index < animes.length; index += 1) {
      const normalized = normalizeAnimeImport(animes[index]);

      if (!normalized.ok) {
        errors.push({ index, nombre: animes[index]?.nombre, error: normalized.error });
        continue;
      }

      const anime = normalized.value;
      const key = anime.nombre.toLowerCase();

      if (existingNames.has(key)) {
        errors.push({ index, nombre: anime.nombre, error: 'Ya existe en tu lista', skipped: true });
        continue;
      }

      try {
        const [result] = await db.query(
          `INSERT INTO animes
            (user_id, nombre, imagen_url, tipo, capitulos_vistos, estado, calificacion)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            anime.nombre,
            imagenPorDefecto,
            anime.tipo,
            anime.capitulos_vistos,
            anime.estado,
            anime.calificacion
          ]
        );

        existingNames.add(key);
        imported.push({ id: result.insertId, ...anime });
      } catch (error) {
        console.error('❌ Error importando anime:', anime.nombre, error.message);
        errors.push({ index, nombre: anime.nombre, error: 'No se pudo guardar' });
      }
    }

    res.json({
      imported: imported.length,
      skipped: errors.filter((error) => error.skipped).length,
      failed: errors.filter((error) => !error.skipped).length,
      animes: imported,
      errors
    });
  } catch (error) {
    console.error('❌ Error importando animes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ============================================
// ELIMINAR UN ANIME
// ============================================
exports.deleteAnime = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const animeId = toInteger(id);
    if (animeId === null) {
      return res.status(400).json({ error: 'ID de anime inválido' });
    }

    const [result] = await db.query(
      'DELETE FROM animes WHERE id = ? AND user_id = ?',
      [animeId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Anime no encontrado' });
    }

    res.json({ message: 'Anime eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error eliminando anime:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};