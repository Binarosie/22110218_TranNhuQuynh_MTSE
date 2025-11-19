const { Apartment } = require('../models');

const listApartments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const rows = await Apartment.findAndCountAll({ limit: parseInt(limit), offset: parseInt(offset) });
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createApartment = async (req, res) => {
  try {
    const { number, floorId, area } = req.body;
    const a = await Apartment.create({ number, floorId, area });
    res.status(201).json({ success: true, data: a });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { listApartments, createApartment };
