/**
 * @fileoverview Match controller for Matchpoint game show platform
 * @author cc241070
 * @version 1.0.0
 * @description Handles match creation, joining, game flow, and real-time updates
 */

// backend/controllers/match.controller.js
const matchModel = require('../models/match.model');
const userModel = require('../models/user.model'); // Still needed to fetch username for joinMatch

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Safely retrieves the broadcast function from app.locals
 * Used to send real-time updates to connected clients
 * 
 * @param {Object} req - Express request object
 * @returns {Function} Broadcast function for Socket.IO room communication
 */
const getBroadcastToRoom = (req) => {
    // Access the broadcastToRoom function through app.locals.socketManager
    return req.app.locals.socketManager.broadcastToRoom;
};

// ============================================================================
// MATCH MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Creates a new match with specified games and host
 * Generates a unique room code and initializes match state
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.id - Host user ID
 * @param {Object} req.body - Request body
 * @param {string} req.body.matchName - Display name for the match
 * @param {Array<number>} req.body.gameSequence - Array of game IDs to play
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const createMatch = async (req, res) => {
    try {
        const hostId = req.user.id;
        const { matchName, gameSequence } = req.body;

        if (!Array.isArray(gameSequence) || gameSequence.length === 0) {
            return res.status(400).json({ success: false, error: 'Game sequence must be a non-empty array of game IDs.' });
        }
        if (!matchName || matchName.length < 3) {
            return res.status(400).json({ success: false, error: 'Match name is required and must be at least 3 characters.' });
        }

        const match = await matchModel.createMatch(matchName, hostId, gameSequence);
        console.log(`Backend: Match created with ID: ${match.id}, Room Code: ${match.room_code}`);

        res.status(201).json({
            success: true,
            roomCode: match.room_code,
            matchId: match.id,
            matchname: match.matchname,
            gameSequence: match.game_sequence // Include sequence in response
        });
    } catch (error) {
        console.error('Backend: createMatch error:', error);
        res.status(500).json({ error: error.message || 'Failed to create match' });
    }
};

/**
 * Retrieves complete match details including players and scores
 * Used by both host and players to get current match state
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.roomCode - Unique room code
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const getMatchDetails = async (req, res) => {
    try {
        const {roomCode} = req.params;

        const match = await matchModel.getMatchByRoomCode(roomCode);
        if (!match) {
            return res.status(404).json({ success: false, error: 'Match not found.' });
        }
        // Model already returns players and scores nested.
        res.json({ success: true, match: match });
    } catch (error) {
        console.error('Backend: getMatchDetails error:', error);
        res.status(500).json({ error: error.message || 'Failed to get match details' });
    }
};

/**
 * Updates the display name of a match
 * Only the host can modify the match name
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.id - User ID for authorization
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.roomCode - Unique room code
 * @param {Object} req.body - Request body
 * @param {string} req.body.matchName - New match name
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const updateMatchName = async (req, res) => {
    try {
        const  {roomCode} = req.params;
        const { matchName } = req.body;
        const userId = req.user.id;
        const broadcastToRoom = getBroadcastToRoom(req);

        const match = await matchModel.getMatchByRoomCode(roomCode);
        if (!match) {
            console.warn(`Backend: updateMatchName - Match not found for roomCode: ${roomCode}`);
            return res.status(404).json({ error: 'Match not found.' });
        }
        if (match.host_id !== userId) {
            console.warn(`Backend: updateMatchName - User ${userId} is not host (${match.host_id}) of match ${roomCode}`);
            return res.status(403).json({ error: 'Only the host can update the match name.' });
        }
        if (!matchName || matchName.trim().length === 0) {
            return res.status(400).json({ error: 'Match name cannot be empty.' });
        }

        await matchModel.updateMatchName(roomCode, matchName);
        console.log(`Backend: Match ${roomCode} name updated to ${matchName}`);

        // --- WebSocket broadcast ---
        broadcastToRoom(roomCode, { type: 'match_name_updated', newMatchName: matchName });
        // --- END BROADCAST ---

        res.json({ success: true, message: 'Match name updated successfully' });
    } catch (error) {
        console.error('Backend: updateMatchName error:', error);
        res.status(500).json({ error: error.message || 'Failed to update match name' });
    }
};

/**
 * Handles a user joining an existing match
 * Validates match status and broadcasts player updates
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.id - User ID joining the match
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.roomCode - Unique room code
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const joinMatch = async (req, res) => {
    try {
        const userId = req.user.id;
        const {roomCode} = req.params;

        const broadcastToRoom = getBroadcastToRoom(req);

        const match = await matchModel.getMatchByRoomCode(roomCode);
        if (!match) {
            return res.status(404).json({ error: 'Match not found.' });
        }

        console.log('Backend: joinMatch - Match found. Current status:', match.status);

        if (match.status !== 'waiting') {
            console.warn(`Backend: joinMatch - Match ${roomCode} is not in waiting status. Current status: ${match.status}`);
            return res.status(400).json({ error: 'Match has already started or finished.' });
        }

        const playerEntry = await matchModel.joinMatch(match.id, userId);
        const user = await userModel.getUserById(userId); // Fetch username
        if (!user) {
            console.error(`Backend: joinMatch - Could not find user details for userId: ${userId}`);
            return res.status(500).json({ error: 'Could not find user details after joining.' });
        }

        // Get updated list of players and scores for broadcasting
        const updatedMatch = await matchModel.getMatchByRoomCode(roomCode);
        const updatedPlayers = updatedMatch.players;
        const updatedScores = updatedMatch.scores;

        // --- WebSocket broadcast ---
        broadcastToRoom(roomCode, { type: 'players_update', players: updatedPlayers, scores: updatedScores });
        // --- END BROADCAST ---

        res.json({
            success: true,
            message: 'Joined match successfully',
            player: { // Return the specific player's details that just joined
                id: playerEntry.id, // match_players.id
                user_id: user.id,
                name: user.username, // Include username
                total_score: playerEntry.total_score
            }
        });
    } catch (error) {
        console.error('Backend: joinMatch error:', error);
        if (error.message.includes('already joined')) { // Specific error handling
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message || 'Failed to join match.' });
    }
};

/**
 * Starts a match and transitions from waiting to in_progress
 * Only the host can start the match
 * 
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {number} req.user.id - Host user ID for authorization
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.roomCode - Unique room code
 * @param {Object} res - Express response object
 * @returns {Promise<void>}
 */
