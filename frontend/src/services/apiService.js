/**
 * @fileoverview API service for Matchpoint frontend
 * @author cc241070
 * @version 1.0.0
 * @description Centralized API client for backend communication with authentication and error handling
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Base URL for API requests from environment variables
 * Falls back to localhost:3000 for development
 * @type {string}
 */
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "https://cc241070-10748.node.fhstp.cc:10748";

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Builds complete API URL by appending path to base URL
 * 
 * @param {string} path - API endpoint path (e.g., '/matches', '/auth/login')
 * @returns {string} Complete API URL
 * 
 * @example
 * buildApiUrl('/matches') // Returns: 'http://localhost:3000/api/matches'
 */
const buildApiUrl = (path) => `${API_BASE_URL}/api${path}`;

/**
 * Handles common HTTP response logic for all API calls
 * Parses JSON responses, handles errors, and provides consistent error messages
 * 
 * @async
 * @param {Response} response - Fetch API response object
 * @param {string} defaultErrorMessage - Fallback error message if response doesn't provide one
 * @returns {Promise<Object|string>} Parsed response data or error message
 * 
 * @throws {Error} Throws error with appropriate message for failed requests
 * 
 * @example
 * const data = await handleResponse(response, 'Failed to fetch data');
 */
const handleResponse = async (response, defaultErrorMessage) => {
    const contentType = response.headers.get("content-type");

    if (response.ok) {
        if (contentType && contentType.includes("application/json")) {
            return await response.json();
        }
        return response.text(); // For non-JSON success responses (e.g., 204 No Content)
    } else {
        let errorData = {};
        if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
        } else {
            errorData.message = await response.text(); // Capture plain text errors
        }
        console.error('API Error:', defaultErrorMessage, 'Status:', response.status, 'Response:', errorData);
        // Use errorData.message for consistency, fallback to errorData.error, then default message
        throw new Error(errorData.message || errorData.error || defaultErrorMessage);
    }
};

/**
 * Creates authentication headers for API requests
 * Includes JWT token from localStorage if available
 * 
 * @returns {Object} Headers object with Content-Type and Authorization
 * 
 * @example
 * const headers = getAuthHeaders();
 * // Returns: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token123' }
 */
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * Authenticates user with username and password
 * Returns user data and JWT token on successful login
 * 
 * @async
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data and authentication token
 * 
 * @example
 * const result = await login('john_doe', 'password123');
 * // Returns: { success: true, user: {...}, token: 'jwt_token_here' }
 * 
 * @throws {Error} 'Login failed' if authentication fails
 */
