const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Block = sequelize.define('Block', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  buildingId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Block;
