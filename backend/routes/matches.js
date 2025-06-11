const express = require('express');
const router = express.Router();
const matchController = require('../controllers/match.controller');


// Create new match
router.post('/', matchController.createMatch);

// Join existing match
router.post('/:roomCode/join', matchController.joinMatch);

module.exports = router;