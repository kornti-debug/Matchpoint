const express = require("express");
const userController = require("../controllers/users.controller");
const router = express.Router();


// Routes for adding and creating a new user
router.get('/add', userController.addUser);
router.post('/create', userController.createUser);


// Routes for getting, updating, and deleting a specific user
router.route('/:id')
    .get(userController.getUser)       // Show user details
    .post(userController.updateUser)   // Update user data
    .delete(userController.deleteUser) // Delete user

// Route for showing the edit form for a user
router.route('/:id/edit')
    .get(userController.editUser);


module.exports = router;
