const db = require('../config/database');
const { obtenerImagenAnime, obtenerImagenPorDefecto } = require('../services/imageService');

// ============================================
// OBTENER TODOS LOS ANIMES DE UN USUARIO
// ============================================
exports.getAnimes = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('📺 Obteniendo animes del usuario:', userId);

    const [animes] = await db.query(
      'SELECT * FROM animes WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );

    console.log(`✅ Encontrados ${animes.length} animes`);
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
    const { nombre, tipo, capitulos_vistos } = req.body;

    console.log('➕ Creando anime:', nombre);

    // 🎨 BUSCAR IMAGEN AUTOMÁTICAMENTE
    let imagen_url = await obtenerImagenAnime(nombre);
    
    // Si no se encontró imagen, usar placeholder
    if (!imagen_url) {
      imagen_url = obtenerImagenPorDefecto();
    }

    // Insertamos el nuevo anime CON la imagen
    const [result] = await db.query(
      'INSERT INTO animes (user_id, nombre, imagen_url, tipo, capitulos_vistos, estado) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, nombre, imagen_url, tipo, capitulos_vistos || 0, 'viendo']
    );

    // Obtenemos el anime recién creado
    const [newAnime] = await db.query(
      'SELECT * FROM animes WHERE id = ?',
      [result.insertId]
    );

    console.log('✅ Anime creado con ID:', result.insertId);
    console.log('🖼️ Imagen asignada:', imagen_url);

    res.status(201).json(newAnime[0]);
  } catch (error) {
    console.error('❌ Error creando anime:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// ACTUALIZAR UN ANIME
// ============================================
exports.updateAnime = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { nombre, capitulos_vistos, estado, calificacion } = req.body;

    console.log('🔄 Actualizando anime ID:', id);

    const [result] = await db.query(
      'UPDATE animes SET nombre = ?, capitulos_vistos = ?, estado = ?, calificacion = ? WHERE id = ? AND user_id = ?',
      [nombre, capitulos_vistos, estado, calificacion, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Anime no encontrado' });
    }

    // Obtenemos el anime actualizado
    const [updatedAnime] = await db.query(
      'SELECT * FROM animes WHERE id = ?',
      [id]
    );

    console.log('✅ Anime actualizado');
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

    console.log('🗑️ Eliminando anime ID:', id);

    const [result] = await db.query(
      'DELETE FROM animes WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Anime no encontrado' });
    }

    console.log('✅ Anime eliminado');
    res.json({ message: 'Anime eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error eliminando anime:', error);
    res.status(500).json({ error: error.message });
  }
};