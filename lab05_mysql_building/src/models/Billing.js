const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Billing = sequelize.define('Billing', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    apartmentId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('unpaid', 'paid', 'overdue'),
        defaultValue: 'unpaid'
    }
});

module.exports = Billing;
