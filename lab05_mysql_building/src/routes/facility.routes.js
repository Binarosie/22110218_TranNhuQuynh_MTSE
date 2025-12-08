const express = require('express');
const router = express.Router();
const {
    createFacility,
    listFacilities,
    getFacilityById,
    updateFacility,
    deleteFacility,
    createBooking,
    assignTechnician,
    markAsFixed,
    markAsDone,
    listBookings,
    getBookingById,
    getBookingStats
} = require('../controllers/facility.controller');
const { authMiddleware, adminMiddleware, technicianMiddleware, userMiddleware } = require('../middleware/auth');

// Public route for dropdown data
router.get('/', listFacilities);

// Protected routes
router.use(authMiddleware);

// ==================== BOOKING WORKFLOW ====================

// Get booking statistics
router.get('/bookings/stats', getBookingStats);

// List bookings (role-based)
router.get('/bookings', listBookings);

// Get booking detail
router.get('/bookings/:id', getBookingById);

// Step 1: USER creates booking (TODO)
router.post('/bookings', userMiddleware, createBooking);

// Step 2: ADMIN assigns technician (TODO → PENDING)
router.post('/bookings/:id/assign', adminMiddleware, assignTechnician);

// Step 3: TECHNICIAN marks as fixed (PENDING → FIXED)
router.post('/bookings/:id/fixed', technicianMiddleware, markAsFixed);

// Step 4: USER confirms done (FIXED → DONE)
router.post('/bookings/:id/done', userMiddleware, markAsDone);

// ==================== FACILITY CRUD (Admin only) ====================
router.post('/', adminMiddleware, createFacility);
router.get('/:id', adminMiddleware, getFacilityById);
router.put('/:id', adminMiddleware, updateFacility);
router.delete('/:id', adminMiddleware, deleteFacility);

module.exports = router;
