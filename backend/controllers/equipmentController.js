const { Equipment, Team, Request } = require('../models');

// @desc    Get all equipment
// @route   GET /api/equipment
// @access  Private
exports.getAllEquipment = async (req, res, next) => {
    try {
        const equipment = await Equipment.findAll({
            include: [{ model: Team, as: 'team' }],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            count: equipment.length,
            equipment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single equipment
// @route   GET /api/equipment/:id
// @access  Private
exports.getEquipment = async (req, res, next) => {
    try {
        const equipment = await Equipment.findByPk(req.params.id, {
            include: [{ model: Team, as: 'team' }]
        });

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: 'Equipment not found'
            });
        }

        res.json({
            success: true,
            equipment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create equipment
// @route   POST /api/equipment
// @access  Private (Admin, Manager)
exports.createEquipment = async (req, res, next) => {
    try {
        const equipment = await Equipment.create(req.body);

        res.status(201).json({
            success: true,
            equipment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private (Admin, Manager)
exports.updateEquipment = async (req, res, next) => {
    try {
        let equipment = await Equipment.findByPk(req.params.id);

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: 'Equipment not found'
            });
        }

        equipment = await equipment.update(req.body);

        res.json({
            success: true,
            equipment
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private (Admin)
exports.deleteEquipment = async (req, res, next) => {
    try {
        const equipment = await Equipment.findByPk(req.params.id);

        if (!equipment) {
            return res.status(404).json({
                success: false,
                message: 'Equipment not found'
            });
        }

        await equipment.destroy();

        res.json({
            success: true,
            message: 'Equipment deleted'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get equipment requests
// @route   GET /api/equipment/:id/requests
// @access  Private
exports.getEquipmentRequests = async (req, res, next) => {
    try {
        const requests = await Request.findAll({
            where: { equipmentId: req.params.id },
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
