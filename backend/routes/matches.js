// routes/matches.js
const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const authenticationService = require("../services/authentication");

// Apply JWT authentication middleware to all match routes
router.use(authenticationService.authenticateJWT);

// Create new match (now expects gameSequence in body)
router.post('/', matchController.createMatch);

// Get match details and update match name
router.route('/:roomCode')
    .get(matchController.getMatchDetails)
    .patch(matchController.updateMatchName); // Using PATCH for partial update (match name)

// Join existing match
router.post('/:roomCode/join', matchController.joinMatch);

// Submit game results for a match
router.post('/:roomCode/results', matchController.submitGameResults);

// Get game details by ID (used for current game display)
// NOTE: Renamed param from :gameNumber to :gameId for clarity and consistency with controller
router.get('/games/:gameId', matchController.getGameData);

// Start a match (sets status to 'in_progress', current_game_number to 0)
router.post('/:roomCode/start', matchController.startMatch);

// Advance to next game (updates current_game_number index, and status)
router.post('/:roomCode/next-game', matchController.nextGame);

module.exports = router;
