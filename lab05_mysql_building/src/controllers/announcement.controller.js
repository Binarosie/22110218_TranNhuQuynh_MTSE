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
        res.status(201).json({ success: true, message: 'Announcement created', data: announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const listAnnouncements = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        const result = await Announcement.findAndCountAll({ limit: parseInt(limit), offset: parseInt(offset), order: [['publishedAt', 'DESC']] });
        res.json({ success: true, data: result.rows, total: result.count, page: parseInt(page), pages: Math.ceil(result.count / limit) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAnnouncementById = async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await Announcement.findByPk(id);
        if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
        res.json({ success: true, data: announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, publishedAt, expiresAt } = req.body;
        const announcement = await Announcement.findByPk(id);
        if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
        if (title !== undefined) announcement.title = title;
        if (content !== undefined) announcement.content = content;
        if (publishedAt !== undefined) announcement.publishedAt = publishedAt;
        if (expiresAt !== undefined) announcement.expiresAt = expiresAt;
        await announcement.save();
        res.json({ success: true, message: 'Announcement updated', data: announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await Announcement.findByPk(id);
        if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
        await announcement.destroy();
        res.json({ success: true, message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createAnnouncement, listAnnouncements, getAnnouncementById, updateAnnouncement, deleteAnnouncement };