const startMatch = async (req, res) => {
    try {
        const {roomCode} = req.params;

        const broadcastToRoom = getBroadcastToRoom(req);
        const userId = req.user.id; // Host ID for authorization

        console.log(`Backend: startMatch received request for roomCode: ${roomCode}`);

        const match = await matchModel.getMatchByRoomCode(roomCode);
        if (!match) {
            console.warn(`Backend: startMatch - Match not found for roomCode: ${roomCode}`);
            return res.status(404).json({ success: false, error: 'Match not found.' });
        }
        if (match.host_id !== userId) {
            return res.status(403).json({ success: false, error: 'Only the host can start the match.' });
        }

        console.log(`Backend: startMatch - Match found. Current status: ${match.status}`);
        if (match.status !== 'waiting') {
            console.warn(`Backend: startMatch - Match is not in waiting status. Current status: ${match.status}`);
            return res.status(400).json({ success: false, error: `Match is not in waiting status (current: ${match.status}).` });
        }

        console.log(`Backend: startMatch - Players count: ${match.players.length}`);
        if (match.players.length === 0) {
            console.warn(`Backend: startMatch - Cannot start, no players have joined.`);
            return res.status(400).json({ success: false, error: 'Cannot start match: No players have joined.' });
        }

        console.log(`Backend: startMatch - Game sequence length: ${match.game_sequence ? match.game_sequence.length : 0}`);
        if (!Array.isArray(match.game_sequence) || match.game_sequence.length === 0) { // Ensure it's an array for proper check
            console.warn(`Backend: startMatch - No game sequence defined.`);
            return res.status(400).json({ success: false, error: 'Cannot start match: No game sequence defined.' });
        }

        // All checks passed, proceed to update DB
        await matchModel.updateMatchProgress(match.id, 'in_progress', 0); // Start at game INDEX 0
        console.log(`Backend: startMatch - Match ${match.id} status updated to 'in_progress' and game_number to 0.`);

        // Fetch the updated match state to broadcast
        const updatedMatch = await matchModel.getMatchByRoomCode(roomCode);
        const currentGameIndex = updatedMatch.current_game_number; // Should be 0
        const currentGameId = updatedMatch.game_sequence[currentGameIndex];
        let gameData = null; // Initialize gameData to null
        try {
            gameData = await matchModel.getGameDetailsById(currentGameId);
        } catch (error) {
            console.error(`Backend: startMatch - Error fetching game data for ID ${currentGameId}:`, error);
            // Don't fail the entire startMatch just because gameData fetch failed for broadcast, but log it.
            // Frontend's fetchMatchDetails will handle if gameData is missing.
        }


        // --- WebSocket broadcast ---
        broadcastToRoom(roomCode, {
            type: 'game_started',
            newStatus: 'in_progress',
            newCurrentGameNumber: currentGameIndex, // Send 0-indexed game number
            gameData: gameData // Send actual game data (or null if fetch failed)
        });
        // --- END BROADCAST ---

        res.json({ success: true, message: 'Match started successfully.' });
    } catch (error) {
        console.error('Backend: startMatch error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to start match.' });
    }
};

