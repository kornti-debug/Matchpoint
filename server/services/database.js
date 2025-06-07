// Load environment variables from .env file
require('dotenv').config();

const mysql = require('mysql2');

// Create a connection to the MySQL database using credentials from .env
const config = mysql.createConnection({
    host: "atp.fhstp.ac.at",             // Database host
    port: 8007,                          // Port number
    user: process.env.DB_USERNAME,      // DB username from .env
    password: process.env.DB_PASSWORD,  // DB password from .env
    database: process.env.DB_NAME       // DB name from .env
});

// Connect to the database and log success or throw error
config.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

// Export the connection so other files can use it
module.exports = { config };
