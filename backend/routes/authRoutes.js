const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// PUT /api/auth/username — Cambiar nombre de usuario (autenticado)
router.put('/username', authMiddleware, authController.changeUsername);

// DELETE /api/auth/account — Eliminar cuenta (autenticado)
router.delete('/account', authMiddleware, authController.deleteAccount);

// ── Recuperación con PIN ──────────────────────────────────────

// POST /api/auth/check-recovery — Verificar si email existe y tiene PIN
router.post('/check-recovery', authController.checkRecovery);

// POST /api/auth/reset-password-pin — Cambiar contraseña usando el PIN
router.post('/reset-password-pin', authController.resetPasswordWithPin);

// POST /api/auth/setup-pin — Crear PIN (usuarios sin PIN, una sola vez, requiere usuario+email)
router.post('/setup-pin', authController.setupPin);

// PUT /api/auth/change-pin — Cambiar PIN desde perfil (autenticado)
router.put('/change-pin', authMiddleware, authController.changePin);

module.exports = router;