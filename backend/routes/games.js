// backend/routes/games.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game.controller');
const authenticationService = require("../services/authentication");

// Apply JWT authentication middleware (optional, but good for admin panel)
router.use(authenticationService.authenticateJWT);

// GET all games
router.get('/', gameController.getAllGames);

router.post('/create', gameController.createGame)

router.get('/:id', gameController.getGameById)

router.put('/:id', gameController.updateGame)

router.delete('/:id', gameController.deleteGame)

// Add other CRUD routes (POST, PUT, DELETE) here later

module.exports = router;