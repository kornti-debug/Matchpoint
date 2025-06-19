const express = require('express');
const http = require('http'); // Import http module for Socket.IO
const { Server } = require('socket.io'); // Import Server from socket.io
const cors = require('cors');
const app = express();
require('dotenv').config(); // Load environment variables
// Default to 3000 if PORT is not defined in any .env file
const port = process.env.PORT || 3000;

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


require('./services/database'); // Connect to MySQL database

// Import the socketManager
const socketManager = require('./services/socketManager');

// Middleware
app.use(cookieParser());
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data

const allowedFrontendOrigin = process.env.FRONTEND_URL;
const corsOptions = {
    origin: allowedFrontendOrigin, // Allow your frontend URL(s)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions)); // Apply CORS to Express routes

// Route imports
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const errorRouter = require('./routes/error');
const authRouter = require('./routes/auth');
const matchesRouter = require('./routes/matches');
const gamesRouter = require('./routes/games'); // Assuming you have a separate games router for /api/games


// Middleware imports
const { errorHandler } = require('./middlewares/error-handler.middleware');
const { authenticateJWT } = require('./services/authentication'); // Assuming this is your JWT auth middleware

// --- CRUCIAL CHANGE: Create HTTP server and attach Socket.IO ---
const httpServer = http.createServer(app); // Create an HTTP server from your Express app

const io = new Server(httpServer, {
    cors: corsOptions // Apply CORS options to Socket.IO as well
});

// Initialize Socket.IO event listeners via socketManager
socketManager.initializeSocketIO(io);

// Make socketManager's broadcast function available to all Express request handlers
// This is the correct way for controllers to access it: req.app.locals.socketManager.broadcastToRoom
app.locals.socketManager = {
    broadcastToRoom: socketManager.broadcastToRoom
};
// --- END Socket.IO Setup ---


// Auth routes (login, register) DO NOT require JWT token yet
app.use('/api/auth', authRouter);

// Apply JWT authentication middleware to all subsequent routes (which DO require a token)
app.use(authenticateJWT); // Ensure this is correctly imported and functional

// Mount other routers to paths
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/games', gamesRouter); // Mount your games router


// Error handling middleware (for thrown or next(err) errors)
app.use(errorHandler);
app.use(errorRouter); // Catch-all for unhandled routes (404 etc.)


// Start the HTTP server (which Socket.IO is now attached to)
httpServer.listen(port, () => {
    console.log(`HTTP and Socket.IO Server running on port ${port}`);
    console.log(`Access backend API at http://localhost:${port}/api`);
});
