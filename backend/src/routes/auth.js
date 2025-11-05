const express = require('express');
const { login } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Ruta pública para iniciar sesión
router.post('/login', login);

// NOTA: La ruta GET /me no estaba definida en tu controlador 'authController',
// por lo que la he omitido para evitar errores. Si la necesitas,
// primero debes crear la función 'getCurrentUser' en 'authController.js'.

module.exports = router;