/**
 * @fileoverview Main server file for Matchpoint - Real-time multiplayer game show platform
 * @author cc241070
 * @version 1.0.0
 * @description Express.js server with Socket.IO integration for real-time gaming
 */

// ============================================================================
// IMPORTS AND DEPENDENCIES
// ============================================================================

const express = require('express');
const http = require('http'); // Import http module for Socket.IO
const { Server } = require('socket.io'); // Import Server from socket.io
const cors = require('cors');
const app = express();

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

// Load environment variables based on NODE_ENV
require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env'
});

// Server configuration
const SERVER_PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('Environment:', NODE_ENV);
console.log('Server Port:', SERVER_PORT);

// ============================================================================
// DATABASE AND SERVICES INITIALIZATION
// ============================================================================

// Initialize database connection with connection pooling
require('./services/database');

// Import Socket.IO manager for real-time communication
const socketManager = require('./services/socketManager');

// ============================================================================
// EXPRESS APP SETUP
// ============================================================================

// Middleware
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

/**
 * Configure CORS (Cross-Origin Resource Sharing) for frontend access
 * Allows requests from localhost and environment-specified frontend URL
 */
const FRONTEND_URL_FROM_ENV = process.env.FRONTEND_URL;
const ALLOWED_ORIGINS = ["http://localhost:5173"]; // Always allow localhost for development

// Add environment-specific frontend URL if different from localhost
if (FRONTEND_URL_FROM_ENV && FRONTEND_URL_FROM_ENV !== "http://localhost:5173/") {
    ALLOWED_ORIGINS.push(FRONTEND_URL_FROM_ENV);
}

const corsConfiguration = {
    origin: ALLOWED_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

console.log('CORS Configuration:', corsConfiguration);
app.use(cors(corsConfiguration));

// ============================================================================
// ROUTE IMPORTS
// ============================================================================

// API route handlers
const indexRouter = require('./routes/index');
const errorRouter = require('./routes/error');
const authRouter = require('./routes/auth');
const matchesRouter = require('./routes/matches');
const gamesRouter = require('./routes/games');

// ============================================================================
// MIDDLEWARE IMPORTS
// ============================================================================

const { errorHandler } = require('./middlewares/error-handler.middleware');
const { authenticateJWT } = require('./services/authentication');

// ============================================================================
// SOCKET.IO SETUP
// ============================================================================

/**
 * Create HTTP server and attach Socket.IO for real-time communication
 * This enables bidirectional communication between clients and server
 */
const httpServer = http.createServer(app);

// Initialize Socket.IO server with CORS configuration
const socketIoServer = new Server(httpServer, {
    cors: corsConfiguration
});

// Initialize Socket.IO event listeners and room management
socketManager.initializeSocketIO(socketIoServer);

// Make socketManager's broadcast function available to Express controllers
// Controllers can access it via: req.app.locals.socketManager.broadcastToRoom
app.locals.socketManager = {
    broadcastToRoom: socketManager.broadcastToRoom
};

// ============================================================================
// ROUTE MOUNTING
// ============================================================================

// Public routes (no authentication required)
app.use('/api/auth', authRouter);

// Protected routes (require JWT authentication)
app.use(authenticateJWT);
app.use('/', indexRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/games', gamesRouter);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Global error handling middleware
app.use(errorHandler);
app.use(errorRouter); // Catch-all for unhandled routes (404 etc.)

// ============================================================================
// SERVER STARTUP
// ============================================================================

/**
 * Start the HTTP server with Socket.IO integration
 * Listens on the configured port and logs server information
 */
httpServer.listen(SERVER_PORT, () => {
    console.log('='.repeat(50));
    console.log('🎮 Matchpoint Server Started Successfully!');
    console.log('='.repeat(50));
    console.log(`🌐 Environment: ${NODE_ENV}`);
    console.log(`🚀 Server running on port: ${SERVER_PORT}`);
    console.log(`📡 Backend API: http://localhost:${SERVER_PORT}/api`);
    console.log(`🔌 Socket.IO: http://localhost:${SERVER_PORT}`);
    console.log(`🎯 CORS Origins: ${ALLOWED_ORIGINS.join(', ')}`);
    console.log('='.repeat(50));
});
