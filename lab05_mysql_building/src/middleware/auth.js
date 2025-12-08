const jwt = require('jsonwebtoken');
const { User, Role, Position, TokenBlacklist } = require('../models');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Check if token is blacklisted
        const blacklistedToken = await TokenBlacklist.findOne({ 
            where: { token } 
        });

        if (blacklistedToken) {
            return res.status(401).json({
                success: false,
                message: 'Token has been revoked. Please login again.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
            include: [
                { model: Role, as: 'role' },
                { model: Position, as: 'position' }
            ]
        });

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or user deactivated.'
            });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (!req.user.role || req.user.role.name !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required.'
        });
    }

    next();
};

const managerMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (!req.user.role || !['Admin', 'Technician'].includes(req.user.role.name)) {
        return res.status(403).json({
            success: false,
            message: 'Admin or Technician access required.'
        });
    }

    next();
};

// Middleware for technician only
const technicianMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (!req.user.role || !['Admin', 'Technician'].includes(req.user.role.name)) {
        return res.status(403).json({
            success: false,
            message: 'Technician access required.'
        });
    }

    next();
};

// Middleware for user/tenant only
const userMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (!req.user.role || req.user.role.name !== 'User') {
        return res.status(403).json({
            success: false,
            message: 'User access required.'
        });
    }

    next();
};

module.exports = {
    authMiddleware,
    adminMiddleware,
    managerMiddleware,
    technicianMiddleware,
    userMiddleware
};