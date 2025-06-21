// routes/matches.js
const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const authenticationService = require("../services/authentication");
const { normalizeRoomCode } = require('../middlewares/roomCodeNormalizer');

// Apply JWT authentication middleware to all match routes
router.use(authenticationService.authenticateJWT);

// Create new match (now expects gameSequence in body)
router.post('/', matchController.createMatch);

// Get match details and update match name
router.route('/:roomCode')
    .get(normalizeRoomCode, matchController.getMatchDetails)
    .patch(normalizeRoomCode, matchController.updateMatchName); // Using PATCH for partial update (match name)

// Join existing match
router.post('/:roomCode/join', normalizeRoomCode, matchController.joinMatch);

// Submit game results for a match
router.post('/:roomCode/results', normalizeRoomCode, matchController.submitGameResults);

// Get game details by ID (used for current game display)
// NOTE: Renamed param from :gameNumber to :gameId for clarity and consistency with controller
router.get('/games/:gameId', matchController.getGameData);

// Start a match (sets status to 'in_progress', current_game_number to 0)
router.post('/:roomCode/start', normalizeRoomCode, matchController.startMatch);

// Advance to next game (updates current_game_number index, and status)
router.post('/:roomCode/next-game', normalizeRoomCode, matchController.nextGame);

module.exports = router;
