const { Team, User, TeamMember } = require('../models');

// @desc    Get all teams
// @route   GET /api/teams
// @access  Private
exports.getAllTeams = async (req, res, next) => {
    try {
        const teams = await Team.findAll({
            include: [{ model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'] }],
            order: [['created_at', 'ASC']]
        });

        res.json({
            success: true,
            count: teams.length,
            teams
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Private
exports.getTeam = async (req, res, next) => {
    try {
        const team = await Team.findByPk(req.params.id, {
            include: [{ model: User, as: 'members', attributes: ['id', 'name', 'email', 'role'] }]
        });

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        res.json({
            success: true,
            team
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create team
// @route   POST /api/teams
// @access  Private (Admin, Manager)
exports.createTeam = async (req, res, next) => {
    try {
        const team = await Team.create(req.body);

        res.status(201).json({
            success: true,
            team
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Admin, Manager)
exports.updateTeam = async (req, res, next) => {
    try {
        let team = await Team.findByPk(req.params.id);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        team = await team.update(req.body);

        res.json({
            success: true,
            team
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Admin)
exports.deleteTeam = async (req, res, next) => {
    try {
        const team = await Team.findByPk(req.params.id);

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        await team.destroy();

        res.json({
            success: true,
            message: 'Team deleted'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add member to team
// @route   POST /api/teams/:id/members
// @access  Private (Admin, Manager)
exports.addMember = async (req, res, next) => {
    try {
        const { userId } = req.body;

        const team = await Team.findByPk(req.params.id);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await TeamMember.create({
            teamId: req.params.id,
            userId
        });

        res.status(201).json({
            success: true,
            message: 'Member added to team'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private (Admin, Manager)
exports.removeMember = async (req, res, next) => {
    try {
        const deleted = await TeamMember.destroy({
            where: {
                teamId: req.params.id,
                userId: req.params.userId
            }
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Member not found in team'
            });
        }

        res.json({
            success: true,
            message: 'Member removed from team'
        });
    } catch (error) {
        next(error);
    }
};
