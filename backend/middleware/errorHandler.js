const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    let error = { ...err };
    error.message = err.message;

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError') {
        const errors = err.errors.map(e => ({
            field: e.path,
            message: e.message
        }));
        error.message = 'Validation Error';
        error.statusCode = 400;
        return res.status(400).json({
            success: false,
            message: error.message,
            errors
        });
    }

    // Sequelize unique constraint error
    if (err.name === 'SequelizeUniqueConstraintError') {
        error.message = 'Duplicate field value entered';
        error.statusCode = 400;
    }

    // Sequelize foreign key error
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        error.message = 'Invalid reference to related resource';
        error.statusCode = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error.message = 'Invalid token';
        error.statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        error.message = 'Token expired';
        error.statusCode = 401;
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error'
    });
};

module.exports = errorHandler;
