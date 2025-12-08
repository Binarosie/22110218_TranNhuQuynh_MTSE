const { Apartment, Floor, Block, Building, User } = require('../models');
const { Op } = require('sequelize');

const listApartments = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, search, status, blockId, floorId } = req.query;
    const offset = (page - 1) * pageSize;
    const where = {};
    
    // Search by apartment number
    if (search) {
      where.number = { [Op.like]: `%${search}%` };
    }
    
    // Filter by status
    if (status) {
      where.status = status;
    }
    
    // Filter by floor
    if (floorId) {
      where.floorId = floorId;
    }
    
    // Filter by block (need to join with floor)
    const include = [
      { 
        model: Floor, 
        as: 'floor',
        include: [{ model: Block, as: 'block', include: [{ model: Building, as: 'building' }] }],
        ...(blockId && { where: { blockId } })
      },
      { 
        model: User, 
        as: 'tenant',
        required: false,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
      }
    ];
    
    const result = await Apartment.findAndCountAll({ 
      where, 
      include,
      limit: parseInt(pageSize), 
      offset: parseInt(offset), 
      order: [['number', 'ASC']]
    });
    
    res.json({ 
      success: true, 
      data: result.rows, 
      total: result.count, 
      page: parseInt(page), 
      pages: Math.ceil(result.count / pageSize) 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createApartment = async (req, res) => {
  try {
    const { number, floorId, area, monthlyRent } = req.body;
    const apartment = await Apartment.create({ number, floorId, area, monthlyRent });
    
    const apartmentWithDetails = await Apartment.findByPk(apartment.id, {
      include: [
        { 
          model: Floor, 
          as: 'floor',
          include: [{ model: Block, as: 'block', include: [{ model: Building, as: 'building' }] }]
        }
      ]
    });
    
    res.status(201).json({ success: true, message: 'Apartment created successfully', data: apartmentWithDetails });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getApartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const apartment = await Apartment.findByPk(id, {
      include: [
        { 
          model: Floor, 
          as: 'floor',
          include: [{ model: Block, as: 'block', include: [{ model: Building, as: 'building' }] }]
        },
        { 
          model: User, 
          as: 'tenant',
          required: false,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ]
    });
    
    if (!apartment) return res.status(404).json({ success: false, message: 'Apartment not found' });
    res.json({ success: true, data: apartment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateApartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { number, floorId, area, status, tenantId, monthlyRent, leaseStartDate, leaseEndDate } = req.body;
    
    const apartment = await Apartment.findByPk(id);
    if (!apartment) return res.status(404).json({ success: false, message: 'Apartment not found' });
    
    // Update fields
    if (number !== undefined) apartment.number = number;
    if (floorId !== undefined) apartment.floorId = floorId;
    if (area !== undefined) apartment.area = area;
    if (status !== undefined) apartment.status = status;
    if (tenantId !== undefined) apartment.tenantId = tenantId;
    if (monthlyRent !== undefined) apartment.monthlyRent = monthlyRent;
    if (leaseStartDate !== undefined) apartment.leaseStartDate = leaseStartDate;
    if (leaseEndDate !== undefined) apartment.leaseEndDate = leaseEndDate;
    
    await apartment.save();
    
    const updatedApartment = await Apartment.findByPk(id, {
      include: [
        { 
          model: Floor, 
          as: 'floor',
          include: [{ model: Block, as: 'block', include: [{ model: Building, as: 'building' }] }]
        },
        { 
          model: User, 
          as: 'tenant',
          required: false,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ]
    });
    
    res.json({ success: true, message: 'Apartment updated successfully', data: updatedApartment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteApartment = async (req, res) => {
  try {
    const { id } = req.params;
    const apartment = await Apartment.findByPk(id);
    if (!apartment) return res.status(404).json({ success: false, message: 'Apartment not found' });
    
    // Check if apartment is occupied
    if (apartment.status === 'occupied') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete occupied apartment. Please move tenant first.' 
      });
    }
    
    await apartment.destroy();
    res.json({ success: true, message: 'Apartment deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Assign tenant to apartment
const assignTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId, leaseStartDate, leaseEndDate, monthlyRent } = req.body;
    
    const apartment = await Apartment.findByPk(id);
    if (!apartment) return res.status(404).json({ success: false, message: 'Apartment not found' });
    
    if (apartment.status === 'occupied') {
      return res.status(400).json({ success: false, message: 'Apartment is already occupied' });
    }
    
    // Verify tenant exists and is a tenant role
    const tenant = await User.findByPk(tenantId, { include: [{ model: require('../models').Role, as: 'role' }] });
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
    
    apartment.tenantId = tenantId;
    apartment.status = 'occupied';
    apartment.leaseStartDate = leaseStartDate;
    apartment.leaseEndDate = leaseEndDate;
    if (monthlyRent) apartment.monthlyRent = monthlyRent;
    
    await apartment.save();
    
    const updatedApartment = await Apartment.findByPk(id, {
      include: [
        { 
          model: Floor, 
          as: 'floor',
          include: [{ model: Block, as: 'block', include: [{ model: Building, as: 'building' }] }]
        },
        { 
          model: User, 
          as: 'tenant',
          required: false,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ]
    });
    
    res.json({ success: true, message: 'Tenant assigned successfully', data: updatedApartment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Remove tenant from apartment
const removeTenant = async (req, res) => {
  try {
    const { id } = req.params;
    
    const apartment = await Apartment.findByPk(id);
    if (!apartment) return res.status(404).json({ success: false, message: 'Apartment not found' });
    
    apartment.tenantId = null;
    apartment.status = 'vacant';
    apartment.leaseStartDate = null;
    apartment.leaseEndDate = null;
    
    await apartment.save();
    
    const updatedApartment = await Apartment.findByPk(id, {
      include: [
        { 
          model: Floor, 
          as: 'floor',
          include: [{ model: Block, as: 'block', include: [{ model: Building, as: 'building' }] }]
        }
      ]
    });
    
    res.json({ success: true, message: 'Tenant removed successfully', data: updatedApartment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get apartment statistics
const getApartmentStats = async (req, res) => {
  try {
    const [totalApartments, occupiedApartments, vacantApartments, maintenanceApartments] = await Promise.all([
      Apartment.count(),
      Apartment.count({ where: { status: 'occupied' } }),
      Apartment.count({ where: { status: 'vacant' } }),
      Apartment.count({ where: { status: 'maintenance' } })
    ]);
    
    res.json({
      success: true,
      data: {
        totalApartments,
        occupiedApartments,
        vacantApartments,
        maintenanceApartments,
        occupancyRate: totalApartments > 0 ? ((occupiedApartments / totalApartments) * 100).toFixed(2) : 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Public API: Get all vacant apartments
const getVacantApartments = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, blockId, floorId, minArea, maxArea, minRent, maxRent } = req.query;
    const offset = (page - 1) * pageSize;
    
    const where = { status: 'vacant' };
    
    // Filter by floor
    if (floorId) {
      where.floorId = floorId;
    }
    
    // Filter by area range
    if (minArea) {
      where.area = { ...where.area, [Op.gte]: parseFloat(minArea) };
    }
    if (maxArea) {
      where.area = { ...where.area, [Op.lte]: parseFloat(maxArea) };
    }
    
    // Filter by rent range
    if (minRent) {
      where.monthlyRent = { ...where.monthlyRent, [Op.gte]: parseFloat(minRent) };
    }
    if (maxRent) {
      where.monthlyRent = { ...where.monthlyRent, [Op.lte]: parseFloat(maxRent) };
    }
    
    const include = [
      { 
        model: Floor, 
        as: 'floor',
        include: [{ model: Block, as: 'block', include: [{ model: Building, as: 'building' }] }],
        ...(blockId && { where: { blockId } })
      }
    ];
    
    const result = await Apartment.findAndCountAll({ 
      where, 
      include,
      limit: parseInt(pageSize), 
      offset: parseInt(offset), 
      order: [['monthlyRent', 'ASC'], ['number', 'ASC']]
    });
    
    res.json({ 
      success: true, 
      data: result.rows, 
      total: result.count, 
      page: parseInt(page), 
      pages: Math.ceil(result.count / pageSize) 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Public API: Get top10 viewed vacant apartments
const getTopViewedVacantApartments = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const apartments = await Apartment.findAll({
      where: { status: 'vacant' },
      include: [
        { 
          model: Floor, 
          as: 'floor',
          include: [{ model: Block, as: 'block', include: [{ model: Building, as: 'building' }] }]
        }
      ],
      order: [['viewCount', 'DESC'], ['monthlyRent', 'ASC']],
      limit: parseInt(limit)
    });
    
    res.json({ 
      success: true, 
      data: apartments,
      total: apartments.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Public API: Get top10 viewed apartments (all status)
const getTopViewedApartments = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const apartments = await Apartment.findAll({
      include: [
        { 
          model: Floor, 
          as: 'floor',
          include: [{ model: Block, as: 'block', include: [{ model: Building, as: 'building' }] }]
        },
        { 
          model: User, 
          as: 'tenant',
          required: false,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ],
      order: [['viewCount', 'DESC'], ['number', 'ASC']],
      limit: parseInt(limit)
    });
    
    res.json({ 
      success: true, 
      data: apartments,
      total: apartments.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { 
  listApartments, 
  createApartment, 
  getApartmentById, 
  updateApartment, 
  deleteApartment,
  assignTenant,
  removeTenant,
  getApartmentStats,
  getVacantApartments,
  getTopViewedVacantApartments,
  getTopViewedApartments
};
