// models/match.model.js
const db = require('../services/database').config;

// Helper function to generate room code
const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

/**
 * Creates a new match in the database with an optional game sequence.
 * @param {string} matchName - Name of the match.
 * @param {number} hostId - ID of the host user.
 * @param {Array<number>} [gameSequence=[]] - Optional array of game IDs for the match sequence.
 */
const createMatch = (matchName, hostId, gameSequence = []) => new Promise((resolve, reject) => {
    const roomCode = generateRoomCode();
    const sql = `
        INSERT INTO matches (host_id, room_code, status, matchname, current_game_number, game_sequence)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
        hostId,
        roomCode,
        'waiting',
        matchName,
        0, // Start at game index 0 (first game in sequence)
        gameSequence.length > 0 ? JSON.stringify(gameSequence) : null // Store as JSON string or NULL
    ];

    db.query(sql, params, function (err, result) {
        if (err) {
            console.error('Database error creating match:', err);
            reject(err);
        } else {
            resolve({
                id: result.insertId,
                room_code: roomCode,
                status: 'waiting',
                current_game_number: 0, // Resolve with index 0
                matchname: matchName,
                game_sequence: gameSequence // Return the original array for consistency
            });
        }
    });
});

/**
 * Retrieves full match details by room code, including players, scores, and game sequence.
 */
const getMatchByRoomCode = (roomCode) => new Promise((resolve, reject) => {
    let sql = "SELECT id, host_id, room_code, status, current_game_number, winner_id, matchname, game_sequence FROM matches WHERE room_code = ?";

    db.query(sql, [roomCode], function (err, result) {
        if (err) {
            console.error('Database error:', err);
            return reject(err);
        } else if (result.length === 0) {
            console.log('No match found for room code:', roomCode);
            return reject(new Error('Match not found'));
        } else {
            console.log('Match found, returning:', result[0]);
            const match = result[0];

            // --- FIX HERE: Remove JSON.parse() as the driver already does it ---
            // match.game_sequence is ALREADY a JavaScript Array (or null/undefined)
            const parsedGameSequence = match.game_sequence || [];
            // --- END FIX ---

            const playersSql = `
                SELECT mp.id AS id, mp.user_id, u.username AS name, mp.total_score
                FROM match_players AS mp
                         JOIN users AS u ON mp.user_id = u.id
                WHERE mp.match_id = ?
                ORDER BY mp.joined_at ASC`;

            db.query(playersSql, [match.id], (playersErr, playersResult) => {
                if (playersErr) {
                    console.error('Database error fetching players for match:', playersErr);
                    return reject(playersErr);
                }

                const players = playersResult;
                const scores = {};
                players.forEach(player => {
                    scores[player.id] = player.total_score;
                });

                resolve({
                    id: match.id,
                    host_id: match.host_id,
                    room_code: match.room_code,
                    status: match.status,
                    current_game_number: match.current_game_number,
                    matchname: match.matchname,
                    winner_id: match.winner_id,
                    game_sequence: parsedGameSequence, // Use the directly obtained array
                    players: players,
                    scores: scores
                });
            });
        }
    });
});

/**
 * Updates the name of a match.
 */
const updateMatchName = (roomCode, matchName) => new Promise((resolve, reject) => {
    const sql = "UPDATE matches SET matchname = ? WHERE room_code = ?";
    const params = [matchName, roomCode];

    db.query(sql, params, function (err, result) {
        if (err) {
            console.error('Database error updating match name:', err);
            reject(err);
        } else if (result.affectedRows === 0) {
            reject(new Error('Match not found or no change'));
        } else {
            resolve({ success: true, affectedRows: result.affectedRows });
        }
    });
});

/**
 * Adds a user as a player to a specific match in the match_players table.
 */
const joinMatch = (matchId, userId) => new Promise((resolve, reject) => {
    const checkSql = "SELECT id, match_id, user_id, total_score FROM match_players WHERE match_id = ? AND user_id = ?";
    db.query(checkSql, [matchId, userId], (err, result) => {
        if (err) {
            console.error('Database error checking existing player:', err);
            return reject(err);
        }
        if (result.length > 0) {
            // Player already joined, return existing entry
            return resolve(result[0]);
        }

        const insertSql = "INSERT INTO match_players (match_id, user_id, total_score, joined_at) VALUES (?, ?, ?, NOW())"; // Added joined_at
        db.query(insertSql, [matchId, userId, 0], (err, result) => {
            if (err) {
                console.error('Database error inserting new player:', err);
                reject(err);
            } else {
                resolve({
                    id: result.insertId,
                    match_id: matchId,
                    user_id: userId,
                    total_score: 0
                });
            }
        });
    });
});

/**
 * Fetches game details from the 'games' table by its primary ID.
 * THIS FUNCTION NOW QUERIES BY GAME ID, NOT GAME NUMBER.
 * @param {number} gameId - The primary ID of the game to fetch.
 * @returns {Promise<Object>} Game object containing id, title, description, game_number, points_value.
 */
const getGameDetailsById = (gameId) => new Promise((resolve, reject) => {
    console.log(`Model: Fetching game details for ID: ${gameId}`);
    const sql = `
        SELECT id, title, description, game_number, points_value
        FROM games
        WHERE id = ?
    `;
    db.query(sql, [gameId], (err, result) => {
        if (err) {
            console.error('Database error fetching game details by ID:', err);
            reject(err);
        } else if (result.length === 0) {
            console.warn(`No game found for ID: ${gameId}`);
            reject(new Error(`Game with ID ${gameId} not found.`));
        } else {
            console.log(`Model: Game with ID ${gameId} found:`, result[0]);
            resolve(result[0]);
        }
    });
});

/**
 * Updates scores for multiple players in a specific match.
 * @param {number} matchId - The ID of the match.
 * @param {Array<Object>} playerUpdates - Array of { match_player_id, points_awarded }.
 * @returns {Promise<void>} A promise that resolves when all updates are attempted.
 */
const updatePlayerScores = (matchId, playerUpdates) => new Promise((resolve, reject) => {
    console.log(`Model: Updating scores for match ${matchId} for players:`, playerUpdates);
    if (!playerUpdates || playerUpdates.length === 0) {
        return resolve();
    }

    const promises = playerUpdates.map(update => {
        return new Promise((updateResolve, updateReject) => {
            const sql = `
                UPDATE match_players
                SET total_score = total_score + ?
                WHERE id = ? AND match_id = ?
            `;
            const params = [update.points_awarded, update.match_player_id, matchId];
            db.query(sql, params, (err, result) => {
                if (err) {
                    console.error(`Database error updating score for player ${update.match_player_id}:`, err);
                    updateReject(err);
                } else if (result.affectedRows === 0) {
                    console.warn(`No player found or no change for match_player_id ${update.match_player_id} in match ${matchId}.`);
                    updateResolve();
                } else {
                    console.log(`Updated score for player ${update.match_player_id}. Affected rows: ${result.affectedRows}`);
                    updateResolve(result);
                }
            });
        });
    });

    Promise.all(promises)
        .then(() => resolve())
        .catch(err => reject(err));
});

/**
 * Updates the status and current game number (index in sequence) of a match.
 * @param {number} matchId - The ID of the match to update.
 * @param {string} newStatus - The new status of the match ('in_progress', 'finished', etc.).
 * @param {number} newGameIndex - The current game index in the sequence (0-based).
 * @param {number | null} [winnerId=null] - Optional ID of the overall match winner.
 * @returns {Promise<Object>} A promise that resolves with the database result.
 */
const updateMatchProgress = (matchId, newStatus, newGameIndex, winnerId = null) => new Promise((resolve, reject) => {
    console.log(`Model: Updating match ${matchId} to status '${newStatus}', game index ${newGameIndex}`);
    let sql = `
        UPDATE matches
        SET status = ?, current_game_number = ?
    `;
    const params = [newStatus, newGameIndex];

    if (winnerId !== null) {
        sql += `, winner_id = ?`; // Add winner_id update if provided
        params.push(winnerId);
    }

    sql += ` WHERE id = ?`; // Add WHERE clause at the end
    params.push(matchId);


    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Database error updating match progress:', err);
            reject(err);
        } else if (result.affectedRows === 0) {
            reject(new Error(`Match with ID ${matchId} not found or no changes made.`));
        } else {
            resolve(result);
        }
    });
});


module.exports = {
    createMatch,
    getMatchByRoomCode,
    updateMatchName,
    joinMatch,
    getGameDetailsById, // Export the updated function name
    updatePlayerScores,
    updateMatchProgress
};
