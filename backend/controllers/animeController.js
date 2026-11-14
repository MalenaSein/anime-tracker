const fs = require('fs');
const path = require('path');
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

const DEFAULT_IMAGE_HOSTS = ['placehold.co', 'via.placeholder.com'];

function isPlaceholderImage(url) {
  if (!url) return true;
  return DEFAULT_IMAGE_HOSTS.some((host) => url.includes(host));
}

// Portadas ya resueltas para la lista importada. Permite reparar
// los animes viejos sin hacer 134 búsquedas a AniList.
function loadBundledCovers() {
  try {
    const file = path.join(__dirname, '..', '..', 'imports', 'animes.json');
    if (!fs.existsSync(file)) return new Map();

    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const map = new Map();

    for (const anime of data.animes || []) {
      if (anime?.nombre && anime?.imagen_url) {
        map.set(anime.nombre.trim().toLowerCase(), anime.imagen_url);
      }
    }

    return map;
  } catch (error) {
    console.warn('⚠️ No se pudo leer imports/animes.json:', error.message);
    return new Map();
  }
}

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
// ACTUALIZAR PORTADAS FALTANTES
// POST /api/animes/refresh-covers
// ============================================
exports.refreshCovers = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      'SELECT id, nombre, imagen_url FROM animes WHERE user_id = ?',
      [userId]
    );

    const missing = rows.filter((row) => isPlaceholderImage(row.imagen_url));
    const bundledCovers = loadBundledCovers();
    const notFound = [];

    let updated = 0;

    for (const row of missing) {
      const cover = bundledCovers.get(row.nombre.trim().toLowerCase());

      if (!cover) {
        notFound.push(row.nombre);
        continue;
      }

      await db.query(
        'UPDATE animes SET imagen_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
        [cover, row.id, userId]
      );
      updated += 1;
    }

    res.json({
      total: rows.length,
      missing: missing.length,
      updated,
      remaining: notFound.length,
      notFound
    });
  } catch (error) {
    console.error('❌ Error actualizando portadas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ============================================
// IMPORTAR ANIMES EN LOTE
// POST /api/animes/import
// ============================================
exports.importAnimes = async (req, res) => {
  let connection;

  try {
    const userId = req.user.id;
    const { animes, replace = false } = req.body;

    if (!Array.isArray(animes) || animes.length === 0) {
      return res.status(400).json({ error: 'Debés enviar una lista de animes' });
    }
    if (animes.length > 500) {
      return res.status(400).json({ error: 'El máximo es 500 animes por importación' });
    }
    if (typeof replace !== 'boolean') {
      return res.status(400).json({ error: 'replace debe ser booleano' });
    }

    const prepared = [];
    const errors = [];

    for (let index = 0; index < animes.length; index += 1) {
      const normalized = normalizeAnimeImport(animes[index]);
      if (!normalized.ok) {
        errors.push({ index, nombre: animes[index]?.nombre, error: normalized.error });
      } else {
        prepared.push({ anime: normalized.value, index });
      }
    }

    // Si se va a reemplazar la lista, todos los items deben ser válidos
    // para no borrar datos y quedarnos con una importación a medias.
    if (replace && errors.length > 0) {
      return res.status(400).json({
        error: 'Hay animes inválidos. Corregilos antes de reemplazar tu lista.',
        errors
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const existingByName = new Map();
    const imported = [];
    let updated = 0;
    let deleted = 0;
    const imagenPorDefecto = obtenerImagenPorDefecto();

    if (replace) {
      const [deleteResult] = await connection.query(
        'DELETE FROM animes WHERE user_id = ?',
        [userId]
      );
      deleted = deleteResult.affectedRows;
    } else {
      const [existingRows] = await connection.query(
        'SELECT id, nombre FROM animes WHERE user_id = ?',
        [userId]
      );
      existingRows.forEach((row) => {
        existingByName.set(row.nombre.trim().toLowerCase(), row.id);
      });
    }

    for (const { anime, index } of prepared) {
      const key = anime.nombre.toLowerCase();
      const existingId = existingByName.get(key);

      if (existingId) {
        if (replace) {
          errors.push({ index, nombre: anime.nombre, error: 'Nombre duplicado en la lista', skipped: true });
          continue;
        }

        // Si ya existe, solo actualizamos la portada (permite reparar
        // importaciones viejas hechas con el placeholder).
        if (anime.imagen_url) {
          await connection.query(
            'UPDATE animes SET imagen_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
            [anime.imagen_url, existingId, userId]
          );
          updated += 1;
        } else {
          errors.push({ index, nombre: anime.nombre, error: 'Ya existe en tu lista', skipped: true });
        }
        continue;
      }

      const [result] = await connection.query(
        `INSERT INTO animes
          (user_id, nombre, imagen_url, tipo, capitulos_vistos, estado, calificacion)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          anime.nombre,
          anime.imagen_url || imagenPorDefecto,
          anime.tipo,
          anime.capitulos_vistos,
          anime.estado,
          anime.calificacion
        ]
      );

      existingByName.set(key, result.insertId);
      imported.push({ id: result.insertId, ...anime });
    }

    await connection.commit();

    res.json({
      imported: imported.length,
      updated,
      deleted,
      skipped: errors.filter((error) => error.skipped).length,
      failed: errors.filter((error) => !error.skipped).length,
      animes: imported,
      errors
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('❌ Error haciendo rollback:', rollbackError.message);
      }
    }
    console.error('❌ Error importando animes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    if (connection) connection.release();
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