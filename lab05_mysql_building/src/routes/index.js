const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const blockRoutes = require('./block.routes');
const buildingRoutes = require('./building.routes');
const facilityRoutes = require('./facility.routes');
const apartmentRoutes = require('./apartment.routes');
const floorRoutes = require('./floor.routes');
const rentalRoutes = require('./rental.routes');
const cartRoutes = require('./cart.routes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/blocks', blockRoutes);
router.use('/buildings', buildingRoutes);
router.use('/facilities', facilityRoutes);
router.use('/apartments', apartmentRoutes);
router.use('/floors', floorRoutes);
router.use('/rental', rentalRoutes);
router.use('/cart', cartRoutes);

router.get('/', (req, res) => res.json({ message: 'API root' }));

module.exports = router;