/**
 * Submits game results and updates player scores.
 */
const submitGameResults = async (req, res) => {
    try {
        const {roomCode} = req.params;
        const { gameNumber, winners, points } = req.body; // Use points as in your code
        const broadcastToRoom = getBroadcastToRoom(req);
        const userId = req.user.id; // Host ID for authorization

        console.log(`Backend: submitGameResults for roomCode: ${roomCode}, gameNumber: ${gameNumber}, winners: ${JSON.stringify(winners)}, points: ${points}`);

        const match = await matchModel.getMatchByRoomCode(roomCode);
        if (!match) {
            console.warn(`Backend: submitGameResults - Match not found for roomCode: ${roomCode}`);
            return res.status(404).json({ success: false, error: 'Match not found.' });
        }
        if (match.host_id !== userId) {
            return res.status(403).json({ success: false, error: 'Only the host can submit game results.' });
        }
        if (match.status !== 'in_progress') {
            console.warn(`Backend: submitGameResults - Match is not in progress. Current status: ${match.status}`);
            return res.status(400).json({ success: false, error: `Match is not in progress (current: ${match.status}).` });
        }
        if (gameNumber !== match.current_game_number) { // Ensure `gameNumber` from frontend matches 0-indexed `current_game_number` in DB
            console.warn(`Backend: submitGameResults - Game index mismatch. Expected ${match.current_game_number}, got ${gameNumber}.`);
            return res.status(400).json({ success: false, error: 'Game index mismatch. Results not for current game.' });
        }
        if (!winners || !Array.isArray(winners) || winners.length === 0) {
            return res.status(400).json({ success: false, error: 'Winners array is required and cannot be empty.' });
        }
        if (isNaN(parseInt(points))) { // Parse points, ensure it's a valid number.
            return res.status(400).json({ success: false, error: 'Points must be a number.' });
        }

        // Prepare winners data for the model: map `winner` (frontend player object) to `match_player_id` and `points_awarded`
        const playerUpdates = winners.map(winner => ({
            match_player_id: winner.id, // This is the match_players.id from frontend
            points_awarded: parseInt(points)
        }));

        await matchModel.updatePlayerScores(match.id, playerUpdates);
        console.log(`Backend: Player scores updated in DB for match ${match.id}.`);

        // After updating scores, fetch the latest match details to get updated players and scores for broadcast
        const updatedMatch = await matchModel.getMatchByRoomCode(roomCode);
        const updatedPlayers = updatedMatch.players;
        const updatedScores = updatedMatch.scores;

        // --- WebSocket broadcast ---
        broadcastToRoom(roomCode, {
            type: 'scores_updated',
            newScores: updatedScores,
            updatedPlayers: updatedPlayers
        });
        // --- END BROADCAST ---

        res.json({ success: true, message: 'Game results saved.', updatedPlayers, updatedScores });
    } catch (error) {
        console.error('Backend: submitGameResults error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to save game results.' });
    }
};

/**
 * Handles advancing to the next game or finishing the match.
 * newGameNumber is now the INDEX of the next game in the sequence (0-indexed).
 */
