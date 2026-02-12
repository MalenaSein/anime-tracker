const db = require('../config/database');
const { obtenerImagenAnime, obtenerImagenPorDefecto } = require('../services/imageService');

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
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// CREAR UN NUEVO ANIME
// ============================================
exports.createAnime = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre, tipo, capitulos_vistos, estado } = req.body;

    console.log('➕ Creando anime:', nombre);

    let imagen_url = await obtenerImagenAnime(nombre);
    if (!imagen_url) {
      imagen_url = obtenerImagenPorDefecto();
    }

    // Validar estado (incluye 'por_ver')
    const estadoValido = ['viendo', 'completado', 'pausado', 'abandonado', 'por_ver'].includes(estado)
      ? estado
      : 'viendo';

    const [result] = await db.query(
      'INSERT INTO animes (user_id, nombre, imagen_url, tipo, capitulos_vistos, estado) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, nombre, imagen_url, tipo, capitulos_vistos || 0, estadoValido]
    );

    const [newAnime] = await db.query(
      'SELECT * FROM animes WHERE id = ?',
      [result.insertId]
    );

    console.log('✅ Anime creado con ID:', result.insertId);
    res.status(201).json(newAnime[0]);
  } catch (error) {
    console.error('❌ Error creando anime:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// ACTUALIZAR UN ANIME
// FIX: Se incluye 'tipo' en el UPDATE para que no se pierda al editar
// ============================================
exports.updateAnime = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { nombre, capitulos_vistos, estado, calificacion, tipo } = req.body;

    console.log('🔄 Actualizando anime ID:', id, '| tipo recibido:', tipo);

    // Obtener el anime actual para no perder campos no enviados
    const [currentAnime] = await db.query(
      'SELECT * FROM animes WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (currentAnime.length === 0) {
      return res.status(404).json({ error: 'Anime no encontrado' });
    }

    const current = currentAnime[0];

    // Usar los valores enviados, o los actuales si no se envían
    const updatedNombre = nombre !== undefined ? nombre : current.nombre;
    const updatedTipo = tipo !== undefined ? tipo : current.tipo;  // ← FIX CRÍTICO
    const updatedCaps = capitulos_vistos !== undefined ? capitulos_vistos : current.capitulos_vistos;
    const updatedEstado = estado !== undefined ? estado : current.estado;
    const updatedCalificacion = calificacion !== undefined ? calificacion : current.calificacion;

    const [result] = await db.query(
      `UPDATE animes 
       SET nombre = ?, tipo = ?, capitulos_vistos = ?, estado = ?, calificacion = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [updatedNombre, updatedTipo, updatedCaps, updatedEstado, updatedCalificacion, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Anime no encontrado' });
    }

    const [updatedAnime] = await db.query(
      'SELECT * FROM animes WHERE id = ?',
      [id]
    );

    console.log('✅ Anime actualizado - tipo guardado:', updatedAnime[0].tipo);
    res.json(updatedAnime[0]);
  } catch (error) {
    console.error('❌ Error actualizando anime:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// ELIMINAR UN ANIME
// ============================================
exports.deleteAnime = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await db.query(
      'DELETE FROM animes WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Anime no encontrado' });
    }

    res.json({ message: 'Anime eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error eliminando anime:', error);
    res.status(500).json({ error: error.message });
  }
};