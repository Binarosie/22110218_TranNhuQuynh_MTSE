const express = require('express');
const router = express.Router();
const apartmentController = require('../controllers/apartment.controller');
const { authMiddleware, adminMiddleware, managerMiddleware } = require('../middleware/auth');

// Public routes for authenticated users
router.get('/stats', authMiddleware, apartmentController.getApartmentStats);

// CRUD operations with role-based access
router.get('/', authMiddleware, apartmentController.listApartments);
router.get('/:id', authMiddleware, apartmentController.getApartmentById);

// Admin and Manager only operations
router.post('/', managerMiddleware, apartmentController.createApartment);
router.put('/:id', managerMiddleware, apartmentController.updateApartment);
router.delete('/:id', adminMiddleware, apartmentController.deleteApartment);

// Tenant management operations
router.post('/:id/assign-tenant', managerMiddleware, apartmentController.assignTenant);
router.post('/:id/remove-tenant', managerMiddleware, apartmentController.removeTenant);

module.exports = router;