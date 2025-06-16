// controllers/match.controller.js
const matchModel = require('../models/match.model');
const userModel = require('../models/user.model');

/**
 * Handles the creation of a new match with a specified game sequence.
 */
const createMatch = async (req, res) => {
    try {
        const hostId = req.user.id;
        // MODIFIED: Get gameSequence from req.body
        const { matchName, gameSequence } = req.body;

        // Basic validation for gameSequence
        if (!Array.isArray(gameSequence) || gameSequence.length === 0) {
            return res.status(400).json({ success: false, error: 'Game sequence must be a non-empty array of game IDs.' });
        }

        // MODIFIED: Pass gameSequence to model
        const match = await matchModel.createMatch(matchName, hostId, gameSequence);

        res.json({
            success: true,
            roomCode: match.room_code,
            matchId: match.id,
            matchname: match.matchname,
            gameSequence: match.game_sequence // Include sequence in response
        });
    } catch (error) {
        console.error('Create match error:', error);
        res.status(500).json({ error: 'Failed to create match' });
    }
};

/**
 * Retrieves full match details for a given room code.
 */
const getMatchDetails = async (req, res) => {
    try {
        const roomCode = req.params.roomCode;
        // Model now returns game_sequence, players, and scores
        const match = await matchModel.getMatchByRoomCode(roomCode);

        res.json({
            success: true,
            match: {
                id: match.id,
                host_id: match.host_id,
                room_code: match.room_code,
                status: match.status,
                current_game_number: match.current_game_number, // This is now game INDEX
                winner_id: match.winner_id,
                matchname: match.matchname,
                game_sequence: match.game_sequence, // Pass game_sequence
                players: match.players || [],
                scores: match.scores || {}
            }
        });
    } catch (error) {
        console.error('Get match details error:', error);
        res.status(500).json({ error: error.message || 'Failed to get match details' });
    }
};

/**
 * Updates the name of a match.
 */
const updateMatchName = async (req, res) => {
    try {
        const roomCode = req.params.roomCode;
        const { matchName } = req.body;
        const userId = req.user.id;

        const match = await matchModel.getMatchByRoomCode(roomCode);
        if (match.host_id !== userId) {
            return res.status(403).json({ error: 'Only the host can update the match name.' });
        }

        await matchModel.updateMatchName(roomCode, matchName);
        res.json({ success: true, message: 'Match name updated successfully' });
    } catch (error) {
        console.error('Update match name error:', error);
        res.status(500).json({ error: 'Failed to update match name' });
    }
};

/**
 * Handles a user joining an existing match.
 */
const joinMatch = async (req, res) => {
    try {
        const userId = req.user.id;
        const { roomCode } = req.params;

        const match = await matchModel.getMatchByRoomCode(roomCode);
        console.log('DEBUG: Join Match attempt. Match Status:', match.status, 'for Room Code:', roomCode);
        if (!match) {
            return res.status(404).json({ error: 'Match not found.' });
        }

        console.log('DEBUG: Join Match attempt. Match Status:', match.status, 'for Room Code:', roomCode);

        if (match.status !== 'waiting') {
            return res.status(400).json({ error: 'Match has already started or finished.' });
        }

        const playerEntry = await matchModel.joinMatch(match.id, userId);
        const user = await userModel.getUserById(userId);
        if (!user) {
            return res.status(500).json({ error: 'Could not find user details after joining.' });
        }

        res.json({
            success: true,
            message: 'Successfully joined match.',
            player: {
                id: playerEntry.id,
                user_id: user.id,
                name: user.username,
                total_score: playerEntry.total_score
            }
        });
    } catch (error) {
        console.error('Join match error:', error);
        if (error.message.includes('already joined')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(400).json({ error: error.message || 'Failed to join match' });
    }
};

/**
 * Submits game results and updates player scores.
 */
const submitGameResults = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const { gameNumber, winners, points } = req.body;

        if (!winners || !Array.isArray(winners) || winners.length === 0 || isNaN(parseInt(points))) {
            return res.status(400).json({ success: false, error: 'Invalid results data provided.' });
        }

        const match = await matchModel.getMatchByRoomCode(roomCode);
        if (!match) {
            return res.status(404).json({ error: 'Match not found.' });
        }

        const playerUpdates = winners.map(winner => ({
            match_player_id: winner.id,
            points_awarded: parseInt(points)
        }));

        await matchModel.updatePlayerScores(match.id, playerUpdates);

        const updatedMatch = await matchModel.getMatchByRoomCode(roomCode);

        res.json({
            success: true,
            message: 'Game results saved successfully.',
            updatedPlayers: updatedMatch.players,
            updatedScores: updatedMatch.scores
        });

    } catch (error) {
        console.error('Submit game results error:', error);
        res.status(500).json({ error: error.message || 'Failed to submit game results.' });
    }
};


