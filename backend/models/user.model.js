/**
 * @fileoverview User model for Matchpoint game show platform
 * @author cc241070
 * @version 1.0.0
 * @description Database operations for user authentication and profile management
 */

// Import constants and modules
const { SALT_ROUNDS } = require("../lib/constants"); // Number of salt rounds for bcrypt
const bcrypt = require("bcrypt"); // Library for password hashing
const db = require("../services/database").config; // Import database connection

// ============================================================================
// USER AUTHENTICATION
// ============================================================================

/**
 * Creates a new user account with hashed password
 * Used for user registration during signup process
 * 
 * @async
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Unique username for the account
 * @param {string} userData.password - Plain text password to hash
 * @returns {Promise<Object>} Database insert result with user ID
 * 
 * @example
 * const result = await createUser({ username: 'john_doe', password: 'secure123' });
 * // Returns: { insertId: 123, affectedRows: 1 }
 * 
 * @throws {Error} Database connection or query errors
 * @throws {Error} Duplicate username constraint violations
 */
const createUser = (userData) => new Promise((resolve, reject) => {
    console.log('Creating user:', userData.username);
    
    // Prepare SQL with escaped values to prevent SQL injection
    let sql = "INSERT INTO users (username, password) VALUES (" +
        db.escape(userData.username) + ", " +
        db.escape(userData.password) + ")";

    // Execute insert query
    db.query(sql, function (err, result) {
        if (err) {
            reject(err);
        } else {
            resolve(result);
        }
    });
});

// ============================================================================
// USER RETRIEVAL
// ============================================================================

/**
 * Retrieves all users from the database
 * Used for authentication to check credentials and username uniqueness
 * 
 * @async
 * @returns {Promise<Array>} Array of all user objects
 * 
 * @example
 * const users = await getUsers();
 * // Returns: [{ id: 1, username: 'john_doe', ... }, { id: 2, username: 'jane_doe', ... }]
 * 
 * @throws {Error} Database connection or query errors
 */
const getUsers = () => new Promise((resolve, reject) => {
    db.query("SELECT * FROM users", function (err, users) {
        if (err) {
            console.error(err);
            reject(err);
        } else {
            resolve(users);
        }
    });
});

/**
 * Retrieves a user by their database ID
 * Used to fetch user details for match operations
 * 
 * @async
 * @param {number} userId - Database ID of the user to fetch
 * @returns {Promise<Object|null>} User object or null if not found
 * 
 * @example
 * const user = await getUserById(123);
 * // Returns: { id: 123, username: 'john_doe', ... }
 * 
 * @throws {Error} Database connection or query errors
 */
const getUserById = (userId) => new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE id = ?', [parseInt(userId)], function (err, user) {
        if (err || (user || []).length === 0) {
            reject(err);
        } else {
            resolve(user[0]);
        }
    });
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
    createUser,
    getUsers,
    getUserById
};
