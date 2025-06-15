// backend/models/game.model.js
const db = require('../services/database').config;

/**
 * Retrieves all games from the 'games' table.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of game objects.
 */
const getAllGames = () => new Promise((resolve, reject) => {
    console.log('Game Model: Fetching all games from database...');
    const sql = `SELECT id, title, description, game_number, points_value FROM games ORDER BY game_number ASC`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error fetching all games:', err);
            reject(err);
        } else {
            console.log(`Game Model: Found ${results.length} games.`);
            resolve(results);
        }
    });
});

module.exports = {
    getAllGames,
    // Add other CRUD functions (getById, create, update, delete) here later
};