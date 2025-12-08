const { Facility, FacilityBooking, Apartment, User, Floor, Block, Building, Announcement } = require('../models');
const { Op } = require('sequelize');

// ==================== FACILITY CRUD (Admin only) ====================
const createFacility = async (req, res) => {
    try {
        const { name, description, quantity } = req.body;
        const facility = await Facility.create({ name, description, quantity });
        res.status(201).json({ success: true, message: 'Facility created', data: facility });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const listFacilities = async (req, res) => {
    try {
        const { page = 1, pageSize = 20 } = req.query;
        const offset = (page - 1) * pageSize;
        const result = await Facility.findAndCountAll({
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            order: [['name', 'ASC']]
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

const getFacilityById = async (req, res) => {
    try {
        const { id } = req.params;
        const facility = await Facility.findByPk(id);
        if (!facility) return res.status(404).json({ success: false, message: 'Facility not found' });
        res.json({ success: true, data: facility });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateFacility = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, quantity } = req.body;
        const facility = await Facility.findByPk(id);
        if (!facility) return res.status(404).json({ success: false, message: 'Facility not found' });
        if (name !== undefined) facility.name = name;
        if (description !== undefined) facility.description = description;
        if (quantity !== undefined) facility.quantity = quantity;
        await facility.save();
        res.json({ success: true, message: 'Facility updated', data: facility });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteFacility = async (req, res) => {
    try {
        const { id } = req.params;
        const facility = await Facility.findByPk(id);
        if (!facility) return res.status(404).json({ success: false, message: 'Facility not found' });
        await facility.destroy(); // Soft delete
        res.json({ success: true, message: 'Facility deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== BOOKING WORKFLOW ====================

// Step 1: USER creates booking (status: TODO)
const createBooking = async (req, res) => {
    try {
        const { facilityId, bookingDate, notes } = req.body;
        const userId = req.user.id;

        // Check if user has rented apartment
        if (!req.user.hasRentedApartment) {
            return res.status(400).json({
                success: false,
                message: 'Bạn phải thuê căn hộ trước khi đặt lịch sửa chữa'
            });
        }

        // Get user's apartment
        const apartment = await Apartment.findOne({
            where: { tenantId: userId }
        });

        if (!apartment) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy căn hộ của bạn'
            });
        }

        // Check if facility exists
        const facility = await Facility.findByPk(facilityId);
        if (!facility) {
            return res.status(404).json({
                success: false,
                message: 'Facility không tồn tại'
            });
        }

        // Create booking with TODO status
        const booking = await FacilityBooking.create({
            facilityId,
            apartmentId: apartment.id,
            userId,
            bookingDate,
            notes,
            status: 'TODO' // Default status
        });

        const bookingWithDetails = await FacilityBooking.findByPk(booking.id, {
            include: [
                { model: Facility, as: 'facility' },
                { model: Apartment, as: 'apartment' },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Đặt lịch sửa chữa thành công! Vui lòng chờ admin xác nhận.',
            data: bookingWithDetails
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Step 2: ADMIN assigns technician and changes status TODO → PENDING
const assignTechnician = async (req, res) => {
    try {
        const { id } = req.params;
        const { technicianId } = req.body;

        const booking = await FacilityBooking.findByPk(id, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: Facility, as: 'facility' }
            ]
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking không tồn tại'
            });
        }

        if (booking.status !== 'TODO') {
            return res.status(400).json({
                success: false,
                message: `Booking đã ở trạng thái ${booking.status}, không thể assign`
            });
        }

        // Verify technician exists and has correct role
        const technician = await User.findByPk(technicianId, {
            include: [{ model: require('../models').Role, as: 'role' }]
        });

        if (!technician || technician.role.name !== 'Technician') {
            return res.status(400).json({
                success: false,
                message: 'Technician không hợp lệ'
            });
        }

        // Update booking
        booking.assignedTo = technicianId;
        booking.status = 'PENDING';
        await booking.save();

        // Create announcement for user
        await Announcement.create({
            title: `Booking #${booking.id} đã được xác nhận`,
            content: `Admin đã assign thợ ${technician.firstName} ${technician.lastName} để sửa ${booking.facility.name} cho bạn.`,
            publishedAt: new Date()
        });

        const updatedBooking = await FacilityBooking.findByPk(id, {
            include: [
                { model: Facility, as: 'facility' },
                { model: Apartment, as: 'apartment' },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
                { model: User, as: 'assignedTechnician', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] }
            ]
        });

        res.json({
            success: true,
            message: 'Đã assign thợ thành công',
            data: updatedBooking
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Step 3: TECHNICIAN marks booking as FIXED
const markAsFixed = async (req, res) => {
    try {
        const { id } = req.params;
        const { technicianNotes } = req.body;
        const technicianId = req.user.id;

        const booking = await FacilityBooking.findByPk(id, {
            include: [
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
                { model: Facility, as: 'facility' }
            ]
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking không tồn tại'
            });
        }

        if (booking.assignedTo !== technicianId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không được assign cho booking này'
            });
        }

        if (booking.status !== 'PENDING') {
            return res.status(400).json({
                success: false,
                message: `Booking đang ở trạng thái ${booking.status}, không thể mark as fixed`
            });
        }

        // Update booking
        booking.status = 'FIXED';
        booking.technicianNotes = technicianNotes;
        await booking.save();

        // Create announcement for user
        await Announcement.create({
            title: `Booking #${booking.id} đã được sửa xong`,
            content: `Thợ đã hoàn thành sửa ${booking.facility.name}. Vui lòng kiểm tra và xác nhận.`,
            publishedAt: new Date()
        });

        const updatedBooking = await FacilityBooking.findByPk(id, {
            include: [
                { model: Facility, as: 'facility' },
                { model: Apartment, as: 'apartment' },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
                { model: User, as: 'assignedTechnician', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] }
            ]
        });

        res.json({
            success: true,
            message: 'Đã mark as FIXED, chờ user xác nhận',
            data: updatedBooking
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Step 4: USER confirms booking as DONE
const markAsDone = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const booking = await FacilityBooking.findByPk(id, {
            include: [
                { model: Facility, as: 'facility' }
            ]
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking không tồn tại'
            });
        }

        if (booking.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không phải người tạo booking này'
            });
        }

        if (booking.status !== 'FIXED') {
            return res.status(400).json({
                success: false,
                message: `Booking đang ở trạng thái ${booking.status}, chỉ có thể DONE khi status là FIXED`
            });
        }

        // Update booking to DONE (final status)
        booking.status = 'DONE';
        await booking.save();

        // Create announcement for completion
        await Announcement.create({
            title: `Booking #${booking.id} đã hoàn thành`,
            content: `User đã xác nhận hoàn thành sửa chữa ${booking.facility.name}. Công việc đã kết thúc.`,
            publishedAt: new Date()
        });

        const updatedBooking = await FacilityBooking.findByPk(id, {
            include: [
                { model: Facility, as: 'facility' },
                { model: Apartment, as: 'apartment' },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
                { model: User, as: 'assignedTechnician', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] }
            ]
        });

        res.json({
            success: true,
            message: 'Booking đã hoàn thành!',
            data: updatedBooking
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// List bookings with filters by role
const listBookings = async (req, res) => {
    try {
        const { page = 1, pageSize = 20, status, apartmentId } = req.query;
        const offset = (page - 1) * pageSize;
        const userId = req.user.id;
        const userRole = req.user.role.name;

        const where = {};

        // Filter by status
        if (status) {
            where.status = status;
        }

        // Filter by role
        if (userRole === 'User') {
            // User only sees their own bookings
            where.userId = userId;
        } else if (userRole === 'Technician') {
            // Technician sees assigned bookings
            where.assignedTo = userId;
        }
        // Admin sees all bookings

        // Filter by apartment (admin/technician use case)
        if (apartmentId) {
            where.apartmentId = apartmentId;
        }

        const result = await FacilityBooking.findAndCountAll({
            where,
            include: [
                { model: Facility, as: 'facility' },
                { 
                    model: Apartment, 
                    as: 'apartment',
                    include: [{
                        model: Floor,
                        as: 'floor',
                        include: [{
                            model: Block,
                            as: 'block',
                            include: [{ model: Building, as: 'building' }]
                        }]
                    }]
                },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
                { model: User, as: 'assignedTechnician', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'], required: false }
            ],
            limit: parseInt(pageSize),
            offset: parseInt(offset),
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

// Get booking by ID
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await FacilityBooking.findByPk(id, {
            include: [
                { model: Facility, as: 'facility' },
                {
                    model: Apartment,
                    as: 'apartment',
                    include: [{
                        model: Floor,
                        as: 'floor',
                        include: [{
                            model: Block,
                            as: 'block',
                            include: [{ model: Building, as: 'building' }]
                        }]
                    }]
                },
                { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
                { model: User, as: 'assignedTechnician', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'], required: false }
            ]
        });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking không tồn tại'
            });
        }

        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get booking statistics
const getBookingStats = async (req, res) => {
    try {
        const [totalBookings, todoCount, pendingCount, fixedCount, doneCount] = await Promise.all([
            FacilityBooking.count(),
            FacilityBooking.count({ where: { status: 'TODO' } }),
            FacilityBooking.count({ where: { status: 'PENDING' } }),
            FacilityBooking.count({ where: { status: 'FIXED' } }),
            FacilityBooking.count({ where: { status: 'DONE' } })
        ]);

        res.json({
            success: true,
            data: {
                totalBookings,
                todoCount,
                pendingCount,
                fixedCount,
                doneCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    // Facility CRUD
    createFacility,
    listFacilities,
    getFacilityById,
    updateFacility,
    deleteFacility,
    // Booking workflow
    createBooking,      // User: TODO
    assignTechnician,   // Admin: TODO → PENDING
    markAsFixed,        // Technician: PENDING → FIXED
    markAsDone,         // User: FIXED → DONE
    listBookings,
    getBookingById,
    getBookingStats
};
