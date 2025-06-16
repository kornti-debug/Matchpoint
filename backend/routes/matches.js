const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');
const authenticationService = require("../services/authentication");

router.use(authenticationService.authenticateJWT);
// Create new match
router.post('/', matchController.createMatch);

router.route('/:roomCode')
    .get(matchController.getMatchDetails)
    .patch(matchController.updateMatchName)

router.get('/games/:gameNumber', matchController.getGameData)

// Join existing match
router.post('/:roomCode/join', matchController.joinMatch);

router.post('/:roomCode/results', matchController.submitGameResults);

module.exports = router;