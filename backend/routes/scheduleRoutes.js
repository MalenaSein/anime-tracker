const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/authMiddleware');

// ============================================
// RUTAS DE HORARIOS (SCHEDULES)
// ============================================

// TODAS estas rutas requieren autenticación

// GET /api/schedules
// Obtener todos los horarios del usuario
router.get('/', authMiddleware, scheduleController.getSchedules);

// POST /api/schedules
// Crear un nuevo horario
router.post('/', authMiddleware, scheduleController.createSchedule);

// PUT /api/schedules/:id
// Actualizar un horario (activar/desactivar notificaciones)
router.put('/:id', authMiddleware, scheduleController.updateSchedule);

// DELETE /api/schedules/:id
// Eliminar un horario
router.delete('/:id', authMiddleware, scheduleController.deleteSchedule);

module.exports = router;