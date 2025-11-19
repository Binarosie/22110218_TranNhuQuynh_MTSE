const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HouseholdMember = sequelize.define('HouseholdMember', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    apartmentId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    lastName: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    role: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING(30),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: true
    }
});

module.exports = HouseholdMember;
