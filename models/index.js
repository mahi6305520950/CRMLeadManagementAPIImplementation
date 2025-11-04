const sequelize = require('../config/database');
const Employee = require('./employee');
const Enquiry = require('./enquiry');

// Define associations
Employee.hasMany(Enquiry, {
  foreignKey: 'counselorId',
  as: 'claimedEnquiries',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Enquiry.belongsTo(Employee, {
  foreignKey: 'counselorId',
  as: 'counselor',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// Sync database
const syncDatabase = async () => {
  try {
    // Use { force: true } only in development to drop and recreate tables
    // Use { alter: true } to sync without dropping data
    await sequelize.sync({ force: false });
    console.log('✅ Database synchronized successfully');
  } catch (error) {
    console.error('❌ Database synchronization failed:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Employee,
  Enquiry,
  syncDatabase
};