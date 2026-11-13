const cron = require('node-cron');
const db = require('../config/database');
const { sendEpisodeNotification } = require('../services/pushNotificationService');

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Evita notificar dos veces si dos ejecuciones del cron se solapan
const notifiedKeys = new Set();

// ============================================
// SCHEDULER DE NOTIFICACIONES
// ============================================
// Se ejecuta CADA MINUTO para verificar si hay episodios en este momento

const scheduleNotifications = () => {
  cron.schedule('* * * * *', async () => {
    try {
      // Obtener hora actual en Argentina (UTC-3)
      const now = new Date();
      const argentinaTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));

      // Convertir día de la semana (Domingo=0 -> Domingo=6)
      const currentDay = (argentinaTime.getDay() + 6) % 7; // Lunes=0, Domingo=6
      const currentHour = argentinaTime.getHours();
      const currentMinute = argentinaTime.getMinutes();

      console.log(`🕐 Son las ${currentHour}:${currentMinute.toString().padStart(2, '0')} (Argentina) - Verificando horarios...`);

      const [schedulesToNotify] = await db.query(
        `SELECT s.*, a.nombre as anime_nombre, u.email as user_email
         FROM schedules s
         JOIN animes a ON s.anime_id = a.id
         JOIN usuarios u ON s.user_id = u.id
         WHERE s.day = ?
         AND s.hour = ?
         AND s.minute = ?
         AND s.notification_enabled = true`,
        [currentDay, currentHour, currentMinute]
      );

      if (schedulesToNotify.length > 0) {
        console.log(`📧 ¡Encontrados ${schedulesToNotify.length} episodio(s) para notificar!`);

        for (const schedule of schedulesToNotify) {
          const dedupeKey = `${schedule.id}-${currentDay}-${currentHour}-${currentMinute}`;
          if (notifiedKeys.has(dedupeKey)) continue;

          const episodeTime = `${days[schedule.day]} ${schedule.hour.toString().padStart(2, '0')}:${schedule.minute.toString().padStart(2, '0')}`;

          try {
            await sendEpisodeNotification(
              schedule.user_email,
              schedule.anime_nombre,
              episodeTime
            );
            notifiedKeys.add(dedupeKey);
            console.log(`✅ Notificación enviada para: ${schedule.anime_nombre}`);
          } catch (error) {
            console.error(`❌ Error enviando notificación para ${schedule.anime_nombre}:`, error.message);
          }
        }
      }

      // Limpiar claves viejas para no crecer indefinidamente
      if (notifiedKeys.size > 1000) {
        notifiedKeys.clear();
      }

    } catch (error) {
      console.error('❌ Error en el scheduler de notificaciones:', error);
    }
  });

  console.log('📧 Scheduler de notificaciones iniciado (se ejecuta cada minuto)');
};

module.exports = { scheduleNotifications };