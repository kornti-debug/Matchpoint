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

// Helper function to generate room code
const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

module.exports = {
    createMatch
};