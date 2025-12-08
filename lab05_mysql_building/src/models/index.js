const { sequelize } = require('../config/database');

// existing models
const User = require('./User');
const Role = require('./Role');
const Position = require('./Position');

// lab05 models
const Building = require('./Building');
const Block = require('./Block');
const Floor = require('./Floor');
const Apartment = require('./Apartment');
const Facility = require('./Facility');
const FacilityBooking = require('./FacilityBooking');
const Announcement = require('./Announcement');
const TokenBlacklist = require('./TokenBlacklist');

// Define associations
User.belongsTo(Role, {
    foreignKey: 'roleId',
    as: 'role'
});
Role.hasMany(User, {
    foreignKey: 'roleId',
    as: 'users'
});

User.belongsTo(Position, { foreignKey: 'positionId', as: 'position' });
Position.hasMany(User, { foreignKey: 'positionId', as: 'users' });

// Building structure
Building.hasMany(Block, { foreignKey: 'buildingId', as: 'blocks' });
Block.belongsTo(Building, { foreignKey: 'buildingId', as: 'building' });

Block.hasMany(Floor, { foreignKey: 'blockId', as: 'floors' });
Floor.belongsTo(Block, { foreignKey: 'blockId', as: 'block' });

Floor.hasMany(Apartment, { foreignKey: 'floorId', as: 'apartments' });
Apartment.belongsTo(Floor, { foreignKey: 'floorId', as: 'floor' });

// Tenant-Apartment relationship
Apartment.belongsTo(User, { foreignKey: 'tenantId', as: 'tenant' });
User.hasMany(Apartment, { foreignKey: 'tenantId', as: 'rentedApartments' });

// Facility booking relationships
Facility.hasMany(FacilityBooking, { foreignKey: 'facilityId', as: 'bookings' });
FacilityBooking.belongsTo(Facility, { foreignKey: 'facilityId', as: 'facility' });

Apartment.hasMany(FacilityBooking, { foreignKey: 'apartmentId', as: 'facilityBookings' });
FacilityBooking.belongsTo(Apartment, { foreignKey: 'apartmentId', as: 'apartment' });

// User creates booking
User.hasMany(FacilityBooking, { foreignKey: 'userId', as: 'createdBookings' });
FacilityBooking.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Technician assigned to booking
User.hasMany(FacilityBooking, { foreignKey: 'assignedTo', as: 'assignedBookings' });
FacilityBooking.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedTechnician' });

module.exports = {
  sequelize,
  User, Role, Position,
  Building, Block, Floor, Apartment,
  Facility, FacilityBooking, Announcement,
  TokenBlacklist
};