const userModel = require('../models/user.model');
const authenticationService = require('../services/authentication');
const bcrypt = require('bcrypt');
const {SALT_ROUNDS} = require("../lib/constants");
const {createError} = require("../lib/error");
const jwt = require('jsonwebtoken');
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;


// Process login form submission
// Fetch all users and then authenticate the user with given credentials
function processLogin(req, res, next) {
    userModel.getUsers()
        .then((users) =>
            authenticationService.authenticateUser(req.body, users, res)
        )
        .catch((err) => {
            console.error(err);
            next(createError())
        })
}


// Process registration form submission
// Hash the password, create the new user, then authenticate and log them in
async function processRegistration(req, res) {

    try {
        // First check if username already exists
        const users = await userModel.getUsers();
        const existingUser = users.find(user => user.username === req.body.username);

        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists' });
        }

    const password = req.body.password;
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    console.log("HALLO ", req.body);
    const userData = {

        username: req.body.username,
        password: hash
    };

        const newUser = await userModel.createUser(userData);

        // Create token immediately without authentication check
        const accessToken = jwt.sign({
            id: newUser.id, // Assuming createUser returns the new user with ID
            username: req.body.username,
        }, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        res.json({
            message: 'Registration successful',
            token: accessToken,
            user: {
                id: newUser.id,
                username: req.body.username
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed. Please try again.' });
    }
}

module.exports = {
    processLogin,
    processRegistration
};
