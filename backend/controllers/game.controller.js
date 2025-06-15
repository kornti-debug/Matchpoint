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

const createGame =  async (req, res) => {
    try {
        console.log("hah",req.body)
        const result = await gameModel.createGame(req.body)
        res.status(201).json({ success: true, message: 'Game created successfully!', gameId: result.insertId });
    } catch (error) {
        console.error('error at creating game', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to create game.' });
    }
}

const getGameById =  async (req, res) => {
    try {
        const id = parseInt(req.params.id)
        const result = await gameModel.getGameById(id)
        res.status(201).json({ success: true, result});
    } catch (error) {
        console.error('error at creating game', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to get game.' });
    }
}

const deleteGame = async (req, res) => {
    try {
        const gameId = parseInt(req.params.id, 10);
        if (isNaN(gameId)) {
            return res.status(400).json({ success: false, error: 'Invalid game ID provided.' });
        }

        await gameModel.deleteGame(gameId); // Call the model function
        res.json({ success: true, message: 'Game deleted successfully!' });
    } catch (error) {
        console.error('Error deleting game:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: error.message || 'Failed to delete game.' });
    }
};

const updateGame = async (req, res) => {
    try {
        const gameId = parseInt(req.params.id, 10);
        if (isNaN(gameId)) {
            return res.status(400).json({ success: false, error: 'Invalid game ID provided.' });
        }

        const { title, description, game_number, points_value } = req.body;

        // Basic validation: Check for required fields
        if (!title || !description || game_number === undefined || points_value === undefined) {
            return res.status(400).json({ success: false, error: 'Missing required game fields.' });
        }
        if (isNaN(parseInt(game_number, 10)) || isNaN(parseInt(points_value, 10))) {
            return res.status(400).json({ success: false, error: 'Game number and points value must be valid numbers.' });
        }

        const gameDataToUpdate = {
            title,
            description,
            game_number: parseInt(game_number, 10), // Ensure numbers are numbers
            points_value: parseInt(points_value, 10)
        };

        await gameModel.updateGame(gameId, gameDataToUpdate);
        res.json({ success: true, message: 'Game updated successfully!' });
    } catch (error) {
        console.error('Error updating game:', error);
        if (error.message.includes('not found') || error.message.includes('no changes')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        res.status(500).json({ success: false, error: error.message || 'Failed to update game.' });
    }
};


module.exports = {
    getAllGames,
    createGame,
    getGameById,
    updateGame,
    deleteGame
    // Add other CRUD controller functions here later
};