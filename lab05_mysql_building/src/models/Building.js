const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Building = sequelize.define('Building', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: DataTypes.STRING(150),
		allowNull: false,
		validate: {
			notEmpty: true
		}
	},
	address: {
		type: DataTypes.TEXT,
		allowNull: true
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: true
	},
	isActive: {
		type: DataTypes.BOOLEAN,
		defaultValue: true
	},
	deletedAt: {
		type: DataTypes.DATE,
		allowNull: true
	}
}, {
	paranoid: true
});

module.exports = Building;
