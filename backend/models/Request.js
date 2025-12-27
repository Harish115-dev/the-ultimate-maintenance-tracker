const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Request = sequelize.define('Request', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    type: {
        type: DataTypes.ENUM('corrective', 'preventive'),
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    equipmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'equipment_id'
    },
    department: {
        type: DataTypes.STRING
    },
    teamId: {
        type: DataTypes.UUID,
        field: 'team_id'
    },
    assignedTo: {
        type: DataTypes.UUID,
        field: 'assigned_to'
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
    },
    status: {
        type: DataTypes.ENUM('new', 'in_progress', 'repaired', 'scrap'),
        defaultValue: 'new'
    },
    scheduledDate: {
        type: DataTypes.DATEONLY,
        field: 'scheduled_date'
    },
    duration: {
        type: DataTypes.DECIMAL(5, 2)
    },
    completedDate: {
        type: DataTypes.DATE,
        field: 'completed_date'
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'created_by'
    }
}, {
    tableName: 'requests'
});

module.exports = Request;
