const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Apartment = sequelize.define('Apartment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    floorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    area: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: 'Area in square meters'
    },
    status: {
        type: DataTypes.ENUM('vacant', 'occupied', 'maintenance'),
        defaultValue: 'vacant'
    },
    tenantId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID of the user who is renting this apartment'
    },
    monthlyRent: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Monthly rent amount in VND'
    },
    leaseStartDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    leaseEndDate: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

module.exports = Apartment;
