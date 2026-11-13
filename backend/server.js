const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// ============================================
// VALIDACIÓN DE VARIABLES DE ENTORNO
// ============================================
const REQUIRED_ENV = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error('💥 Faltan variables de entorno obligatorias:', missingEnv.join(', '));
  console.error('   Revisá backend/.env.example');
  process.exit(1);
}

// JWT_SECRET solo es necesario para los usuarios legacy (token propio).
// Si falta, Firebase sigue funcionando y la app no se cae al arrancar.
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET no configurado. La autenticación JWT legacy quedará deshabilitada.');
}

const authRoutes = require('./routes/authRoutes');
const animeRoutes = require('./routes/animeRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const pushRoutes = require('./routes/pushRoutes');
const initDatabase = require('./initDatabase');
const { scheduleNotifications } = require('./jobs/notificationScheduler');

const app = express();

// Render está detrás de un proxy
app.set('trust proxy', 1);

// ============================================
// MIDDLEWARES
// ============================================
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://malenasein.github.io'
];
const allowedOrigins = (process.env.CORS_ORIGIN || defaultOrigins.join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origen no permitido por CORS'));
  }
}));

app.use(express.json({ limit: '100kb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Intentá nuevamente en unos minutos.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Intentá nuevamente en unos minutos.' }
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================
// HEALTH CHECK
// ============================================
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
      push: '/api/push'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/animes', animeRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/push', pushRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ============================================
// MANEJO DE ERRORES GLOBAL
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);

  if (err.message === 'Origen no permitido por CORS') {
    return res.status(403).json({ error: err.message });
  }

  res.status(500).json({ error: 'Error interno del servidor' });
});

// ============================================
// INICIAR EL SERVIDOR
// ============================================
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await initDatabase();
    scheduleNotifications();

    app.listen(PORT, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════╗');
      console.log('🚀 Servidor corriendo en puerto', PORT);
      console.log('🔗 URL:', `http://localhost:${PORT}`);
      console.log('📧 Sistema de notificaciones: ACTIVO');
      console.log('╚═══════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('💥 Error fatal al iniciar:', error);
    process.exit(1);
  }
}

startServer();