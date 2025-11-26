const express = require('express');
const router = express.Router();
const floorController = require('../controllers/floor.controller');
const { authMiddleware, adminMiddleware, managerMiddleware } = require('../middleware/auth');

// Public routes for authenticated users
router.get('/stats', authMiddleware, floorController.getFloorStats);

// CRUD operations with role-based access
router.get('/', authMiddleware, floorController.listFloors);
router.get('/:id', authMiddleware, floorController.getFloorById);

// Admin and Manager only operations
router.post('/', managerMiddleware, floorController.createFloor);
router.put('/:id', managerMiddleware, floorController.updateFloor);
router.delete('/:id', adminMiddleware, floorController.deleteFloor);

module.exports = router;