const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Floor = sequelize.define('Floor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  blockId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Floor;
