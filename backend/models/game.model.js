// backend/models/game.model.js
const db = require('../services/database').config;

/**
 * Retrieves all games from the 'games' table.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of game objects.
 */
const getAllGames = () => new Promise((resolve, reject) => {
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

// Retrieve a single game by their ID
const getGameById = (gameId) => new Promise((resolve, reject) => {
    db.query('SELECT * FROM games WHERE id = ?', [parseInt(gameId)], function (err, result) {
        if (err || (result || []).length === 0) {
            reject(err); // Reject if an error occurs or user not found
        } else {
            resolve(result[0]); // Resolve with the found user
        }
    });
});

const createGame = (gameData) => new Promise((resolve, reject) => {
    let sql = "INSERT INTO games (title, description, game_number, points_value) VALUES (" +
        db.escape(gameData.title) + ", " +
        db.escape(gameData.description) + ", " +
        db.escape(gameData.game_number) + ", " +
        db.escape(gameData.points_value) + ")";

    db.query(sql, function (err, result){
        if(err){
            reject(err);
        } else {
            resolve(result)
        }
    })
})

// backend/models/game.model.js (add to existing content)
// ... (your existing getAllGames, createGame, getGameById, updateGame functions) ...

/**
 * Deletes a game from the database by ID.
 * @param {number} gameId - The ID of the game to delete.
 * @returns {Promise<Object>} A promise that resolves with the database result (e.g., affectedRows).
 */
const deleteGame = (gameId) => new Promise((resolve, reject) => {
    console.log(`Model: Deleting game with ID ${gameId}`);
    const sql = `DELETE FROM games WHERE id = ?`;
    db.query(sql, [gameId], function (err, result) {
        if (err) {
            console.error('Database error deleting game:', err);
            reject(err);
        } else if (result.affectedRows === 0) {
            // If no rows were affected, it means the gameId didn't exist
            reject(new Error(`Game with ID ${gameId} not found.`));
        } else {
            console.log(`Model: Game ${gameId} deleted. Affected rows: ${result.affectedRows}`);
            resolve(result);
        }
    });
});

const updateGame = (gameId, { title, description, game_number, points_value }) => new Promise((resolve, reject) => {
    console.log(`Model: Updating game with ID ${gameId}`);
    const sql = `
        UPDATE games
        SET
            title = ?,
            description = ?,
            game_number = ?,
            points_value = ?
        WHERE id = ?
    `;
    const params = [title, description, game_number, points_value, gameId];

    db.query(sql, params, function (err, result) {
        if (err) {
            console.error('Database error updating game:', err);
            reject(err);
        } else if (result.affectedRows === 0) {
            // If no rows were affected, it means the gameId didn't exist
            reject(new Error(`Game with ID ${gameId} not found or no changes made.`));
        } else {
            console.log(`Model: Game ${gameId} updated. Affected rows: ${result.affectedRows}`);
            resolve(result); // Resolves with { affectedRows: 1, changedRows: 1, etc. }
        }
    });
});

module.exports = {
    getAllGames,
    createGame,
    getGameById,
    updateGame,
    deleteGame
    // Add other CRUD functions (getById, create, update, delete) here later
};

