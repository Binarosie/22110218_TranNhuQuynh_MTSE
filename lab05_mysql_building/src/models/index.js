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
const HouseholdMember = require('./HouseholdMember');
const Billing = require('./Billing');
const Payment = require('./Payment');
const Visitor = require('./Visitor');
const Facility = require('./Facility');
const FacilityBooking = require('./FacilityBooking');
const Announcement = require('./Announcement');

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

Apartment.hasMany(HouseholdMember, { foreignKey: 'apartmentId', as: 'members' });
HouseholdMember.belongsTo(Apartment, { foreignKey: 'apartmentId', as: 'apartment' });

Apartment.hasMany(Billing, { foreignKey: 'apartmentId', as: 'billings' });
Billing.belongsTo(Apartment, { foreignKey: 'apartmentId', as: 'apartment' });

Billing.hasMany(Payment, { foreignKey: 'billingId', as: 'payments' });
Payment.belongsTo(Billing, { foreignKey: 'billingId', as: 'billing' });

Apartment.hasMany(Visitor, { foreignKey: 'apartmentId', as: 'visitors' });
Visitor.belongsTo(Apartment, { foreignKey: 'apartmentId', as: 'apartment' });

Facility.hasMany(FacilityBooking, { foreignKey: 'facilityId', as: 'bookings' });
FacilityBooking.belongsTo(Facility, { foreignKey: 'facilityId', as: 'facility' });

Apartment.hasMany(FacilityBooking, { foreignKey: 'apartmentId', as: 'facilityBookings' });
FacilityBooking.belongsTo(Apartment, { foreignKey: 'apartmentId', as: 'apartment' });

module.exports = {
  sequelize,
  User, Role, Position,
  Building, Block, Floor, Apartment, HouseholdMember,
  Billing, Payment, Visitor, Facility, FacilityBooking, Announcement
};