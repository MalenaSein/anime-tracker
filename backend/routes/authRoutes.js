const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

// POST /api/auth/register
// Registra un nuevo usuario
router.post('/register', authController.register);

// POST /api/auth/login  
// Inicia sesión
router.post('/login', authController.login);

// Exportamos el router para usarlo en server.js
module.exports = router;