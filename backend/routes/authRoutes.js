const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// PUT /api/auth/username  ✨ NUEVO - Cambiar nombre de usuario
router.put('/username', authMiddleware, authController.changeUsername);

// DELETE /api/auth/account  ✨ NUEVO - Eliminar cuenta
router.delete('/account', authMiddleware, authController.deleteAccount);

// POST /api/auth/forgot-password  ✨ NUEVO - Solicitar recuperación
router.post('/forgot-password', authController.requestPasswordReset);

// POST /api/auth/reset-password  ✨ NUEVO - Resetear con token
router.post('/reset-password', authController.resetPassword);

module.exports = router;