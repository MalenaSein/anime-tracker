const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const animeRoutes = require('./routes/animeRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const pushRoutes = require('./routes/pushRoutes'); // 🆕 NUEVO
const initDatabase = require('./initDatabase');
const { scheduleNotifications } = require('./jobs/notificationScheduler');

const app = express();

// ============================================
// MIDDLEWARES
// ============================================
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================
// FIX RENDER SLEEP — agregar esto en server.js
// Pegalo junto a las otras rutas (antes del 404)
// ============================================
 
// Endpoint de ping para que UptimeRobot mantenga el servidor despierto
// UptimeRobot lo llama cada 5 minutos gratis → Render nunca duerme
app.get('/ping', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()) + 's'
  });
});

// ============================================
// RUTAS
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Anime Tracker funcionando',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      animes: '/api/animes',
      schedules: '/api/schedules',
      push: '/api/push' // 🆕 NUEVO
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/animes', animeRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/push', pushRoutes); // 🆕 NUEVO

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ============================================
// MANEJO DE ERRORES GLOBAL
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// ============================================
// INICIAR EL SERVIDOR
// ============================================
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // 1. Crear tablas si no existen
    await initDatabase();
    
    // 2. Iniciar el scheduler de notificaciones 🆕 NUEVO
    scheduleNotifications();
    
    // 3. Iniciar servidor
    app.listen(PORT, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════╗');
      console.log('🚀 Servidor corriendo en puerto', PORT);
      console.log('🔗 URL:', `http://localhost:${PORT}`);
      console.log('📧 Sistema de notificaciones: ACTIVO'); // 🆕 NUEVO
      console.log('╚═══════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('💥 Error fatal al iniciar:', error);
    process.exit(1);
  }
}

startServer();