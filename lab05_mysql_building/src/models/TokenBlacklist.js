const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TokenBlacklist = sequelize.define('TokenBlacklist', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    token: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at'
    },
    reason: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'logout'
    }
}, {
    tableName: 'token_blacklist',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['token']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['expires_at']
        }
    ]
});

module.exports = TokenBlacklist;
