const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rental.controller');
const { authMiddleware, userMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// User rent apartment (only for users without apartment)
router.post('/rent', userMiddleware, rentalController.rentApartment);

// Get my apartment
router.get('/my-apartment', userMiddleware, rentalController.getMyApartment);

// Cancel rental (move out)
router.post('/cancel', userMiddleware, rentalController.cancelRental);

// List vacant apartments (with filters, fuzzy search, lazy loading)
router.get('/vacant', rentalController.listVacantApartments);

// Increment view count
router.post('/:id/view', rentalController.incrementViewCount);

module.exports = router;
