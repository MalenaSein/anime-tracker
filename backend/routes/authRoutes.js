const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/me — datos canónicos del usuario autenticado
router.get('/me', authMiddleware, authController.getMe);

// PUT /api/auth/username — Cambiar nombre de usuario (autenticado)
router.put('/username', authMiddleware, authController.changeUsername);

// DELETE /api/auth/account — Eliminar cuenta (autenticado)
router.delete('/account', authMiddleware, authController.deleteAccount);

module.exports = router;