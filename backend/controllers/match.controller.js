const matchModel = require('../models/match.model');

const createMatch = async (req, res) => {
    try {
        console.log("HALALAL", req.body)
        const hostId = req.user.id;
        const match = await matchModel.createMatch(hostId);

        res.json({
            success: true,
            roomCode: match.room_code
        });
    } catch (error) {
        console.error('Create match error:', error);
        res.status(500).json({ error: 'Failed to create match' });
    }
};
/*
const joinMatch = async (req, res) => {
    try {
        console.log("HOLOLOLO", req.body)
        const userId = req.user.id;
        const { roomCode } = req.params;

        // Get match by code
        const match = await matchModel.getMatchByCode(roomCode);

        // Check if match is waiting
        if (match.status !== 'waiting') {
            return res.status(400).json({ error: 'Match has already started' });
        }

        // Join the match
        await matchModel.joinMatch(match.id, userId);

        res.json({ success: true });
    } catch (error) {
        console.error('Join match error:', error);
        res.status(400).json({ error: error.message });
    }
};*/

module.exports = {
    createMatch,

};