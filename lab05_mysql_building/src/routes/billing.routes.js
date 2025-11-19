const express = require('express');
const router = express.Router();
const { createBilling, listBillings, createPayment } = require('../controllers/billing.controller');
const { authMiddleware } = require('../middleware/auth');
const { permit } = require('../middleware/authorization');

// Protected: list billings (pagination for lazy loading)
router.get('/', authMiddleware, listBillings);

// Admin create billing
router.post('/', authMiddleware, permit('Admin'), createBilling);

// Protected: record payment
router.post('/payments', authMiddleware, createPayment);

module.exports = router;
