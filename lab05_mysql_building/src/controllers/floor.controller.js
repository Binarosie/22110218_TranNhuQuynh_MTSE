const { Floor, Block, Building, Apartment } = require('../models');
const { Op } = require('sequelize');

const listFloors = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, blockId } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};
    
    if (blockId) {
      where.blockId = blockId;
    }
    
    const result = await Floor.findAndCountAll({
      where,
      include: [
        { 
          model: Block, 
          as: 'block',
          include: [{ model: Building, as: 'building' }]
        },
        {
          model: Apartment,
          as: 'apartments',
          required: false
        }
      ],
      limit: parseInt(pageSize),
      offset: parseInt(offset),
      order: [['number', 'ASC']]
    });
    
    // Add apartment counts to each floor
    const floorsWithStats = result.rows.map(floor => {
      const floorData = floor.toJSON();
      floorData.apartmentCount = floorData.apartments?.length || 0;
      floorData.occupiedApartments = floorData.apartments?.filter(apt => apt.status === 'occupied').length || 0;
      return floorData;
    });
    
    res.json({
      success: true,
      data: floorsWithStats,
      total: result.count,
      page: parseInt(page),
      pages: Math.ceil(result.count / pageSize)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createFloor = async (req, res) => {
  try {
    const { number, blockId } = req.body;
    
    // Check if floor number already exists in the block
    const existingFloor = await Floor.findOne({
      where: { number, blockId }
    });
    
    if (existingFloor) {
      return res.status(400).json({
        success: false,
        message: 'Floor number already exists in this block'
      });
    }
    
    const floor = await Floor.create({ number, blockId });
    
    const floorWithDetails = await Floor.findByPk(floor.id, {
      include: [
        { 
          model: Block, 
          as: 'block',
          include: [{ model: Building, as: 'building' }]
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Floor created successfully',
      data: floorWithDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getFloorById = async (req, res) => {
  try {
    const { id } = req.params;
    const floor = await Floor.findByPk(id, {
      include: [
        { 
          model: Block, 
          as: 'block',
          include: [{ model: Building, as: 'building' }]
        },
        {
          model: Apartment,
          as: 'apartments',
          include: [
            {
              model: require('../models').User,
              as: 'tenant',
              required: false,
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
            }
          ]
        }
      ]
    });
    
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }
    
    res.json({
      success: true,
      data: floor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const updateFloor = async (req, res) => {
  try {
    const { id } = req.params;
    const { number, blockId } = req.body;
    
    const floor = await Floor.findByPk(id);
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }
    
    // Check if floor number already exists in the block (if changing number or block)
    if ((number && number !== floor.number) || (blockId && blockId !== floor.blockId)) {
      const existingFloor = await Floor.findOne({
        where: { 
          number: number || floor.number, 
          blockId: blockId || floor.blockId,
          id: { [Op.ne]: id }
        }
      });
      
      if (existingFloor) {
        return res.status(400).json({
          success: false,
          message: 'Floor number already exists in this block'
        });
      }
    }
    
    if (number !== undefined) floor.number = number;
    if (blockId !== undefined) floor.blockId = blockId;
    
    await floor.save();
    
    const updatedFloor = await Floor.findByPk(id, {
      include: [
        { 
          model: Block, 
          as: 'block',
          include: [{ model: Building, as: 'building' }]
        }
      ]
    });
    
    res.json({
      success: true,
      message: 'Floor updated successfully',
      data: updatedFloor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteFloor = async (req, res) => {
  try {
    const { id } = req.params;
    const floor = await Floor.findByPk(id, {
      include: [{ model: Apartment, as: 'apartments' }]
    });
    
    if (!floor) {
      return res.status(404).json({
        success: false,
        message: 'Floor not found'
      });
    }
    
    // Check if floor has apartments
    if (floor.apartments && floor.apartments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete floor with existing apartments. Please delete apartments first.'
      });
    }
    
    await floor.destroy();
    
    res.json({
      success: true,
      message: 'Floor deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get floor statistics
const getFloorStats = async (req, res) => {
  try {
    const totalFloors = await Floor.count();
    
    const floorsWithApartments = await Floor.findAll({
      include: [
        {
          model: Apartment,
          as: 'apartments',
          required: false
        }
      ]
    });
    
    let totalApartments = 0;
    let occupiedApartments = 0;
    
    floorsWithApartments.forEach(floor => {
      totalApartments += floor.apartments?.length || 0;
      occupiedApartments += floor.apartments?.filter(apt => apt.status === 'occupied').length || 0;
    });
    
    res.json({
      success: true,
      data: {
        totalFloors,
        totalApartments,
        occupiedApartments,
        averageApartmentsPerFloor: totalFloors > 0 ? (totalApartments / totalFloors).toFixed(2) : 0,
        occupancyRate: totalApartments > 0 ? ((occupiedApartments / totalApartments) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  listFloors,
  createFloor,
  getFloorById,
  updateFloor,
  deleteFloor,
  getFloorStats
};