// backend/routes/games.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const authenticationService = require("../services/authentication");

// Apply JWT authentication middleware (optional, but good for admin panel)
router.use(authenticationService.authenticateJWT);

// GET all games
router.get('/', gameController.getAllGames);

// Add other CRUD routes (POST, PUT, DELETE) here later

module.exports = router;