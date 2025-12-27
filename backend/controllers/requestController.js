const { Request, Equipment, Team, User } = require('../models');

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private
exports.getAllRequests = async (req, res, next) => {
    try {
        const requests = await Request.findAll({
            include: [
                { model: Equipment, as: 'equipment' },
                { model: Team, as: 'team' },
                { model: User, as: 'assignedUser' },
                { model: User, as: 'creator' }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            count: requests.length,
            requests
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single request
// @route   GET /api/requests/:id
// @access  Private
exports.getRequest = async (req, res, next) => {
    try {
        const request = await Request.findByPk(req.params.id, {
            include: [
                { model: Equipment, as: 'equipment' },
                { model: Team, as: 'team' },
                { model: User, as: 'assignedUser' },
                { model: User, as: 'creator' }
            ]
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        res.json({
            success: true,
            request
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create request
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res, next) => {
    try {
        req.body.createdBy = req.user.id;

        const request = await Request.create(req.body);

        res.status(201).json({
            success: true,
            request
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update request
// @route   PUT /api/requests/:id
// @access  Private
exports.updateRequest = async (req, res, next) => {
    try {
        let request = await Request.findByPk(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        request = await request.update(req.body);

        res.json({
            success: true,
            request
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update request status
// @route   PATCH /api/requests/:id/status
// @access  Private
exports.updateStatus = async (req, res, next) => {
    try {
        const { status, duration } = req.body;

        let request = await Request.findByPk(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        const updateData = { status };

        if (status === 'repaired' && duration) {
            updateData.duration = duration;
            updateData.completedDate = new Date();
        }

        request = await request.update(updateData);

        // If status is scrap, mark equipment as scrapped
        if (status === 'scrap') {
            await Equipment.update(
                { status: 'scrapped' },
                { where: { id: request.equipmentId } }
            );
        }

        res.json({
            success: true,
            request
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Assign request to user
// @route   PATCH /api/requests/:id/assign
// @access  Private
exports.assignRequest = async (req, res, next) => {
    try {
        let request = await Request.findByPk(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        // Assign to logged-in user if no userId provided
        const userId = req.body.userId || req.user.id;

        request = await request.update({ assignedTo: userId });

        res.json({
            success: true,
            request
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete request
// @route   DELETE /api/requests/:id
// @access  Private (Admin, Manager)
exports.deleteRequest = async (req, res, next) => {
    try {
        const request = await Request.findByPk(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found'
            });
        }

        await request.destroy();

        res.json({
            success: true,
            message: 'Request deleted'
        });
    } catch (error) {
        next(error);
    }
};
