const { Building, Block } = require('../models');

const createBuilding = async (req, res) => {
  try {
    const { name, address, description } = req.body;
    const b = await Building.create({ name, address, description });
    res.status(201).json({ success: true, data: b });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const listBuildings = async (req, res) => {
  try {
    const buildings = await Building.findAll();
    res.json({ success: true, data: buildings });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { createBuilding, listBuildings };
