const express = require('express');
const router = express.Router();
const { createFacility, listFacilities, getFacilityById, updateFacility, deleteFacility, createBooking, listBookings, cancelBooking } = require('../controllers/facility.controller');
const { authMiddleware, adminMiddleware, managerMiddleware } = require('../middleware/auth');

// Public route for dropdown data
router.get('/', listFacilities);

// Protected routes
router.use(authMiddleware);

// Manager and Admin routes
router.get('/bookings', managerMiddleware, listBookings);
router.get('/:id', managerMiddleware, getFacilityById);

// Admin only routes
router.post('/', adminMiddleware, createFacility);
router.put('/:id', adminMiddleware, updateFacility);
router.delete('/:id', adminMiddleware, deleteFacility);

// Booking routes (residents can book)
router.post('/bookings', createBooking);
router.put('/bookings/:id/cancel', cancelBooking);

module.exports = router;
