// ============================================
// SISTEMA DE NOTIFICACIONES PUSH PWA
// ============================================
// Este archivo reemplaza emailService.js
// Usa Web Push API en vez de SMTP

const webpush = require('web-push');
const db = require('../config/database');

// ============================================
// CONFIGURACIÓN DE WEB PUSH
// ============================================

// Generar VAPID keys (una sola vez):
// npx web-push generate-vapid-keys
// Guardar en .env:
// VAPID_PUBLIC_KEY=...
// VAPID_PRIVATE_KEY=...
// VAPID_EMAIL=mailto:tu@email.com

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.warn('⚠️ VAPID keys no configuradas. Las notificaciones push no funcionarán.');
  console.warn('   Ejecuta: npx web-push generate-vapid-keys');
} else {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@animetracker.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log('✅ Web Push configurado correctamente');
}

// ============================================
// GUARDAR SUSCRIPCIÓN DE USUARIO
// ============================================
const saveSubscription = async (userId, subscription) => {
  try {
    // Guardar en DB (necesitarás crear esta tabla)
    await db.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, created_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE 
         user_id = VALUES(user_id),
         endpoint = VALUES(endpoint),
         p256dh = VALUES(p256dh),
         auth = VALUES(auth),
         updated_at = NOW()`,
      [
        userId,
        subscription.endpoint,
        subscription.keys.p256dh,
        subscription.keys.auth
      ]
    );
    console.log('✅ Suscripción guardada para usuario:', userId);
    return true;
  } catch (error) {
    console.error('❌ Error guardando suscripción:', error);
    throw error;
  }
};

// ============================================
// ENVIAR NOTIFICACIÓN DE EPISODIO
// ============================================
const sendEpisodeNotification = async (userEmail, animeName, episodeTime) => {
  try {
    // Buscar suscripciones del usuario
    const [user] = await db.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [userEmail]
    );
    
    if (user.length === 0) {
      console.log('⚠️ Usuario no encontrado:', userEmail);
      return false;
    }

    const [subscriptions] = await db.query(
      'SELECT * FROM push_subscriptions WHERE user_id = ?',
      [user[0].id]
    );

    if (subscriptions.length === 0) {
      console.log('⚠️ Usuario no tiene suscripciones push:', userEmail);
      return false;
    }

    // Payload de la notificación.
    // No enviamos icon/badge porque el Service Worker ya los resuelve
    // usando el base path correcto del deploy.
    const payload = JSON.stringify({
      title: '🎬 Nuevo episodio!',
      body: `${animeName} - ${episodeTime}`,
      tag: `anime-${animeName}`,
      data: {
        anime: animeName,
        time: episodeTime
      },
      actions: [
        { action: 'open', title: 'Ver ahora' },
        { action: 'dismiss', title: 'Cerrar' }
      ]
    });

    // Enviar a todas las suscripciones del usuario
    let successCount = 0;
    let errorCount = 0;

    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        await webpush.sendNotification(pushSubscription, payload);
        successCount++;
        console.log(`✅ Notificación enviada: ${animeName}`);

      } catch (error) {
        errorCount++;
        console.error('❌ Error enviando notificación:', error.message);

        // Si la suscripción expiró, eliminarla
        if (error.statusCode === 410 || error.statusCode === 404) {
          await db.query('DELETE FROM push_subscriptions WHERE id = ?', [sub.id]);
          console.log('🗑️ Suscripción expirada eliminada');
        }
      }
    }

    console.log(`📊 Notificaciones: ${successCount} enviadas, ${errorCount} fallidas`);
    return successCount > 0;

  } catch (error) {
    console.error('❌ Error en sendEpisodeNotification:', error);
    return false;
  }
};

module.exports = {
  sendEpisodeNotification,
  saveSubscription
};