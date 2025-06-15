const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000

app.use(cors());
app.use(express.json());


const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Load environment variables and external services
require('bcrypt');
require('./services/database');        // Connect to MySQL database

// Middleware to handle cookies and incoming request bodies
app.use(cookieParser());
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data



// Route imports
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const errorRouter = require('./routes/error');
const authRouter = require('./routes/auth');
const matchesRouter = require('./routes/matches')
const gamesRouter = require('./routes/games')



const { errorHandler } = require('./middlewares/error-handler.middleware');
const { extractUserFromToken } = require('./middlewares/extract-from-jwt.middleware');

// Custom middleware to extract user data from JWT token in cookie
app.use(extractUserFromToken);

// Set template variables globally for authentication & admin state
app.use((req, res, next) => {
    res.locals.isAuthenticated = !!req.profile; // true if user is logged in
    res.locals.isAdmin = req.profile && req.profile.role === 'admin';
    next();
});

// Mount routers to paths
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/matches', matchesRouter)
app.use('/api/games', gamesRouter)

// Error handling middleware (for thrown or next(err) errors)
app.use(errorHandler);
app.use(errorRouter); // Catch-all for unhandled routes (404 etc.)



// Start the backend
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
