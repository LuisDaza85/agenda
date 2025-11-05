const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const employeeController = require('../controllers/employeeController');
const { protect, restrictTo } = require('../middleware/auth');

// ✅ Todas las rutas requieren autenticación
router.use(protect);

// ✅ NUEVO: Verificar disponibilidad de carnet (GET antes de POST)
router.get('/check-carnet/:carnet', usersController.checkCarnetAvailability);

// Validar empleado desde API externa de RRHH
router.post('/validate-employee', employeeController.validateEmployee);

// CRUD de usuarios
router.get('/', restrictTo('SUPERADMIN', 'UNITADMIN'), usersController.getAllUsers);
router.get('/unit/:unitId', restrictTo('SUPERADMIN', 'UNITADMIN'), usersController.getUsersByUnit);
router.post('/', restrictTo('SUPERADMIN', 'UNITADMIN'), usersController.createUser);
router.put('/:id', restrictTo('SUPERADMIN', 'UNITADMIN'), usersController.updateUser);
router.delete('/:id', restrictTo('SUPERADMIN', 'UNITADMIN'), usersController.deleteUser);

module.exports = router;