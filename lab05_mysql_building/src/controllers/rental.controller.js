const { Apartment, Floor, Block, Building, User, FacilityBooking, Facility } = require('../models');
const { Op } = require('sequelize');

// User rent apartment
const rentApartment = async (req, res) => {
    try {
        const { apartmentId } = req.body;
        const userId = req.user.id;

        // Check if apartment exists and is vacant
        const apartment = await Apartment.findByPk(apartmentId);
        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: 'Căn hộ không tồn tại'
            });
        }

        if (apartment.status !== 'vacant') {
            return res.status(400).json({
                success: false,
                message: 'Căn hộ này không còn trống'
            });
        }

        // Update apartment
        apartment.status = 'occupied';
        apartment.tenantId = userId;
        apartment.leaseStartDate = new Date();
        // Default lease for 1 year
        const leaseEnd = new Date();
        leaseEnd.setFullYear(leaseEnd.getFullYear() + 1);
        apartment.leaseEndDate = leaseEnd;
        await apartment.save();

        // Update user hasRentedApartment flag if this is their first rental
        const user = await User.findByPk(userId);
        if (!user.hasRentedApartment) {
            user.hasRentedApartment = true;
            await user.save();
        }

        const updatedApartment = await Apartment.findByPk(apartmentId, {
            include: [
                {
                    model: Floor,
                    as: 'floor',
                    include: [{
                        model: Block,
                        as: 'block',
                        include: [{ model: Building, as: 'building' }]
                    }]
                },
                {
                    model: User,
                    as: 'tenant',
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
                }
            ]
        });

        res.json({
            success: true,
            message: 'Thuê căn hộ thành công!',
            data: updatedApartment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// User view their rented apartments
const getMyApartment = async (req, res) => {
    try {
        const userId = req.user.id;

        const apartments = await Apartment.findAll({
            where: { tenantId: userId },
            include: [
                {
                    model: Floor,
                    as: 'floor',
                    include: [{
                        model: Block,
                        as: 'block',
                        include: [{ model: Building, as: 'building' }]
                    }]
                }
            ],
            order: [['leaseStartDate', 'DESC']]
        });

        if (apartments.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bạn chưa thuê căn hộ nào'
            });
        }

        res.json({
            success: true,
            data: apartments,
            total: apartments.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// User cancel rental (move out)
const cancelRental = async (req, res) => {
    try {
        const userId = req.user.id;
        const { apartmentId } = req.body;

        if (!apartmentId) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp apartmentId cần trả'
            });
        }

        const apartment = await Apartment.findOne({
            where: { 
                id: apartmentId,
                tenantId: userId 
            }
        });

        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: 'Bạn không thuê căn hộ này'
            });
        }

        // Check if user has pending bookings for this apartment
        const pendingBookings = await FacilityBooking.count({
            where: {
                userId: userId,
                apartmentId: apartmentId,
                status: { [Op.in]: ['TODO', 'PENDING', 'FIXED'] }
            }
        });

        if (pendingBookings > 0) {
            return res.status(400).json({
                success: false,
                message: 'Căn hộ này còn booking đang chờ xử lý. Vui lòng hoàn thành tất cả booking trước khi trả căn hộ.'
            });
        }

        // Update apartment
        apartment.status = 'vacant';
        apartment.tenantId = null;
        apartment.leaseStartDate = null;
        apartment.leaseEndDate = null;
        await apartment.save();

        // Check if user has any other apartments
        const remainingApartments = await Apartment.count({
            where: { tenantId: userId }
        });

        // If no more apartments, update user flag
        if (remainingApartments === 0) {
            const user = await User.findByPk(userId);
            user.hasRentedApartment = false;
            await user.save();
        }

        res.json({
            success: true,
            message: 'Trả căn hộ thành công!',
            remainingApartments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// List vacant apartments for users (with fuzzy search, filters, lazy loading)
const listVacantApartments = async (req, res) => {
    try {
        const {
            page = 1,
            pageSize = 20,
            search,
            buildingId,
            blockId,
            floorId,
            minArea,
            maxArea,
            minRent,
            maxRent,
            sortBy = 'viewCount' // viewCount, monthlyRent, area
        } = req.query;

        const offset = (page - 1) * pageSize;
        const where = { status: 'vacant' };

        // Fuzzy search by apartment number
        if (search) {
            where.number = { [Op.like]: `%${search}%` };
        }

        // Filter by area
        if (minArea || maxArea) {
            where.area = {};
            if (minArea) where.area[Op.gte] = parseFloat(minArea);
            if (maxArea) where.area[Op.lte] = parseFloat(maxArea);
        }

        // Filter by rent
        if (minRent || maxRent) {
            where.monthlyRent = {};
            if (minRent) where.monthlyRent[Op.gte] = parseFloat(minRent);
            if (maxRent) where.monthlyRent[Op.lte] = parseFloat(maxRent);
        }

        const include = [
            {
                model: Floor,
                as: 'floor',
                ...(floorId && { where: { id: floorId } }),
                include: [{
                    model: Block,
                    as: 'block',
                    ...(blockId && { where: { id: blockId } }),
                    include: [{
                        model: Building,
                        as: 'building',
                        ...(buildingId && { where: { id: buildingId } })
                    }]
                }]
            }
        ];

        // Sort options
        let order = [];
        if (sortBy === 'viewCount') {
            order = [['viewCount', 'DESC']];
        } else if (sortBy === 'monthlyRent') {
            order = [['monthlyRent', 'ASC']];
        } else if (sortBy === 'area') {
            order = [['area', 'DESC']];
        } else {
            order = [['number', 'ASC']];
        }

        const result = await Apartment.findAndCountAll({
            where,
            include,
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            order
        });

        res.json({
            success: true,
            data: result.rows,
            pagination: {
                total: result.count,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                pages: Math.ceil(result.count / pageSize),
                hasMore: offset + result.rows.length < result.count
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Increment view count when user views apartment detail
const incrementViewCount = async (req, res) => {
    try {
        const { id } = req.params;

        const apartment = await Apartment.findByPk(id);
        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: 'Căn hộ không tồn tại'
            });
        }

        apartment.viewCount += 1;
        await apartment.save();

        const updatedApartment = await Apartment.findByPk(id, {
            include: [
                {
                    model: Floor,
                    as: 'floor',
                    include: [{
                        model: Block,
                        as: 'block',
                        include: [{ model: Building, as: 'building' }]
                    }]
                }
            ]
        });

        res.json({
            success: true,
            data: updatedApartment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    rentApartment,
    getMyApartment,
    cancelRental,
    listVacantApartments,
    incrementViewCount
};
