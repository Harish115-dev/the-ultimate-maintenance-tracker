const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize, testConnection } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import models to ensure associations are loaded
require('./models');


// const path = require('path'); // Already imported at top


const app = express();

// Security middleware
// Security middleware
// app.use(helmet({
//     contentSecurityPolicy: false, // Disabled to allow inline scripts/styles in current frontend
// }));
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
}));

// Serve static files from root, but block access to backend source code
app.use((req, res, next) => {
    if (req.path.startsWith('/backend') || req.path.startsWith('/.env')) {
        return res.status(403).send('Forbidden');
    }
    next();
});

app.use(express.static(path.join(__dirname, '../')));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/teams', require('./routes/teams'));

// Health check
app.get('/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
});

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize database and start server
const startServer = async () => {
    try {
        // Test database connection
        await testConnection();

        // Sync database (creates tables if they don't exist)
        await sequelize.sync({ alter: false }); // Use {force: true} to drop and recreate tables
        console.log('✅ Database synced');

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
