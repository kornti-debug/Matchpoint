const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.route('/login').post(authController.processLogin);

router.route('/register').post(authController.processRegistration);

// Logout: clear token and redirect to home
router.get('/logout', (req, res) => {
    res.cookie('accessToken', '', { maxAge: 0 });
});

module.exports = router;
