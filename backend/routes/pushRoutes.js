const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { saveSubscription } = require('../services/pushNotificationService');

// ============================================
// RUTAS PARA NOTIFICACIONES PUSH
// ============================================

// POST /api/push/subscribe
// Guardar suscripción push del usuario
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const subscription = req.body;

    console.log('📬 Nueva suscripción push para usuario:', userId);

    await saveSubscription(userId, subscription);

    res.json({ 
      message: 'Suscripción guardada exitosamente',
      success: true 
    });

  } catch (error) {
    console.error('❌ Error guardando suscripción:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/push/unsubscribe
// Eliminar suscripción push del usuario
router.delete('/unsubscribe', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { endpoint } = req.body;

    const db = require('../config/database');
    await db.query(
      'DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?',
      [userId, endpoint]
    );

    console.log('🗑️ Suscripción eliminada para usuario:', userId);

    res.json({ 
      message: 'Suscripción eliminada exitosamente',
      success: true 
    });

  } catch (error) {
    console.error('❌ Error eliminando suscripción:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/push/vapid-public-key
// Obtener clave pública VAPID (necesaria para el frontend)
router.get('/vapid-public-key', (req, res) => {
  res.json({ 
    publicKey: process.env.VAPID_PUBLIC_KEY 
  });
});

module.exports = router;