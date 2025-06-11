const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const authService = require('../services/authentication');

router.use(authService.authenticateJWT);

// Create new match
router.post('/', matchController.createMatch);

// Join existing match
router.post('/:roomCode/join', matchController.joinMatch);

module.exports = router;