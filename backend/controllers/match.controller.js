const matchModel = require('../models/match.model');
const userModel = require('../models/user.model')

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

const getMatchDetails = async (req, res) => {
    try {
        const roomCode = req.params.roomCode;
        // The match object from the model now contains players and scores
        const match = await matchModel.getMatchByRoomCode(roomCode);

        // --- ADJUSTED RESPONSE STRUCTURE ---
        res.json({
            success: true,
            match: {
                id: match.id,
                host_id: match.host_id,
                room_code: match.room_code,
                status: match.status,
                current_game_number: match.current_game_number,
                matchname: match.matchname,
                players: match.players || [], // Use players from model, fallback to empty array
                scores: match.scores || {}    // Use scores from model, fallback to empty object
            }
        });
        // --- END ADJUSTED RESPONSE STRUCTURE ---
    } catch (error) {
        console.error('Get match details error:', error);
        res.status(500).json({ error: error.message || 'Failed to get match details' });
    }
};

const getGameData = async (req,res) => {
    try{
        console.log(req.params)
        const game = await matchModel.getGameDetails(req.params.gameNumber);

        res.json({success: true, game})
    } catch (error) {
        console.log('get game error:', error)
        res.status(500).json({error: 'failed to get game details'})
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



const joinMatch = async (req, res) => {
    try {
        const userId = req.user.id;
        const { roomCode } = req.params;

        // Get match by code
        const match = await matchModel.getMatchByRoomCode(roomCode);

        // Check if match is waiting
        if (match.status !== 'waiting') {
            return res.status(400).json({ error: 'Match has already started' });
        }

        // Join the match
        const playerEntry = await matchModel.joinMatch(match.id, userId);

        const user = await userModel.getUser(userId)

        res.json({ success: true,
                    message: "Successfully joined match.",
            player: {
                id: playerEntry.id, // This is the ID from the `match_players` table
                user_id: user.id,   // This is the user's actual ID from `users` table
                name: user.username, // This is the user's username
                total_score: playerEntry.total_score // This should be 0 initially
            }
 });
    } catch (error) {
        console.error('Join match error:', error);
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createMatch,
    getMatchDetails,
    updateMatchName,
    getGameData,
    joinMatch
};