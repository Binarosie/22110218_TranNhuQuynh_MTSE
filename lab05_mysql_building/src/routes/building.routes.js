const express = require('express');
const router = express.Router();
const { createBuilding, listBuildings } = require('../controllers/building.controller');
const { authMiddleware } = require('../middleware/auth');
const { permit } = require('../middleware/authorization');

router.get('/', authMiddleware, listBuildings);
router.post('/', authMiddleware, permit('Admin','Manager'), createBuilding);

module.exports = router;
