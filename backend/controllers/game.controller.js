// backend/controllers/game.controller.js
const gameModel = require('../models/game.model'); // Import the new game model

/**
 * Handles fetching all games.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getAllGames = async (req, res) => {
    try {
        const games = await gameModel.getAllGames();
        res.json({ success: true, games: games });
    } catch (error) {
        console.error('Get all games error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to retrieve games.' });
    }
};

module.exports = {
    getAllGames,
    // Add other CRUD controller functions here later
};