export const login = async (username, password) => {
    try {
        const response = await fetch(buildApiUrl('/auth/login'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        return await handleResponse(response, 'Login failed');
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

/**
 * Registers a new user account
 * Creates user profile and returns authentication data
 * 
 * @async
 * @param {string} username - Desired username (must be unique)
 * @param {string} password - User's password
 * @returns {Promise<Object>} Registration result with user data
 * 
 * @example
 * const result = await register('new_user', 'secure_password');
 * // Returns: { success: true, user: {...}, token: 'jwt_token_here' }
 * 
 * @throws {Error} 'Registration failed' if registration fails
 */
export const register = async (username, password) => {
    try {
        const response = await fetch(buildApiUrl('/auth/register'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        return await handleResponse(response, 'Registration failed');
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

// ============================================================================
// MATCH MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * Creates a new match with specified games and host
 * Generates unique room code and initializes match state
 * 
 * @async
 * @param {string} matchName - Display name for the match
 * @param {Array<number>} gameSequence - Array of game IDs to play in order
 * @returns {Promise<Object>} Created match data with room code
 * 
 * @example
 * const match = await createMatch('Friday Night Games', [1, 3, 5]);
 * // Returns: { success: true, roomCode: 'ABCD', matchId: 456, ... }
 * 
 * @throws {Error} 'Failed to create match' if creation fails
 */
export const createMatch = async (matchName, gameSequence) => {
    try {
        console.log("Creating match with name:", matchName, "and sequence:", gameSequence);
        const response = await fetch(buildApiUrl('/matches'), {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ matchName, gameSequence })
        });
        return await handleResponse(response, 'Failed to create match');
    } catch (error) {
        console.error('Error creating match:', error);
        throw error;
    }
};

/**
 * Retrieves complete match details by room code
 * Includes players, scores, game sequence, and current status
 * 
 * @async
 * @param {string} roomCode - Unique room code for the match
 * @returns {Promise<Object>} Complete match data with players and scores
 * 
 * @example
 * const match = await getMatchDetails('1234');
 * // Returns: { success: true, match: { players: [...], scores: {...}, ... } }
 * 
 * @throws {Error} 'Failed to get match details for room: {roomCode}' if fetch fails
 */
export const getMatchDetails = async (roomCode) => {
    try {
        const response = await fetch(buildApiUrl(`/matches/${roomCode}`), {
            method: 'GET',
            headers: getAuthHeaders()
        });
        return await handleResponse(response, `Failed to get match details for room: ${roomCode}`);
    } catch (error) {
        console.error('Error getting match details:', error);
        throw error;
    }
};

/**
 * Updates the display name of an existing match
 * Only the host can modify the match name
 * 
 * @async
 * @param {string} roomCode - Room code of the match to update
 * @param {string} matchName - New display name for the match
 * @returns {Promise<Object>} Update confirmation
 * 
 * @example
 * await updateMatchName('1234', 'New Match Name');
 * // Returns: { success: true, message: 'Match name updated successfully' }
 * 
 * @throws {Error} 'Failed to update match name for room {roomCode}' if update fails
 */
export const updateMatchName = async (roomCode, matchName) => {
    try {
        const response = await fetch(buildApiUrl(`/matches/${roomCode}`), {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ matchName: matchName })
        });
        return await handleResponse(response, `Failed to update match name for room ${roomCode}`);
    } catch (error) {
        console.error('Error updating match name:', error);
        throw error;
    }
};

/**
 * Joins an existing match as a player
 * Validates match status and adds user to player list
 * 
 * @async
 * @param {string} roomCode - Room code of the match to join
 * @returns {Promise<Object>} Join confirmation with player details
 * 
 * @example
 * const result = await joinMatch('1234');
 * // Returns: { success: true, message: 'Joined match successfully', player: {...} }
 * 
 * @throws {Error} 'Failed to join match' if join operation fails
 */
export const joinMatch = async (roomCode) => {
    try {
        console.log(`Frontend: Joining match ${roomCode} from backend.`);
        const response = await fetch(buildApiUrl(`/matches/${roomCode}/join`), {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        const result = await handleResponse(response, 'Failed to join match');
        console.log("apiService.joinMatch result:", result);
        return result;
    } catch (error) {
        console.error('Error joining match:', error);
        throw error;
    }
};

// ============================================================================
// GAME MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * Creates a new game in the database
 * Used for admin functionality to add new games to the system
 * 
 * @async
 * @param {Object} gameData - Game configuration data
 * @param {string} gameData.title - Game title
 * @param {string} gameData.description - Game description
 * @param {number} gameData.game_number - Game sequence number
 * @param {number} gameData.points_value - Points awarded for this game
 * @returns {Promise<Object>} Created game data
 * 
 * @example
 * const game = await createGame({
 *   title: 'Quiz Game',
 *   description: 'Answer questions correctly',
 *   game_number: 1,
 *   points_value: 10
 * });
 * 
 * @throws {Error} 'Failed to create game' if creation fails
 */
export const createGame = async (gameData) => {
    try {
        console.log("Creating game with data:", gameData);
        const response = await fetch(buildApiUrl('/games/create'), {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(gameData)
        });
        return await handleResponse(response, 'Failed to create game');
    } catch (error) {
        console.error('Error creating game:', error);
        throw error;
    }
};

/**
 * Retrieves all available games from the database
 * Used for match creation to select game sequence
 * 
 * @async
 * @returns {Promise<Array>} Array of all available games
 * 
 * @example
 * const games = await getAllGames();
 * // Returns: [{ id: 1, title: 'Quiz Game', ... }, { id: 2, title: 'Memory Game', ... }]
 * 
 * @throws {Error} 'Failed to fetch all games' if fetch fails
 */
export const getAllGames = async () => {
    try {
        console.log('Frontend: Fetching all games from backend.');
        const response = await fetch(buildApiUrl(`/games`), {
            method: 'GET',
            headers: getAuthHeaders()
        });
        return await handleResponse(response, 'Failed to fetch all games');
    } catch (error) {
        console.error('Frontend: Error getting all games:', error);
        throw error;
    }
};

/**
 * Fetches detailed information for a specific game by ID
 * Used to get game data for the current match phase
 * 
 * @async
 * @param {number} gameId - Database ID of the game to fetch
 * @returns {Promise<Object>} Game object with complete details
 * 
 * @example
 * const game = await getGameData(5);
 * // Returns: { id: 5, title: 'Quiz Game', description: '...', game_number: 1, points_value: 10 }
 * 
 * @throws {Error} 'Failed to fetch game data for ID {gameId}' if fetch fails
 * @throws {Error} 'Invalid game data response format from backend' if response format is unexpected
 */
export const getGameData = async (gameId) => {
    try {
        console.log(`Frontend: Fetching game data for ID ${gameId} from backend.`);
        const response = await fetch(buildApiUrl(`/games/${gameId}`), {
            method: 'GET',
            headers: getAuthHeaders()
        });
        const data = await handleResponse(response, `Failed to fetch game data for ID ${gameId}`);
        console.log("apiService.getGameData raw response data:", data);

        // Backend returns 'result' key, not 'game' key
        if (data && data.result) {
            return data.result;
        } else {
            console.error("apiService.getGameData: Expected 'result' key in response, but not found.", data);
            throw new Error("Invalid game data response format from backend.");
        }
    } catch (error) {
        console.error(`Frontend: Error getting game data for ID ${gameId}:`, error);
        throw error;
    }
};

/**
 * Updates an existing game's configuration
 * Used for admin functionality to modify game settings
 * 
 * @async
 * @param {number} gameId - Database ID of the game to update
 * @param {Object} gameData - Updated game configuration
 * @returns {Promise<Object>} Update confirmation
 * 
 * @example
 * await updateGame(5, { title: 'Updated Quiz Game', points_value: 15 });
 * 
 * @throws {Error} 'Failed to update game with ID {gameId}' if update fails
 */
export const updateGame = async (gameId, gameData) => {
    try {
        console.log(`Frontend: Updating game with ID ${gameId} with data:`, gameData);
        const response = await fetch(buildApiUrl(`/games/${gameId}`), {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(gameData)
        });
        return await handleResponse(response, `Failed to update game with ID ${gameId}`);
    } catch (error) {
        console.error(`Frontend: Error updating game with ID ${gameId}:`, error);
        throw error;
    }
};

/**
 * Deletes a game from the database
 * Used for admin functionality to remove games from the system
 * 
 * @async
 * @param {number} gameId - Database ID of the game to delete
 * @returns {Promise<Object>} Deletion confirmation
 * 
 * @example
 * await deleteGame(5);
 * 
 * @throws {Error} 'Failed to delete game with ID {gameId}' if deletion fails
 */
export const deleteGame = async (gameId) => {
    try {
        console.log(`Frontend: Deleting game with ID ${gameId}.`);
        const response = await fetch(buildApiUrl(`/games/${gameId}`), {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return await handleResponse(response, `Failed to delete game with ID ${gameId}`);
    } catch (error) {
        console.error(`Frontend: Error deleting game with ID ${gameId}:`, error);
        throw error;
    }
};

// ============================================================================
// MATCH GAMEPLAY ENDPOINTS
// ============================================================================

/**
 * Submits game results and awards points to winners
 * Updates player scores and triggers match progression
 * 
 * @async
 * @param {string} roomCode - Room code of the match
 * @param {number} gameNumber - Index of the completed game (0-based)
 * @param {Array<number>} winners - Array of winner user IDs
 * @param {number} points - Points to award to winners
 * @returns {Promise<Object>} Updated player and score data
 * 
 * @example
 * const result = await submitGameResults('1234', 0, [123, 456], 10);
 * // Returns: { updatedPlayers: [...], updatedScores: {...} }
 * 
 * @throws {Error} 'Failed to save game results' if submission fails
 */
export const submitGameResults = async (roomCode, gameNumber, winners, points) => {
    try {
        console.log(`Frontend: Submitting game results for match ${roomCode}, game ${gameNumber}. Winners: ${JSON.stringify(winners)}, Points: ${points}`);
        const response = await fetch(buildApiUrl(`/matches/${roomCode}/results`), {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ gameNumber, winners, points })
        });
        const data = await handleResponse(response, 'Failed to save game results');
        return { updatedPlayers: data.updatedPlayers, updatedScores: data.updatedScores };
    } catch (error) {
        console.error('Frontend: Error saving game results:', error);
        throw error;
    }
};

/**
 * Starts a match and transitions from waiting to in_progress
 * Only the host can start the match
 * 
 * @async
 * @param {string} roomCode - Room code of the match to start
 * @returns {Promise<Object>} Start confirmation with updated match data
 * 
 * @example
 * const result = await startMatch('1234');
 * // Returns: { success: true, message: 'Match started successfully', match: {...} }
 * 
 * @throws {Error} 'Failed to start match' if start operation fails
 */
export const startMatch = async (roomCode) => {
    try {
        console.log(`Frontend: Requesting to START match ${roomCode} from backend.`);
        const response = await fetch(buildApiUrl(`/matches/${roomCode}/start`), {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({})
        });
        return await handleResponse(response, 'Failed to start match');
    } catch (error) {
        console.error('Frontend: Error starting match:', error);
        throw error;
    }
};

/**
 * Advances to the next game in the match sequence
 * Handles transition from scoreboard to next game or match completion
 * 
 * @async
 * @param {string} roomCode - Room code of the match
 * @param {number} newGameNumber - Index of the next game (0-based)
 * @param {boolean} isMatchFinished - Whether this is the final game
 * @returns {Promise<Object>} Match progression confirmation
 * 
 * @example
 * // Advance to next game
 * await nextGame('1234', 1, false);
 * 
 * // Finish match
 * await nextGame('1234', 2, true);
 * 
 * @throws {Error} 'Failed to advance to next game' if progression fails
 */
export const nextGame = async (roomCode, newGameNumber, isMatchFinished) => {
    try {
        console.log(`Frontend: Requesting next game for match ${roomCode}, game ${newGameNumber}. Finished: ${isMatchFinished}`);
        const response = await fetch(buildApiUrl(`/matches/${roomCode}/next-game`), {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ newGameNumber, isMatchFinished })
        });
        return await handleResponse(response, 'Failed to advance to next game');
    } catch (error) {
        console.error('Frontend: Error advancing to next game:', error);
        throw error;
    }
};
