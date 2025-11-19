const express = require('express');
const router = express.Router();
const { createFacility, listFacilities, createBooking, listBookings } = require('../controllers/facility.controller');
const { authMiddleware } = require('../middleware/auth');
const { permit } = require('../middleware/authorization');

// Public: list facilities
router.get('/', listFacilities);

// Protected: create facility (admin/building manager only)
router.post('/', authMiddleware, permit('Admin', 'Building Manager'), createFacility);

// Protected: manage bookings
router.get('/bookings', authMiddleware, listBookings);
router.post('/bookings', authMiddleware, createBooking);

module.exports = router;
