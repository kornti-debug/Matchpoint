const express = require("express");
const errorController = require("../controllers/error.controller");
const router = express.Router();

// Catch-all route for undefined paths (404)
// Runs for any HTTP method and any unmatched route
router.use((req, res, next) => {
    // This handles any route that hasn't been matched yet
    errorController.showErrorPage(req, res);
});

module.exports = router;
