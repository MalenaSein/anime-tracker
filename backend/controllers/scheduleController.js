const db = require('../config/database');
const { toInteger, isValidMinute } = require('../utils/validation');

// ============================================
// OBTENER TODOS LOS HORARIOS DE UN USUARIO
// ============================================
exports.getSchedules = async (req, res) => {
  try {
    const userId = req.user.id;

    const [schedules] = await db.query(
      `SELECT s.*, a.nombre as anime_nombre
       FROM schedules s
       JOIN animes a ON s.anime_id = a.id
       WHERE s.user_id = ?
       ORDER BY s.day, s.hour, s.minute`,
      [userId]
    );

    res.json(schedules);
  } catch (error) {
    console.error('❌ Error obteniendo horarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ============================================
// CREAR UN NUEVO HORARIO
// ============================================
exports.createSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      anime_id,
      day,
      hour,
      minute = 0,
      notification_enabled = true
    } = req.body;

    const animeId = toInteger(anime_id);
    const dayNumber = toInteger(day);
    const hourNumber = toInteger(hour);
    const minuteNumber = toInteger(minute);

    if (animeId === null || animeId <= 0) {
      return res.status(400).json({ error: 'Anime inválido' });
    }
    if (dayNumber === null || dayNumber < 0 || dayNumber > 6) {
      return res.status(400).json({ error: 'El día debe estar entre 0 (lunes) y 6 (domingo)' });
    }
    if (hourNumber === null || hourNumber < 0 || hourNumber > 23) {
      return res.status(400).json({ error: 'La hora debe estar entre 0 y 23' });
    }
    if (minuteNumber === null || !isValidMinute(minuteNumber)) {
      return res.status(400).json({ error: 'Los minutos deben ser 0, 15, 30 o 45' });
    }
    if (typeof notification_enabled !== 'boolean') {
      return res.status(400).json({ error: 'notification_enabled debe ser booleano' });
    }

    const [animeCheck] = await db.query(
      'SELECT id FROM animes WHERE id = ? AND user_id = ?',
      [animeId, userId]
    );

    if (animeCheck.length === 0) {
      return res.status(404).json({ error: 'Anime no encontrado' });
    }

    const [result] = await db.query(
      `INSERT INTO schedules (user_id, anime_id, day, hour, minute, notification_enabled)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, animeId, dayNumber, hourNumber, minuteNumber, notification_enabled]
    );

    const [newSchedule] = await db.query(
      `SELECT s.*, a.nombre as anime_nombre
       FROM schedules s
       JOIN animes a ON s.anime_id = a.id
       WHERE s.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newSchedule[0]);
  } catch (error) {
    console.error('❌ Error creando horario:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        error: 'Ya existe un horario para este anime en este momento'
      });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
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

    const scheduleId = toInteger(id);
    if (scheduleId === null) {
      return res.status(400).json({ error: 'ID de horario inválido' });
    }
    if (typeof notification_enabled !== 'boolean') {
      return res.status(400).json({ error: 'notification_enabled debe ser booleano' });
    }

    const [result] = await db.query(
      `UPDATE schedules
       SET notification_enabled = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [notification_enabled, scheduleId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }

    const [updatedSchedule] = await db.query(
      `SELECT s.*, a.nombre as anime_nombre
       FROM schedules s
       JOIN animes a ON s.anime_id = a.id
       WHERE s.id = ?`,
      [scheduleId]
    );

    res.json(updatedSchedule[0]);
  } catch (error) {
    console.error('❌ Error actualizando horario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ============================================
// ELIMINAR UN HORARIO
// ============================================
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const scheduleId = toInteger(id);
    if (scheduleId === null) {
      return res.status(400).json({ error: 'ID de horario inválido' });
    }

    const [result] = await db.query(
      'DELETE FROM schedules WHERE id = ? AND user_id = ?',
      [scheduleId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }

    res.json({ message: 'Horario eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error eliminando horario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};