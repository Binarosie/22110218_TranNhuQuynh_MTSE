const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Visitor = sequelize.define('Visitor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    apartmentId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    reason: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    checkIn: {
        type: DataTypes.DATE,
        allowNull: true
    },
    checkOut: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

module.exports = Visitor;
