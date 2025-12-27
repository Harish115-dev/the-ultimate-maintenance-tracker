const User = require('./User');
const Equipment = require('./Equipment');
const Request = require('./Request');
const Team = require('./Team');
const TeamMember = require('./TeamMember');

// Define associations

// User <-> Team (Many-to-Many through TeamMember)
User.belongsToMany(Team, { through: TeamMember, foreignKey: 'userId', as: 'teams' });
Team.belongsToMany(User, { through: TeamMember, foreignKey: 'teamId', as: 'members' });

// Equipment -> Team (Many-to-One)
Equipment.belongsTo(Team, { foreignKey: 'maintenanceTeam', as: 'team' });
Team.hasMany(Equipment, { foreignKey: 'maintenanceTeam', as: 'equipment' });

// Request -> Equipment (Many-to-One)
Request.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });
Equipment.hasMany(Request, { foreignKey: 'equipmentId', as: 'requests' });

// Request -> Team (Many-to-One)
Request.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Team.hasMany(Request, { foreignKey: 'teamId', as: 'requests' });

// Request -> User (assignedTo)
Request.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedUser' });
User.hasMany(Request, { foreignKey: 'assignedTo', as: 'assignedRequests' });

// Request -> User (createdBy)
Request.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
User.hasMany(Request, { foreignKey: 'createdBy', as: 'createdRequests' });

module.exports = {
    User,
    Equipment,
    Request,
    Team,
    TeamMember
};
