const express = require('express');
const { body, validationResult } = require('express-validator');
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getRoles,
    getPositions,
    listTechnicians
} = require('../controllers/user.controller');
const { authMiddleware, adminMiddleware, managerMiddleware } = require('../middleware/auth');
const { handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Validation middleware
const validateUser = [
    body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
    body('roleId').optional().isInt({ min: 1 }).withMessage('Role ID must be a valid number'),
    body('positionId').optional().isInt({ min: 1 }).withMessage('Position ID must be a valid number')
];

const validateUserUpdate = [
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
    body('roleId').optional().isInt({ min: 1 }).withMessage('Role ID must be a valid number'),
    body('positionId').optional().isInt({ min: 1 }).withMessage('Position ID must be a valid number'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean value')
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors: errors.array()
        });
    }
    next();
};

// Protected routes - require authentication
router.use(authMiddleware);

// Admin only routes for roles and positions
router.get('/roles', adminMiddleware, getRoles);
router.get('/positions', adminMiddleware, getPositions);
router.get('/technicians', adminMiddleware, listTechnicians);

// Manager and Admin routes
router.get('/', managerMiddleware, getAllUsers);
router.get('/:id', managerMiddleware, getUserById);

// Admin only routes
router.post('/', adminMiddleware, handleUploadError, validateUser, handleValidationErrors, createUser);
router.put('/:id', adminMiddleware, handleUploadError, validateUserUpdate, handleValidationErrors, updateUser);
router.delete('/:id', adminMiddleware, deleteUser);
router.patch('/:id/toggle-status', adminMiddleware, toggleUserStatus);

module.exports = router;