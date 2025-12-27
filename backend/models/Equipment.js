const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Equipment = sequelize.define('Equipment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serialNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'serial_number'
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    department: {
        type: DataTypes.STRING,
        allowNull: false
    },
    location: {
        type: DataTypes.STRING
    },
    assignedTo: {
        type: DataTypes.STRING,
        field: 'assigned_to'
    },
    maintenanceTeam: {
        type: DataTypes.UUID,
        field: 'maintenance_team'
    },
    purchaseDate: {
        type: DataTypes.DATEONLY,
        field: 'purchase_date'
    },
    warrantyExpiry: {
        type: DataTypes.DATEONLY,
        field: 'warranty_expiry'
    },
    status: {
        type: DataTypes.ENUM('active', 'scrapped', 'maintenance'),
        defaultValue: 'active'
    }
}, {
    tableName: 'equipment'
});

module.exports = Equipment;
