/**
 * @fileoverview Match model for Matchpoint game show platform
 * @author cc241070
 * @version 1.0.0
 * @description Database operations for match management, player tracking, and game flow
 */

const db = require('../services/database').config;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates a unique 4-letter room code for match identification
 * Uses random letter generation with retry logic for uniqueness
 * 
 * @returns {string} A 4-letter room code (e.g., 'ABCD', 'XYZW')
 * 
 * @example
 * const roomCode = generateRoomCode(); // Returns: 'ABCD'
 */
const generateRoomCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return code;
};

// ============================================================================
// MATCH CREATION AND RETRIEVAL
// ============================================================================

/**
 * Creates a new match in the database with automatic room code generation
 * Handles duplicate room code conflicts with recursive retry logic
 * 
 * @async
 * @param {string} matchName - Display name for the match
 * @param {number} hostId - User ID of the match host
 * @param {Array<number>} [gameSequence=[]] - Array of game IDs to play in order
 * @returns {Promise<Object>} Created match object with room code and metadata
 * 
 * @example
 * const match = await createMatch('Friday Night Games', 123, [1, 3, 5]);
 * // Returns: { id: 456, room_code: 7890, status: 'waiting', ... }
 * 
 * @throws {Error} Database connection or query errors
 */
const createMatch = (matchName, hostId, gameSequence = []) => new Promise((resolve, reject) => {
    const attemptInsert = () => {
        const roomCode = generateRoomCode();
        // Store game sequence as JSON string for database compatibility
        const gameSequenceJson = gameSequence.length > 0 ? JSON.stringify(gameSequence) : null;

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
            gameSequenceJson
        ];

        db.query(sql, params, function (err, result) {
            if (!err) {
                resolve({
                    id: result.insertId,
                    room_code: roomCode,
                    status: 'waiting',
                    current_game_number: 0,
                    matchname: matchName,
                    game_sequence: gameSequence // Return original array for consistency
                });
            } else if (err.code === 'ER_DUP_ENTRY') {
                console.error('Room code already exists. Retrying...');
                attemptInsert(); // Recursive retry for duplicate room codes
            } else {
                console.error('Database error creating match:', err);
                reject(err);
            }
        });
    };
    attemptInsert();
});

/**
 * Retrieves complete match details by room code including players and scores
 * Fetches match metadata, player list, and current scores in a single operation
 * 
 * @async
 * @param {string} roomCode - The unique room code to search for
 * @returns {Promise<Object>} Complete match object with players and scores
 * 
 * @example
 * const match = await getMatchByRoomCode('ABCD');
 * // Returns: {
 * //   id: 456, host_id: 123, room_code: 'ABCD', status: 'waiting',
 * //   players: [{ id: 1, user_id: 123, name: 'John', total_score: 0 }],
 * //   scores: { 1: 0 }, game_sequence: [1, 3, 5]
 * // }
 * 
 * @throws {Error} 'Match not found' if room code doesn't exist
 * @throws {Error} Database connection or query errors
 */
const getMatchByRoomCode = (roomCode) => new Promise((resolve, reject) => {
    // Fetch match metadata
    let sql = "SELECT id, host_id, room_code, status, current_game_number, winner_id, matchname, game_sequence FROM matches WHERE room_code = ?";

    db.query(sql, [roomCode], function (err, result) {
        if (err) {
            console.error('Database error fetching match by roomCode:', err);
            return reject(err);
        } else if (result.length === 0) {
            console.log('No match found for room code:', roomCode);
            return reject(new Error('Match not found'));
        }

        console.log('Match found, raw data from DB:', result[0]);
        const match = result[0];

        // Parse game sequence from JSON or default to empty array
        const parsedGameSequence = Array.isArray(match.game_sequence) ? match.game_sequence : [];

        // Fetch players and their scores
        const playersSql = `
            SELECT mp.id AS id, mp.user_id, u.username AS name, mp.total_score
            FROM match_players AS mp
            JOIN users AS u ON mp.user_id = u.id
            WHERE mp.match_id = ?
            ORDER BY mp.joined_at ASC
        `;

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
                game_sequence: parsedGameSequence,
                players: players,
                scores: scores
            });
        });
    });
});

// ============================================================================
// MATCH UPDATES
// ============================================================================

