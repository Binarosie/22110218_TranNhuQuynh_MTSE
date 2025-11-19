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
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('vacant', 'occupied', 'maintenance'),
        defaultValue: 'vacant'
    }
});

module.exports = Apartment;
