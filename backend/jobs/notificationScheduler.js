const cron = require('node-cron');
const db = require('../config/database');
const { sendEpisodeNotification } = require('../services/emailService');

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// ============================================
// SCHEDULER DE NOTIFICACIONES
// ============================================
// Se ejecuta CADA MINUTO para verificar si hay episodios próximos

const scheduleNotifications = () => {
  // Formato de cron: '* * * * *' = cada minuto
  // * = minuto
  // * = hora
  // * = día del mes
  // * = mes
  // * = día de la semana
  
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // Convertir día de la semana (Domingo=0 -> Domingo=6)
      const currentDay = (now.getDay() + 6) % 7; // Lunes=0, Domingo=6
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // 🆕 Calcular la hora y minuto siguiente (en 1 minuto)
      let nextMinute = currentMinute + 1;
      let nextHour = currentHour;
      let nextDay = currentDay;
      
      if (nextMinute === 60) {
        nextMinute = 0;
        nextHour = (currentHour + 1) % 24;
        if (nextHour === 0) {
          nextDay = (currentDay + 1) % 7;
        }
      }
      
      // 🆕 Solo buscar horarios que coincidan con el minuto exacto siguiente
      // Por ejemplo, si son 13:29, buscar episodios para 13:30
      // Si son 13:14, buscar episodios para 13:15
      
      console.log(`🕐 Son las ${currentHour}:${currentMinute.toString().padStart(2, '0')} - Verificando horarios para las ${nextHour}:${nextMinute.toString().padStart(2, '0')}...`);
      
      // Buscar horarios para la siguiente hora y minuto exactos
      const [schedulesToNotify] = await db.query(
        `SELECT s.*, a.nombre as anime_nombre, u.email as user_email
         FROM schedules s
         JOIN animes a ON s.anime_id = a.id
         JOIN usuarios u ON s.user_id = u.id
         WHERE s.day = ? 
         AND s.hour = ?
         AND s.minute = ?
         AND s.notification_enabled = true`,
        [nextDay, nextHour, nextMinute]
      );
      
      if (schedulesToNotify.length > 0) {
        console.log(`📧 ¡Encontrados ${schedulesToNotify.length} episodio(s) para notificar!`);
        
        for (const schedule of schedulesToNotify) {
          const episodeTime = `${days[schedule.day]} ${schedule.hour.toString().padStart(2, '0')}:${schedule.minute.toString().padStart(2, '0')}`;
          
          try {
            await sendEpisodeNotification(
              schedule.user_email,
              schedule.anime_nombre,
              episodeTime
            );
            console.log(`✅ Email enviado para: ${schedule.anime_nombre}`);
          } catch (error) {
            console.error(`❌ Error enviando email para ${schedule.anime_nombre}:`, error.message);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Error en el scheduler de notificaciones:', error);
    }
  });

  console.log('📧 Scheduler de notificaciones iniciado (se ejecuta cada minuto)');
};

module.exports = { scheduleNotifications };