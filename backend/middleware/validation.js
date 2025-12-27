const Joi = require('joi');

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }

        next();
    };
};

// Validation schemas
const schemas = {
    register: Joi.object({
        name: Joi.string().min(2).max(255).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        phone: Joi.string().optional(),
        role: Joi.string().valid('admin', 'manager', 'technician', 'user').optional()
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    equipment: Joi.object({
        name: Joi.string().required(),
        serialNumber: Joi.string().required(),
        category: Joi.string().required(),
        department: Joi.string().required(),
        location: Joi.string().optional(),
        assignedTo: Joi.string().optional(),
        maintenanceTeam: Joi.string().uuid().optional(),
        purchaseDate: Joi.date().optional(),
        warrantyExpiry: Joi.date().optional()
    }),

    request: Joi.object({
        type: Joi.string().valid('corrective', 'preventive').required(),
        subject: Joi.string().required(),
        description: Joi.string().optional().allow(''),
        equipmentId: Joi.string().uuid().required(),
        department: Joi.string().optional(),
        teamId: Joi.string().uuid().optional(),
        priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
        scheduledDate: Joi.date().optional()
    }),

    team: Joi.object({
        name: Joi.string().required(),
        description: Joi.string().optional(),
        icon: Joi.string().max(10).optional(),
        specialization: Joi.string().optional()
    })
};

module.exports = { validate, schemas };
