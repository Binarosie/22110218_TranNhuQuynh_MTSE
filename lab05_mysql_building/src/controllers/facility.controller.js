const { Facility, FacilityBooking } = require('../models');

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
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const result = await Facility.findAndCountAll({ limit: parseInt(limit), offset: parseInt(offset), order: [['createdAt','DESC']] });
        res.json({ success: true, data: result.rows, total: result.count, page: parseInt(page), pages: Math.ceil(result.count / limit) });
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
        await facility.destroy();
        res.json({ success: true, message: 'Facility deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createBooking = async (req, res) => {
    try {
        const { facilityId, apartmentId, startAt, endAt } = req.body;
        const booking = await FacilityBooking.create({ facilityId, apartmentId, startAt, endAt });
        res.status(201).json({ success: true, message: 'Booking created', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const listBookings = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        const result = await FacilityBooking.findAndCountAll({ limit: parseInt(limit), offset: parseInt(offset), include: ['facility','apartment'], order: [['createdAt','DESC']] });
        res.json({ success: true, data: result.rows, total: result.count, page: parseInt(page), pages: Math.ceil(result.count / limit) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await FacilityBooking.findByPk(id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        booking.status = 'cancelled';
        await booking.save();
        res.json({ success: true, message: 'Booking cancelled', data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createFacility, listFacilities, getFacilityById, updateFacility, deleteFacility, createBooking, listBookings, cancelBooking };
