const express = require('express');
const router = express.Router();
const { createBuilding, listBuildings, getBuildingById, updateBuilding, deleteBuilding, getBuildingOverview } = require('../controllers/building.controller');
const { authMiddleware, adminMiddleware, managerMiddleware } = require('../middleware/auth');

// Public route for dropdown data
router.get('/', listBuildings);

// ⚠️ IMPORTANT: Specific routes MUST come before /:id to avoid Express matching "stats" as an ID
router.get('/stats/overview', authMiddleware, getBuildingOverview);

// Protected routes
router.use(authMiddleware);

// Manager and Admin routes
router.get('/:id', managerMiddleware, getBuildingById);

// Admin only routes
router.post('/', adminMiddleware, createBuilding);
router.put('/:id', adminMiddleware, updateBuilding);
router.delete('/:id', adminMiddleware, deleteBuilding);

module.exports = router;