/**
 * Updates the display name of a match
 * 
 * @async
 * @param {string} roomCode - Room code of the match to update
 * @param {string} matchName - New display name for the match
 * @returns {Promise<Object>} Update result with success status
 * 
 * @example
 * await updateMatchName('1234', 'New Match Name');
 * // Returns: { success: true, affectedRows: 1 }
 * 
 * @throws {Error} 'Match not found or no change' if room code doesn't exist
 * @throws {Error} Database connection or query errors
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

// ============================================================================
// PLAYER MANAGEMENT
// ============================================================================

/**
 * Adds a user as a player to a specific match
 * Prevents duplicate player entries and initializes score to 0
 * 
 * @async
 * @param {number} matchId - Database ID of the match
 * @param {number} userId - User ID to add as player
 * @returns {Promise<Object>} Player entry object with match and user IDs
 * 
 * @example
 * const player = await joinMatch(456, 123);
 * // Returns: { id: 789, match_id: 456, user_id: 123, total_score: 0 }
 * 
 * @throws {Error} Database connection or query errors
 */
const joinMatch = (matchId, userId) => new Promise((resolve, reject) => {
    // Check if player already exists
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

        // Insert new player with initial score of 0
        const insertSql = "INSERT INTO match_players (match_id, user_id, total_score, joined_at) VALUES (?, ?, ?, NOW())";
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

// ============================================================================
// GAME DATA RETRIEVAL
// ============================================================================

/**
 * Fetches game details from the games table by primary ID
 * Used to get game information for the current match phase
 * 
 * @async
 * @param {number} gameId - Primary ID of the game to fetch
 * @returns {Promise<Object|null>} Game object or null if not found
 * 
 * @example
 * const game = await getGameDetailsById(5);
 * // Returns: { id: 5, title: 'Quiz Game', description: '...', game_number: 1, points_value: 10 }
 * 
 * @throws {Error} Database connection or query errors
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
            resolve(null); // Resolve with null for not found
        } else {
            console.log(`Model: Game with ID ${gameId} found:`, result[0]);
            resolve(result[0]);
        }
    });
});

// ============================================================================
// SCORE MANAGEMENT
// ============================================================================

/**
 * Updates scores for multiple players in a specific match
 * Handles batch score updates for game completion
 * 
 * @async
 * @param {number} matchId - Database ID of the match
 * @param {Array<Object>} playerUpdates - Array of score update objects
 * @param {number} playerUpdates[].match_player_id - Player's match entry ID
 * @param {number} playerUpdates[].points_awarded - Points to add to player's score
 * @returns {Promise<void>} Resolves when all updates are completed
 * 
 * @example
 * await updatePlayerScores(456, [
 *   { match_player_id: 1, points_awarded: 10 },
 *   { match_player_id: 2, points_awarded: 5 }
 * ]);
 * 
 * @throws {Error} Database connection or query errors
 */
const updatePlayerScores = (matchId, playerUpdates) => new Promise((resolve, reject) => {
    console.log(`Model: Updating scores for match ${matchId} for players:`, playerUpdates);
    if (!playerUpdates || playerUpdates.length === 0) {
        return resolve();
    }

    // Using Promise.all to update all players concurrently within the same promise resolver.
    // If you need ACID transactions (all or nothing), consider db.beginTransaction/commit/rollback.
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
                    updateResolve(); // Resolve even if no rows affected (player not found, or score didn't change)
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
 * Updates the status and current game number of a match
 * Handles match progression from waiting → in_progress → finished
 * Optionally sets the winner when match is completed
 * 
 * @async
 * @param {number} matchId - Database ID of the match to update
 * @param {string} newStatus - New match status ('waiting', 'in_progress', 'finished')
 * @param {number} newGameIndex - Current game index in sequence (0-based)
 * @param {number|null} [winnerId=null] - Optional winner user ID when match finishes
 * @returns {Promise<Object>} Database update result
 * 
 * @example
 * // Start match
 * await updateMatchProgress(456, 'in_progress', 0);
 * 
 * // Advance to next game
 * await updateMatchProgress(456, 'in_progress', 1);
 * 
 * // Finish match with winner
 * await updateMatchProgress(456, 'finished', 2, 123);
 * 
 * @throws {Error} 'Match not found or no changes made' if match ID doesn't exist
 * @throws {Error} Database connection or query errors
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
    } else {
        sql += `, winner_id = NULL`; // Explicitly set to NULL if no winnerId
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

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
    createMatch,
    getMatchByRoomCode,
    updateMatchName,
    joinMatch,
    getGameDetailsById,
    updatePlayerScores,
    updateMatchProgress
};
