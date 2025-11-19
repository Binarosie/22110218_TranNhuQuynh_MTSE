const { Billing, Payment } = require('../models');

const createBilling = async (req, res) => {
    try {
        const { apartmentId, description, amount, dueDate } = req.body;
        const billing = await Billing.create({
            apartmentId,
            description,
            amount,
            dueDate
        });
        res.status(201).json({
            success: true,
            message: 'Billing created',
            data: billing
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const listBillings = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const result = await Billing.findAndCountAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: ['apartment']
        });
        res.json({
            success: true,
            data: result.rows,
            total: result.count,
            page: parseInt(page),
            pages: Math.ceil(result.count / limit)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createPayment = async (req, res) => {
    try {
        const { billingId, amount, method } = req.body;
        const payment = await Payment.create({
            billingId,
            amount,
            method
        });

        // Update billing status if fully paid
        const billing = await Billing.findByPk(billingId);
        const totalPaid = await Payment.sum('amount', { where: { billingId } });
        if (totalPaid >= billing.amount) {
            billing.status = 'paid';
            await billing.save();
        }

        res.status(201).json({
            success: true,
            message: 'Payment recorded',
            data: payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { createBilling, listBillings, createPayment };
