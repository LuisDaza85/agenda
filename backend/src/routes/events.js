const express = require('express');
const { createEvent, getAllEvents, updateEvent, deleteEvent } = require('../controllers/eventsController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Todas las rutas de aquí para abajo están protegidas
router.use(protect);

router.get('/', getAllEvents);
router.post('/', restrictTo('SUPERADMIN', 'UNITADMIN'), createEvent);
router.put('/:id', restrictTo('SUPERADMIN', 'UNITADMIN'), updateEvent);
router.delete('/:id', restrictTo('SUPERADMIN', 'UNITADMIN'), deleteEvent);

module.exports = router;