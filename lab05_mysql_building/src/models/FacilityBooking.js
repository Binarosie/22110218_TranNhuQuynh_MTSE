const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FacilityBooking = sequelize.define('FacilityBooking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    facilityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID of facility to be fixed'
    },
    apartmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Apartment where facility needs fixing'
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'User who created the booking'
    },
    assignedTo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Technician (thợ sửa) assigned by admin'
    },
    bookingDate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Date when repair is needed'
    },
    status: {
        type: DataTypes.ENUM('TODO', 'PENDING', 'FIXED', 'DONE'),
        defaultValue: 'TODO',
        comment: 'TODO: created by user, PENDING: assigned by admin, FIXED: completed by technician, DONE: confirmed by user'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'User notes about the issue'
    },
    technicianNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notes from technician after fixing'
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    paranoid: true
});

module.exports = FacilityBooking;
