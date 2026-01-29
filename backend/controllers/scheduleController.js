const db = require('../config/database');

// ============================================
// OBTENER TODOS LOS HORARIOS DE UN USUARIO
// ============================================
exports.getSchedules = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('📅 Obteniendo horarios del usuario:', userId);

    const [schedules] = await db.query(
      `SELECT s.*, a.nombre as anime_nombre 
       FROM schedules s 
       JOIN animes a ON s.anime_id = a.id 
       WHERE s.user_id = ? 
       ORDER BY s.day, s.hour, s.minute`,
      [userId]
    );

    console.log(`✅ Encontrados ${schedules.length} horarios`);
    res.json(schedules);
  } catch (error) {
    console.error('❌ Error obteniendo horarios:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// CREAR UN NUEVO HORARIO
// ============================================
exports.createSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { anime_id, day, hour, minute = 0, notification_enabled = true } = req.body;

    console.log('➕ Creando horario:', { anime_id, day, hour, minute });

    // Verificar que el anime pertenece al usuario
    const [animeCheck] = await db.query(
      'SELECT id, nombre FROM animes WHERE id = ? AND user_id = ?',
      [anime_id, userId]
    );
    
    if (animeCheck.length === 0) {
      return res.status(404).json({ error: 'Anime no encontrado' });
    }

    // Insertar el horario
    const [result] = await db.query(
      `INSERT INTO schedules (user_id, anime_id, day, hour, minute, notification_enabled)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, anime_id, day, hour, minute, notification_enabled]
    );

    // Obtener el horario recién creado con el nombre del anime
    const [newSchedule] = await db.query(
      `SELECT s.*, a.nombre as anime_nombre 
       FROM schedules s 
       JOIN animes a ON s.anime_id = a.id 
       WHERE s.id = ?`,
      [result.insertId]
    );

    console.log('✅ Horario creado con ID:', result.insertId);
    res.status(201).json(newSchedule[0]);
  } catch (error) {
    console.error('❌ Error creando horario:', error);
    
    // Error de duplicado (ya existe ese horario)
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        error: 'Ya existe un horario para este anime en este momento' 
      });
    }
    
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// ACTUALIZAR UN HORARIO
// ============================================
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { notification_enabled } = req.body;

    console.log('🔄 Actualizando horario ID:', id);

    const [result] = await db.query(
      `UPDATE schedules 
       SET notification_enabled = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [notification_enabled, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }

    // Obtener el horario actualizado
    const [updatedSchedule] = await db.query(
      `SELECT s.*, a.nombre as anime_nombre 
       FROM schedules s 
       JOIN animes a ON s.anime_id = a.id 
       WHERE s.id = ?`,
      [id]
    );

    console.log('✅ Horario actualizado');
    res.json(updatedSchedule[0]);
  } catch (error) {
    console.error('❌ Error actualizando horario:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// ELIMINAR UN HORARIO
// ============================================
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log('🗑️ Eliminando horario ID:', id);

    const [result] = await db.query(
      'DELETE FROM schedules WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }

    console.log('✅ Horario eliminado');
    res.json({ message: 'Horario eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error eliminando horario:', error);
    res.status(500).json({ error: error.message });
  }
};