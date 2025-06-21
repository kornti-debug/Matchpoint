// Load environment variables from .env file
require('dotenv').config();

const mysql = require('mysql2');

// Create a connection pool instead of a single connection
// This handles timeouts, reconnections, and multiple concurrent requests
const config = mysql.createPool({
    host: "atp.fhstp.ac.at",             // Database host
    port: 8007,                          // Port number
    user: process.env.DB_USERNAME,      // DB username from .env
    password: process.env.DB_PASSWORD,  // DB password from .env
    database: process.env.DB_NAME,      // DB name from .env
    
    // Pool configuration
    connectionLimit: 10,                 // Maximum number of connections in pool
    acquireTimeout: 60000,              // Time to acquire connection (60 seconds)
    waitForConnections: true,           // Wait for available connection if pool is full
    
    // Connection timeout settings
    connectTimeout: 60000,              // Connection timeout (60 seconds)
    
    // Keep connections alive
    keepAliveInitialDelay: 0,           // Start keep-alive immediately
    enableKeepAlive: true,              // Enable keep-alive
});

// Test the pool connection
config.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
    console.log('Database pool connected successfully!');
    connection.release(); // Release the test connection back to the pool
});

// Export the pool so other files can use it
module.exports = { config };
