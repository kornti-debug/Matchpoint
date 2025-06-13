const matchModel = require('../models/match.model');

const createMatch = async (req, res) => {
    try {
        const hostId = req.user.id;
        const matchName = req.body.matchName
        const match = await matchModel.createMatch(matchName,hostId);

        res.json({
            success: true,
            roomCode: match.room_code
        });
    } catch (error) {
        console.error('Create match error:', error);
        res.status(500).json({ error: 'Failed to create match' });
    }
};

const getMatchDetails = async (req,res) => {
    try{
        const roomCode = req.params.roomCode;
        const match = await matchModel.getMatchByRoomCode(roomCode);

        res.json({success: true, match})
    } catch (error) {
        console.log('get match error:', error)
        res.status(500).json({error: 'failed to get match details'})
    }
}

const updateMatchName = async (req, res) => {
    try {
        const roomCode = req.params.roomCode;
        const { matchName } = req.body;

        // Optional: Check if user is the host
        const match = await matchModel.getMatchByRoomCode(roomCode);
        if (match.host_id !== req.user.id) {
            return res.status(403).json({ error: 'Only the host can update the match' });
        }

        await matchModel.updateMatchName(roomCode, matchName);
        res.json({ success: true, message: 'Match name updated successfully' });
    } catch (error) {
        console.error('Update match name error:', error);
        res.status(500).json({ error: 'Failed to update match name' });
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
    getMatchDetails,
    updateMatchName
};