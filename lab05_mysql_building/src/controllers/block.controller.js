const { Block, Building, Floor } = require('../models');

const listBlocks = async (req, res) => {
    try {
        const { page = 1, pageSize = 20, buildingId } = req.query;
        const offset = (page - 1) * pageSize;
        const where = {};
        if (buildingId) where.buildingId = buildingId;
        
        const result = await Block.findAndCountAll({
            where,
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            include: [{ model: Building, as: 'building' }],
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            success: true,
            data: result.rows,
            total: result.count,
            page: parseInt(page),
            pages: Math.ceil(result.count / pageSize)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createBlock = async (req, res) => {
    try {
        const { name, buildingId } = req.body;
        const block = await Block.create({ name, buildingId });
        res.status(201).json({ success: true, data: block });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getBlockById = async (req, res) => {
    try {
        const { id } = req.params;
        const block = await Block.findByPk(id, {
            include: [
                { model: Building, as: 'building' },
                { model: Floor, as: 'floors' }
            ]
        });
        if (!block) return res.status(404).json({ success: false, message: 'Block not found' });
        res.json({ success: true, data: block });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, buildingId } = req.body;
        const block = await Block.findByPk(id);
        if (!block) return res.status(404).json({ success: false, message: 'Block not found' });
        
        if (name !== undefined) block.name = name;
        if (buildingId !== undefined) block.buildingId = buildingId;
        await block.save();
        
        res.json({ success: true, message: 'Block updated', data: block });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const block = await Block.findByPk(id);
        if (!block) return res.status(404).json({ success: false, message: 'Block not found' });
        
        await block.destroy();
        res.json({ success: true, message: 'Block deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { listBlocks, createBlock, getBlockById, updateBlock, deleteBlock };