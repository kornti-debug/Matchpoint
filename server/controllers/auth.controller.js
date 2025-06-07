const userModel = require('../models/user.model');
const authenticationService = require('../services/authentication');
const bcrypt = require('bcrypt');
const {SALT_ROUNDS} = require("../lib/constants");
const {createError} = require("../lib/error");

// Render the login page
function getLoginPage(req, res) {
    res.render('login');
}

// Process login form submission
// Fetch all users and then authenticate the user with given credentials
function processLogin(req, res, next) {
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Request body:', req.body);
    console.log('Headers:', req.headers);
    userModel.getUsers()
        .then((users) =>
            authenticationService.authenticateUser(req.body, users, res)
        )
        .catch((err) => {
            console.error(err);
            next(createError())
        })
}

// Render the registration page
function getRegisterPage(req, res) {
    res.render('register');
}

// Process registration form submission
// Hash the password, create the new user, then authenticate and log them in
async function processRegistration(req, res) {
    const password = req.body.password;
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const userData = {
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        hero: req.body.hero,
        info: req.body.info,
        password: hash
    };

    userModel.createUser(userData)
        .then(() => userModel.getUsers())
        .then((users) => {
            authenticationService.authenticateUser({email: userData.email, password: password}, users, res)
        })
        .catch(error => {
            console.error(error);
            res.status(500).send('Registration failed. Please try again.');
        });
}

module.exports = {
    getLoginPage,
    processLogin,
    getRegisterPage,
    processRegistration
};
