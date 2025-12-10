const { Apartment, Floor, Block, Building, User } = require('../models');
const { Op, fn, col, Sequelize } = require('sequelize');

const listApartments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      buildingId,
      blockId,
      floorId,
      minArea,
      maxArea,
      minRent,
      maxRent,
      sortBy
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // ✅ Status filter (dynamic - all statuses supported)
    if (status && status !== 'all') {
      where.status = status;
    }

    // ✅ Floor filter
    if (floorId) {
      where.floorId = floorId;
    }

    // ✅ Area range
    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area[Op.gte] = parseFloat(minArea);
      if (maxArea) where.area[Op.lte] = parseFloat(maxArea);
    }

    // ✅ Rent range
    if (minRent || maxRent) {
      where.monthlyRent = {};
      if (minRent) where.monthlyRent[Op.gte] = parseFloat(minRent);
      if (maxRent) where.monthlyRent[Op.lte] = parseFloat(maxRent);
    }

    // ✅ Fuzzy search across apartment number, block name, building name (ACCENT + CASE INSENSITIVE)
    if (search && search.trim() !== '') {
      const keyword = search.trim().toLowerCase();
      console.log('🔍 SEARCH KEYWORD:', keyword);

      where[Op.or] = [
        Sequelize.where(
          Sequelize.literal(
            "LOWER(CONVERT(`Apartment`.`number` USING utf8mb4)) COLLATE utf8mb4_general_ci"
          ),
          { [Op.like]: `%${keyword}%` }
        ),
        Sequelize.where(
          Sequelize.literal(
            "LOWER(CONVERT(`floor->block`.`name` USING utf8mb4)) COLLATE utf8mb4_general_ci"
          ),
          { [Op.like]: `%${keyword}%` }
        ),
        Sequelize.where(
          Sequelize.literal(
            "LOWER(CONVERT(`floor->block->building`.`name` USING utf8mb4)) COLLATE utf8mb4_general_ci"
          ),
          { [Op.like]: `%${keyword}%` }
        )
      ];
    }

    // ✅ Dynamic required: only when filtering
    const requireJoin = !!(search || blockId || buildingId);
    const include = [
      {
        model: Floor,
        as: 'floor',
        required: requireJoin,
        include: [
          {
            model: Block,
            as: 'block',
            required: requireJoin,
            ...(blockId && { where: { id: blockId } }),
            include: [
              {
                model: Building,
                as: 'building',
                required: requireJoin,
                ...(buildingId && { where: { id: buildingId } })
              }
            ]
          }
        ]
      },
      { 
        model: User, 
        as: 'tenant',
        required: false,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
      }
    ];

    // ✅ Sắp xếp
    let order = [['createdAt', 'DESC'], ['id', 'ASC']];
    
    switch (sortBy) {
      case 'price_asc':
        order = [['monthlyRent', 'ASC'], ['id', 'ASC']];
        break;
      
      case 'price_desc':
        order = [['monthlyRent', 'DESC'], ['id', 'ASC']];
        break;
      
      case 'newest':
        order = [['createdAt', 'DESC'], ['id', 'ASC']];
        break;
      
      case 'view_desc':
        order = [['viewCount', 'DESC'], ['id', 'ASC']];
        break;
      
      default:
        order = [['createdAt', 'DESC'], ['id', 'ASC']];
    }

    const result = await Apartment.findAndCountAll({
      where,
      include,
      offset: parseInt(offset),
      limit: parseInt(limit),
      order,
      distinct: true // ✅ CRITICAL for correct count with joins
    });

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(limit),
        totalItems: result.count,
        totalPages: Math.ceil(result.count / limit)
      }
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
          required: false,
          include: [
            { 
              model: Block, 
              as: 'block',
              required: false,
              include: [
                { 
                  model: Building, 
                  as: 'building',
                  required: false
                }
              ]
            }
          ]
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
          required: false,
          include: [
            { 
              model: Block, 
              as: 'block',
              required: false,
              include: [
                { 
                  model: Building, 
                  as: 'building',
                  required: false
                }
              ]
            }
          ]
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
    const {
      page = 1,
      limit = 12,
      search,
      buildingId,
      blockId,
      floorId,
      minArea,
      maxArea,
      minRent,
      maxRent,
      sortBy
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    //  ALWAYS vacant - this is the semantic meaning of this endpoint
    where.status = 'vacant';

    //  Floor filter
    if (floorId) {
      where.floorId = floorId;
    }

    //  Area range
    if (minArea || maxArea) {
      where.area = {};
      if (minArea) where.area[Op.gte] = parseFloat(minArea);
      if (maxArea) where.area[Op.lte] = parseFloat(maxArea);
    }

    //  Rent range
    if (minRent || maxRent) {
      where.monthlyRent = {};
      if (minRent) where.monthlyRent[Op.gte] = parseFloat(minRent);
      if (maxRent) where.monthlyRent[Op.lte] = parseFloat(maxRent);
    }

    //  Fuzzy search across apartment number, block name, building name (ACCENT + CASE INSENSITIVE)
    if (search && search.trim() !== '') {
      const keyword = search.trim().toLowerCase();
      console.log('🔍 VACANT SEARCH KEYWORD:', keyword);

      where[Op.or] = [
        Sequelize.where(
          Sequelize.literal(
            "LOWER(CONVERT(`Apartment`.`number` USING utf8mb4)) COLLATE utf8mb4_general_ci"
          ),
          { [Op.like]: `%${keyword}%` }
        ),
        Sequelize.where(
          Sequelize.literal(
            "LOWER(CONVERT(`floor->block`.`name` USING utf8mb4)) COLLATE utf8mb4_general_ci"
          ),
          { [Op.like]: `%${keyword}%` }
        ),
        Sequelize.where(
          Sequelize.literal(
            "LOWER(CONVERT(`floor->block->building`.`name` USING utf8mb4)) COLLATE utf8mb4_general_ci"
          ),
          { [Op.like]: `%${keyword}%` }
        )
      ];
    }

    //  Dynamic required: only when filtering
    const requireJoin = !!(search || blockId || buildingId);
    const include = [
      {
        model: Floor,
        as: 'floor',
        required: requireJoin,
        include: [
          {
            model: Block,
            as: 'block',
            required: requireJoin,
            ...(blockId && { where: { id: blockId } }),
            include: [
              {
                model: Building,
                as: 'building',
                required: requireJoin,
                ...(buildingId && { where: { id: buildingId } })
              }
            ]
          }
        ]
      }
    ];

    //  Sắp xếp
    let order = [['createdAt', 'DESC'], ['id', 'ASC']];
    
    switch (sortBy) {
      case 'price_asc':
        order = [['monthlyRent', 'ASC'], ['id', 'ASC']];
        break;
      
      case 'price_desc':
        order = [['monthlyRent', 'DESC'], ['id', 'ASC']];
        break;
      
      case 'newest':
        order = [['createdAt', 'DESC'], ['id', 'ASC']];
        break;
      
      case 'view_desc':
        order = [['viewCount', 'DESC'], ['id', 'ASC']];
        break;
      
      default:
        order = [['createdAt', 'DESC'], ['id', 'ASC']];
    }

    const result = await Apartment.findAndCountAll({
      where,
      include,
      offset: parseInt(offset),
      limit: parseInt(limit),
      order,
      distinct: true // ✅ CRITICAL for correct count with joins
    });

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(limit),
        totalItems: result.count,
        totalPages: Math.ceil(result.count / limit)
      }
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
