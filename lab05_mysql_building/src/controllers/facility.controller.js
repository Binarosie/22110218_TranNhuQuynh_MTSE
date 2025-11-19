const { Facility, FacilityBooking } = require('../models');

const createFacility = async (req, res) => {
    try {
        const { name, description, quantity } = req.body;
        const facility = await Facility.create({ name, description, quantity });
        res.status(201).json({
            success: true,
            message: 'Facility created',
            data: facility
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const listFacilities = async (req, res) => {
    try {
        const facilities = await Facility.findAll();
        res.json({
            success: true,
            data: facilities
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const createBooking = async (req, res) => {
    try {
        const { facilityId, apartmentId, startAt, endAt } = req.body;
        const booking = await FacilityBooking.create({
            facilityId,
            apartmentId,
            startAt,
            endAt
        });
        res.status(201).json({
            success: true,
            message: 'Booking created',
            data: booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const listBookings = async (req, res) => {
    try {
        const bookings = await FacilityBooking.findAll({
            include: ['facility', 'apartment']
        });
        res.json({
            success: true,
            data: bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { createFacility, listFacilities, createBooking, listBookings };
