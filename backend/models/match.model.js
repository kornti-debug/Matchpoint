const db = require('../services/database'); // Your database connection

// Create a new match
const createMatch = (hostId) => new Promise((resolve, reject) => {
    const roomCode = generateRoomCode();

    let sql = "INSERT INTO matches (host_id, room_code, status) VALUES (" +
        db.escape(hostId) + ", " +
        db.escape(roomCode) + ", " +
        db.escape('waiting') + ")";

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

// Get match by room code
const getMatchByCode = (roomCode) => new Promise((resolve, reject) => {
    let sql = "SELECT * FROM matches WHERE room_code = " + db.escape(roomCode);

    db.query(sql, function (err, result) {
        if (err) {
            reject(err);
        } else if (result.length === 0) {
            reject(new Error('Match not found'));
        } else {
            resolve(result[0]); // Return first match found
        }
    });
});

// Join a match (add player to match_players table)
const joinMatch = (matchId, userId) => new Promise((resolve, reject) => {
    // First check if match is full
    let checkSql = "SELECT COUNT(*) as player_count FROM match_players WHERE match_id = " + db.escape(matchId);

    db.query(checkSql, function (err, result) {
        if (err) {
            reject(err);
        } else if (result[0].player_count >= 2) {
            reject(new Error('Match is full'));
        } else {
            // Add player to match
            let joinSql = "INSERT INTO match_players (match_id, user_id, total_score) VALUES (" +
                db.escape(matchId) + ", " +
                db.escape(userId) + ", " +
                db.escape(0) + ")";

            db.query(joinSql, function (err, joinResult) {
                if (err) {
                    reject(err);
                } else {
                    resolve(joinResult);
                }
            });
        }
    });
});

// Helper function to generate room code
const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

module.exports = {
    createMatch,
    getMatchByCode,
    joinMatch
};