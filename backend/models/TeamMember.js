const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeamMember = sequelize.define('TeamMember', {
    teamId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'team_id',
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
        primaryKey: true
    }
}, {
    tableName: 'team_members',
    timestamps: false
});

module.exports = TeamMember;
