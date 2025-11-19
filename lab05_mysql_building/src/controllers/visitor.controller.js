const { Visitor } = require('../models');

const createVisitor = async (req, res) => {
    try {
        const { apartmentId, name, phone, reason } = req.body;
        const visitor = await Visitor.create({
            apartmentId,
            name,
            phone,
            reason,
            checkIn: new Date()
        });
        res.status(201).json({
            success: true,
            message: 'Visitor checked in',
            data: visitor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const listVisitors = async (req, res) => {
    try {
        const visitors = await Visitor.findAll({
            include: ['apartment']
        });
        res.json({
            success: true,
            data: visitors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const checkOutVisitor = async (req, res) => {
    try {
        const { id } = req.params;
        const visitor = await Visitor.findByPk(id);
        if (!visitor) {
            return res.status(404).json({
                success: false,
                message: 'Visitor not found'
            });
        }
        visitor.checkOut = new Date();
        await visitor.save();
        res.json({
            success: true,
            message: 'Visitor checked out',
            data: visitor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { createVisitor, listVisitors, checkOutVisitor };
