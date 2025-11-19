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
        allowNull: false
    },
    apartmentId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    startAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    endAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
        defaultValue: 'pending'
    }
});

module.exports = FacilityBooking;
