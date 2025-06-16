const {parse} = require("dotenv");
const db = require('../services/database').config; // Your database connection

// Create a new match
const createMatch = (matchName, hostId) => new Promise((resolve, reject) => {
    const roomCode = generateRoomCode();

    let sql = "INSERT INTO matches (host_id, room_code, status, matchname) VALUES (" +
        db.escape(hostId) + ", " +
        db.escape(roomCode) + ", " +
        db.escape('waiting') + ", " +
        db.escape(matchName) + ")";


    db.query(sql, function (err, result) {
        if (err) {
            reject(err);
        } else {
            resolve({
                id: result.insertId,
                room_code: roomCode,
                status: 'waiting'
            });
        }
    });
});

const getMatchByRoomCode = (roomCode) => new Promise((resolve, reject) => {
    let sql = "SELECT id, host_id, room_code, status, current_game_number, winner_id, matchname FROM matches WHERE room_code = ?"; // Select all necessary fields

    db.query(sql, [roomCode], function (err, result) {
        if (err) {
            console.error('Database error:', err);
            return reject(err); // Ensure the outer Promise rejects on error
        } else if (result.length === 0) {
            console.log('No match found for room code:', roomCode);
            return reject(new Error('Match not found')); // Ensure the outer Promise rejects
        } else {
            console.log('Match found, returning:', result[0]);
            const match = result[0]; // 'match' is now defined in this scope

            // --- NESTED CODE STARTS HERE ---
            // Now that 'match' is defined, we can query for players
            const playersSql = `
                SELECT mp.id AS id, mp.user_id, u.username AS name, mp.total_score
                FROM match_players AS mp
                         JOIN users AS u ON mp.user_id = u.id
                WHERE mp.match_id = ?
                ORDER BY mp.joined_at ASC`; // Ordering helps consistent display

            db.query(playersSql, [match.id], (playersErr, playersResult) => {
                if (playersErr) {
                    console.error('Database error fetching players for match:', playersErr);
                    return reject(playersErr); // Reject the main promise if player fetch fails
                }

                const players = playersResult; // `playersResult` will be an array of player objects
                const scores = {}; // Initialize scores object

                // Populate the scores object
                players.forEach(player => {
                    scores[player.id] = player.total_score;
                });

                // Resolve the main getMatchByRoomCode promise with the full, enriched match object
                resolve({
                    id: match.id,
                    host_id: match.host_id,
                    room_code: match.room_code,
                    status: match.status,
                    current_game_number: match.current_game_number,
                    matchname: match.matchname,
                    players: players, // Add the fetched players array
                    scores: scores    // Add the constructed scores object
                });
            });
            // --- NESTED CODE ENDS HERE ---
        }
    });
    // The previous playersSql and db.query were here, which was the issue.
    // They must be inside the 'else' block of the first query.
});

const updateMatchName = async (roomCode, matchName) => {
    let sql = "UPDATE matches SET matchname = ? WHERE room_code = ?";
    const params = [matchName, roomCode];

    return new Promise((resolve, reject) => {
        db.query(sql, params, function (err, result) {
            if (err) {
                console.log(err);
                reject(err);
            } else if (result.affectedRows === 0) {
                reject(new Error('Match not found'));
            } else {
                resolve({ success: true, affectedRows: result.affectedRows });
            }
        });
    });
};

const updatePlayerScores = (matchId, playerUpdates) => new Promise((resolve, reject) => {
    console.log(`Model: Updating scores for match ${matchId} for players:`, playerUpdates);
    if (!playerUpdates || playerUpdates.length === 0) {
        return resolve(); // No updates to perform
    }

    // We'll execute updates individually for simplicity. For robustness, a transaction would be better.
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
                    updateResolve(); // Resolve even if no rows affected (player not found or already has points)
                } else {
                    console.log(`Updated score for player ${update.match_player_id}. Affected rows: ${result.affectedRows}`);
                    updateResolve(result);
                }
            });
        });
    });

    // Use Promise.all to wait for all individual update promises to complete
    Promise.all(promises)
        .then(() => resolve()) // Resolve the main promise once all updates are done
        .catch(err => reject(err)); // Reject if any individual update fails
});

const getGameDetails = (gameNumber) => new Promise((resolve, reject) => {

    let sql = "SELECT * FROM games WHERE game_number = ?";

    db.query(sql, [gameNumber], function (err, result) {

        if (err) {
            console.log('Database error:', err);
            reject(err);
        } else if (result.length === 0) {
            console.log('No game found with gamenumber:', gameNumber);
            reject(new Error('game not found'));
        } else {
            console.log('game found, returning:', result[0]);
            resolve(result[0]);
        }
    });
});

const joinMatch = (matchId, userId) => new Promise((resolve, reject) => {
    // Check if the user is already in this match
    const checkSql = "SELECT * FROM match_players WHERE match_id = ? AND user_id = ?";
    db.query(checkSql, [matchId, userId], (err, result) => {
        if (err) {
            return reject(err);
        }
        if (result.length > 0) {
            // User already joined
            return resolve(result[0]); // Return existing player entry
        }

        // If not, insert new player into the `players` table
        const insertSql = "INSERT INTO match_players (match_id, user_id) VALUES (?, ?)";
        db.query(insertSql, [matchId, userId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                console.log("JAJA",result)
                resolve({
                    id: result.insertId, // ID of the new player entry in the players table
                    match_id: matchId,
                    user_id: userId
                });
            }
        });
    });
});



// Helper function to generate room code
const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

module.exports = {
    createMatch,
    getMatchByRoomCode,
    updateMatchName,
    getGameDetails,
    joinMatch,
    updatePlayerScores
};