/**
 * Fetches details for a specific game ID from the database.
 * (This controller is now designed to fetch by ID from the /api/matches/games/:id route).
 */
const getGameData = async (req, res) => {
    try {
        const gameId = parseInt(req.params.gameNumber, 10); // Still uses gameNumber param name but implies ID
        if (isNaN(gameId) || gameId < 1) {
            return res.status(400).json({ success: false, error: 'Invalid game ID provided.' });
        }

        // MODIFIED: Call getGameDetailsById model function
        const game = await matchModel.getGameDetailsById(gameId);
        if (!game) {
            return res.status(404).json({ success: false, error: `Game with ID ${gameId} not found.` });
        }

        res.json({ success: true, game: game });
    } catch (error) {
        console.error('Get game data error (by ID):', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to retrieve game data.' });
    }
};

/**
 * Handles starting a match, updating its status to 'in_progress' and setting initial game index.
 */
const startMatch = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const match = await matchModel.getMatchByRoomCode(roomCode);
        if (!match) {
            return res.status(404).json({ success: false, error: 'Match not found.' });
        }
        if (match.status !== 'waiting') {
            return res.status(400).json({ success: false, error: 'Match is not in waiting status.' });
        }
        // MODIFIED: Validate game_sequence before starting
        if (!match.game_sequence || match.game_sequence.length === 0) {
            return res.status(400).json({ success: false, error: 'Cannot start match: No game sequence defined.' });
        }

        await matchModel.updateMatchProgress(match.id, 'in_progress', 0); // Start at game INDEX 0
        res.json({ success: true, message: 'Match started successfully.' });
    } catch (error) {
        console.error('Start match error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to start match.' });
    }
};

/**
 * Handles advancing to the next game or finishing the match.
 * newGameNumber is now the INDEX of the next game in the sequence.
 */
const nextGame = async (req, res) => {
    try {
        const { roomCode } = req.params;
        let { newGameNumber, isMatchFinished } = req.body;

        isMatchFinished = (isMatchFinished === true || isMatchFinished === 'true');
        newGameNumber = parseInt(newGameNumber, 10);
        // MODIFIED: newGameNumber can be 0 (first index) or up to length-1 of sequence
        if (isNaN(newGameNumber) || newGameNumber < 0) {
            return res.status(400).json({ success: false, error: 'Invalid new game number (index) provided.' });
        }

        const match = await matchModel.getMatchByRoomCode(roomCode);
        if (!match) {
            return res.status(404).json({ success: false, error: 'Match not found.' });
        }

        const gameSequence = match.game_sequence; // Get game sequence from the match object
        if (!gameSequence || gameSequence.length === 0) {
            return res.status(400).json({ success: false, error: 'Match has no game sequence defined.' });
        }
        // Validate the newGameNumber index against the sequence length
        if (newGameNumber >= gameSequence.length && !isMatchFinished) {
            // If newGameNumber is out of bounds and match is not finished, it's an error
            return res.status(400).json({ success: false, error: 'Game index out of bounds for sequence, but match not marked as finished.' });
        }


        const newStatus = isMatchFinished ? 'finished' : 'in_progress';
        let winnerId = null;

        if (newStatus === 'finished') {
            // Logic to determine winner (e.g., player with highest total_score)
            // This is a placeholder, will implement robust winner calculation later
            if (match.players && match.players.length > 0) {
                const sortedPlayers = match.players.sort((a, b) => b.total_score - a.total_score);
                winnerId = sortedPlayers[0].user_id; // Get the user_id of the highest scoring player
            }
        }

        // MODIFIED: Pass winnerId to updateMatchProgress
        await matchModel.updateMatchProgress(match.id, newStatus, newGameNumber, winnerId);

        let gameData = null;
        if (!isMatchFinished) {
            // Get the actual game ID from the sequence using the newGameNumber (index)
            const nextGameId = gameSequence[newGameNumber];
            if (nextGameId === undefined) {
                // This case should ideally be caught by newGameNumber >= gameSequence.length check above
                return res.status(400).json({ success: false, error: 'Game index resulted in undefined game ID.' });
            }
            // MODIFIED: Call getGameDetailsById with the game ID
            gameData = await matchModel.getGameDetailsById(nextGameId);
        }

        res.json({
            success: true,
            message: 'Match progress updated.',
            newStatus: newStatus,
            newCurrentGameNumber: newGameNumber, // This is the INDEX now
            gameData: gameData
        });
    } catch (error) {
        console.error('Next game error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to advance game.' });
    }
};


module.exports = {
    createMatch,
    getMatchDetails,
    updateMatchName,
    joinMatch,
    submitGameResults,
    getGameData, // This serves /api/matches/games/:gameId
    startMatch,
    nextGame
};
