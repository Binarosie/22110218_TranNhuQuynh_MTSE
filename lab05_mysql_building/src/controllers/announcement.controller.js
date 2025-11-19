const { Announcement } = require('../models');

const createAnnouncement = async (req, res) => {
    try {
        const { title, content, publishedAt, expiresAt } = req.body;
        const announcement = await Announcement.create({
            title,
            content,
            publishedAt: publishedAt || new Date(),
            expiresAt
        });
        res.status(201).json({
            success: true,
            message: 'Announcement created',
            data: announcement
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const listAnnouncements = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        const result = await Announcement.findAndCountAll({
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['publishedAt', 'DESC']]
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

module.exports = { createAnnouncement, listAnnouncements };
