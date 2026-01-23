const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const animeRoutes = require('./routes/animeRoutes');
const initDatabase = require('./initDatabase'); // 👈 NUEVO

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
// RUTAS
// ============================================
app.get('/', (req, res) => {
  res.json({ 
    message: '🎌 API de Anime Tracker funcionando',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      animes: '/api/animes'
    }
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/animes', animeRoutes);

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

// 👇 PRIMERO inicializamos la base de datos, LUEGO iniciamos el servidor
async function startServer() {
  try {
    // Crear tablas si no existen
    await initDatabase();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════╗');
      console.log('🚀 Servidor corriendo en puerto', PORT);
      console.log('🔗 URL:', `http://localhost:${PORT}`);
      console.log('╚═══════════════════════════════════════╝');
      console.log('');
    });
  } catch (error) {
    console.error('💥 Error fatal al iniciar:', error);
    process.exit(1);
  }
}

startServer();