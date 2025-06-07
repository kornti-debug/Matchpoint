// Controller functions for user-related routes

const userModel = require("../models/user.model");
const {createError} = require("../lib/error");

// Show list of all users
function getUsers(req, res, next) {
    userModel.getUsers()
        .then(users => res.render('users', {users}))
        .catch(() => next(createError(500)))
}

// Show details of one user by ID
function getUser(req, res, next) {
    const id = parseInt(req.params.id);
    userModel.getUser(id)
        .then(user => res.render('user', {user}))
        .catch(() => next(createError(404)))
}

// Show edit form for a user (also passes current user's image ID)
function editUser(req, res, next) {
    const imageId = req.user.imageId;
    userModel.getUser(req.params.id)
        .then(user => res.render('editUser', {user, imageId}))
        .catch(() => next(createError(500)))
}

// Update user details based on form submission
function updateUser(req, res, next) {
    userModel.updateUser(req.body)
        .then(user => res.render('user', {user}))
        .catch(() => next(createError(500)))
}

// Show form to add a new user
function addUser(req, res) {
    res.render('addUser');
}

// Create a new user and redirect to user list
function createUser(req, res, next) {
    userModel.createUser(req.body)
        .then(() => res.redirect('/users'))
        .catch(error => {
            console.log(error);
            next(createError(500))
        });
}

// Delete a user by ID and send JSON success response
function deleteUser(req, res, next) {
    const userId = req.params.id;
    userModel.deleteUser(userId)
        .then(() => res.status(200).json({ success: true }))
        .catch(error => {
            console.log(error);
            next(createError(500))
        });
}

module.exports = {
    getUsers,
    getUser,
    editUser,
    updateUser,
    addUser,
    createUser,
    deleteUser
}
