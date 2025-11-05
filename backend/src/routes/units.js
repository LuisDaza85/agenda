const express = require('express');
const { createUnit, getAllUnits, updateUnit, deleteUnit } = require('../controllers/unitsController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas de aquí para abajo están protegidas y solo para SUPERADMIN
router.use(protect, restrictTo('SUPERADMIN'));

router.get('/', getAllUnits);
router.post('/', createUnit);
router.put('/:id', updateUnit);
router.delete('/:id', deleteUnit);

module.exports = router;