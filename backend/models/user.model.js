// Import constants and modules
const { SALT_ROUNDS } = require("../lib/constants"); // Number of salt rounds for bcrypt
const bcrypt = require("bcrypt"); // Library for password hashing
const db = require("../services/database").config; // Import database connection

// Retrieve all users from the database
const getUsers = () => new Promise((resolve, reject) => {
    db.query("SELECT * FROM users", function (err, users) {
        if (err) {
            console.error(err);
            reject(err); // Reject if an error occurs
        } else {
            resolve(users); // Resolve with list of users
        }
    });
});

// Retrieve a single user by their ID
const getUser = (userId) => new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE id = ?', [parseInt(userId)], function (err, user) {
        if (err || (user || []).length === 0) {
            reject(err); // Reject if an error occurs or user not found
        } else {
            resolve(user[0]); // Resolve with the found user
        }
    });
});

// Update user data in the database (with optional password update)
const updateUser = async (userData) => {
    // Base SQL query and parameters
    let sql = "UPDATE users SET name = ?, surname = ?, hero = ?, email = ?, info = ?";
    const params = [
        userData.name,
        userData.surname,
        userData.hero,
        userData.email,
        userData.info
    ];

    // If a new password was provided, hash it and add to the query
    if (userData.password !== null && userData.password !== undefined && userData.password !== "") {
        const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
        sql += ", password = ?";
        params.push(hashedPassword);
    }

    // Add condition for the specific user ID
    sql += " WHERE id = ?";
    params.push(parseInt(userData.id));

    // Execute the update query
    return new Promise((resolve, reject) => {
        db.query(sql, params, function (err) {
            if (err) {
                console.log(err);
                reject(err); // Reject on error
            }
            resolve(userData); // Resolve with the updated user data
        });
    });
};

// Create a new user in the database
let createUser = (userData) => new Promise((resolve, reject) => {
    // Prepare SQL with escaped values to prevent SQL injection
    let sql = "INSERT INTO users (name, surname, email, password) VALUES (" +
        db.escape(userData.name) + ", " +
        db.escape(userData.surname) + ", " +
        db.escape(userData.email) + ", " +
        db.escape(userData.password) + ")";

    // Execute insert query
    db.query(sql, function (err, result) {
        if (err) {
            reject(err); // Reject on error
        } else {
            resolve(result); // Resolve with insert result (e.g. insertId)
        }
    });
});

// Delete a user from the database by ID
let deleteUser = (id) => new Promise((resolve, reject) => {
    const sql = "DELETE FROM users WHERE id = ?";
    db.query(sql, [parseInt(id)], function (err, result) {
        if (err) {
            reject(err); // Reject on error
        } else {
            resolve(result); // Resolve with result (e.g. affectedRows)
        }
    });
});

// Export all functions so they can be used in other parts of the application
module.exports = {
    getUsers,
    getUser,
    createUser,
    deleteUser,
    updateUser
};
