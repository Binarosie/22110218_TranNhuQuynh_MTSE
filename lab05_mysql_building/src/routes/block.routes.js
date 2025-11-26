const express = require('express');
const router = express.Router();
const { listBlocks, createBlock, getBlockById, updateBlock, deleteBlock } = require('../controllers/block.controller');
const { authMiddleware, adminMiddleware, managerMiddleware } = require('../middleware/auth');

// Public route - list blocks (for dropdown data)
router.get('/', listBlocks);

// Protected routes - require authentication  
router.get('/:id', authMiddleware, managerMiddleware, getBlockById);

// Admin only routes
router.post('/', authMiddleware, adminMiddleware, createBlock);
router.put('/:id', authMiddleware, adminMiddleware, updateBlock);
router.delete('/:id', authMiddleware, adminMiddleware, deleteBlock);

module.exports = router;