const nextGame = async (req, res) => {
    try {
        const {roomCode} = req.params;
        console.log('req.body', req.body);
        let { newGameNumber, isMatchFinished } = req.body;
        const broadcastToRoom = getBroadcastToRoom(req);
        const userId = req.user.id; // Host ID for authorization

        isMatchFinished = (isMatchFinished === true || isMatchFinished === 'true');
        newGameNumber = parseInt(newGameNumber, 10);

        console.log(`Backend: nextGame for roomCode: ${roomCode}. newGameNumber (index): ${newGameNumber}, isMatchFinished: ${isMatchFinished}`);

        const match = await matchModel.getMatchByRoomCode(roomCode);
        if (!match) {
            console.warn(`Backend: nextGame - Match not found for roomCode: ${roomCode}`);
            return res.status(404).json({ success: false, error: 'Match not found.' });
        }
        if (match.host_id !== userId) {
            return res.status(403).json({ success: false, error: 'Only the host can advance the game.' });
        }
        if (match.status !== 'in_progress' && match.status !== 'waiting') {
            console.warn(`Backend: nextGame - Match is not in progress/waiting. Current status: ${match.status}`);
            return res.status(400).json({ success: false, error: `Match is not in progress or waiting (current: ${match.status}).` });
        }

        const gameSequence = match.game_sequence;
        if (!Array.isArray(gameSequence) || gameSequence.length === 0) { // Ensure it's an array
            return res.status(400).json({ success: false, error: 'Match has no game sequence defined.' });
        }

        // newGameNumber can be equal to gameSequence.length when match is finished
        if (newGameNumber > gameSequence.length && !isMatchFinished) {
            return res.status(400).json({ success: false, error: 'Game index out of bounds for sequence, but match not marked as finished.' });
        }

        let newStatus = 'in_progress';
        let winnerId = null;
        let finalWinnerName = null;
        let finalScores = null;

        if (isMatchFinished) {
            newStatus = 'finished';
            if (match.players && match.players.length > 0) {
                const sortedPlayers = match.players.sort((a, b) => b.total_score - a.total_score);
                const winnerPlayer = sortedPlayers[0];
                winnerId = winnerPlayer.user_id;
                finalWinnerName = winnerPlayer.name;
                finalScores = sortedPlayers; // Send final sorted players (with scores) for display
            }
        }

        await matchModel.updateMatchProgress(match.id, newStatus, newGameNumber, winnerId);
        console.log(`Backend: Match ${roomCode} status updated to '${newStatus}', game index to ${newGameNumber}.`);

        let gameData = null;
        if (!isMatchFinished) {
            const nextGameId = gameSequence[newGameNumber];
            if (nextGameId === undefined) {
                console.error(`Backend: nextGame - Game ID at index ${newGameNumber} in sequence is undefined.`);
                // Return 500 but still try to broadcast to update UI if possible (e.g. to error state)
            } else {
                try {
                    gameData = await matchModel.getGameDetailsById(nextGameId);
                } catch (error) {
                    console.error(`Backend: nextGame - Error fetching game data for ID ${nextGameId}:`, error);
                    // Handle case where game data fetch fails, but allow overall flow if possible
                }
            }
        }

        // --- WebSocket broadcast ---
        if (isMatchFinished) {
            broadcastToRoom(roomCode, {
                type: 'match_finished',
                newStatus: newStatus,
                winnerId: winnerId,
                winnerName: finalWinnerName,
                finalScores: finalScores
            });
        } else {
            broadcastToRoom(roomCode, {
                type: 'next_game',
                newStatus: newStatus,
                newCurrentGameNumber: newGameNumber,
                gameData: gameData
            });
        }
        // --- END BROADCAST ---

        res.json({
            success: true,
            message: 'Match progress updated.',
            newStatus: newStatus,
            newCurrentGameNumber: newGameNumber,
            gameData: gameData
        });
    } catch (error) {
        console.error('Backend: nextGame error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to advance game.' });
    }
};

/**
 * Fetches details for a specific game ID from the database.
 * (This controller serves the /api/games/:gameId route).
 */
const getGameData = async (req, res) => {
    try {
        const gameId = parseInt(req.params.gameId, 10); // Expects gameId from route
        if (isNaN(gameId) || gameId < 1) {
            return res.status(400).json({ success: false, error: 'Invalid game ID provided.' });
        }

        const game = await matchModel.getGameDetailsById(gameId);
        if (!game) {
            return res.status(404).json({ success: false, error: `Game with ID ${gameId} not found.` });
        }

        res.json({ success: true, game: game });
    } catch (error) {
        console.error('Backend: getGameData error:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to retrieve game data.' });
    }
};

module.exports = {
    createMatch,
    getMatchDetails,
    updateMatchName,
    joinMatch,
    submitGameResults,
    startMatch,
    nextGame,
    getGameData
};
