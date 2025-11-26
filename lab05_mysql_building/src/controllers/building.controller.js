const { Building, Block } = require('../models');

const createBuilding = async (req, res) => {
  try {
    const { name, address, description } = req.body;
    const b = await Building.create({ name, address, description });
    res.status(201).json({ success: true, data: b });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const listBuildings = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const result = await Building.findAndCountAll({ limit: parseInt(limit), offset: parseInt(offset), order: [['createdAt','DESC']] });
    res.json({ success: true, data: result.rows, total: result.count, page: parseInt(page), pages: Math.ceil(result.count / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getBuildingById = async (req, res) => {
  try {
    const { id } = req.params;
    const building = await Building.findByPk(id, { include: ['blocks'] });
    if (!building) return res.status(404).json({ success: false, message: 'Building not found' });
    res.json({ success: true, data: building });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, description } = req.body;
    const building = await Building.findByPk(id);
    if (!building) return res.status(404).json({ success: false, message: 'Building not found' });
    if (name !== undefined) building.name = name;
    if (address !== undefined) building.address = address;
    if (description !== undefined) building.description = description;
    await building.save();
    res.json({ success: true, message: 'Building updated', data: building });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const building = await Building.findByPk(id);
    if (!building) return res.status(404).json({ success: false, message: 'Building not found' });
    await building.destroy();
    res.json({ success: true, message: 'Building deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createBuilding, listBuildings, getBuildingById, updateBuilding, deleteBuilding };
