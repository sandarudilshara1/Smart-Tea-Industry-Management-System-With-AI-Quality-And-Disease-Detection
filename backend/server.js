const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
    console.error(error.name, error.message);
    console.error(error.stack);
    process.exit(1);
});

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic route for testing
app.get('/', (req, res) => {
    res.json({ 
        message: 'Tea Factory Management System API',
        version: '1.0.0',
        status: 'Running'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState;
    const dbStatusMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };

    res.status(dbStatus === 1 ? 200 : 503).json({
        status: dbStatus === 1 ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatusMap[dbStatus],
        memory: {
            rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
        }
    });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/drivers', require('./routes/drivers'));

// Future API Routes
// app.use('/api/users', require('./routes/users'));
// app.use('/api/inventory', require('./routes/inventory'));
// app.use('/api/payments', require('./routes/payments'));
// app.use('/api/suppliers', require('./routes/suppliers'));
// app.use('/api/fertilizer', require('./routes/fertilizer'));

// 404 handler - must be after all routes
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(err.status || 500).json({ 
        success: false,
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.stack : {}
    });
});

// Start server
const PORT = process.env.PORT || 5000;

// Handle port already in use
const startServer = () => {
    const server = app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Port ${PORT} is already in use!`);
            console.error('💡 Solutions:');
            console.error('   1. Kill the process using the port:');
            console.error(`      netstat -ano | findstr :${PORT}`);
            console.error('      taskkill /F /PID <process_id>');
            console.error('   2. Change PORT in .env file');
            console.error('   3. Wait a few seconds and try again');
            process.exit(1);
        } else {
            console.error('❌ Server error:', err);
            process.exit(1);
        }
    });

    return server;
};

const server = startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ UNHANDLED REJECTION! Shutting down...');
    console.error('Reason:', reason);
    server.close(() => {
        process.exit(1);
    });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`\n⚠️ ${signal} received. Starting graceful shutdown...`);
    
    server.close(() => {
        console.log('✅ HTTP server closed.');
        
        // Close database connection
        const mongoose = require('mongoose');
        mongoose.connection.close(false, () => {
            console.log('✅ MongoDB connection closed.');
            process.exit(0);
        });
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('⚠️ Forcing shutdown after timeout...');
        process.exit(1);
    }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Export for testing
module.exports = app;
