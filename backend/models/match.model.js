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
    console.log('Model: Searching for room code:', roomCode);

    let sql = "SELECT * FROM matches WHERE room_code = ?";

    db.query(sql, [roomCode], function (err, result) {

        if (err) {
            console.log('Database error:', err);
            reject(err);
        } else if (result.length === 0) {
            console.log('No match found for room code:', roomCode);
            reject(new Error('Match not found'));
        } else {
            console.log('Match found, returning:', result[0]);
            resolve(result[0]);
        }
    });
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


// Helper function to generate room code
const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

module.exports = {
    createMatch,
    getMatchByRoomCode,
    updateMatchName
};