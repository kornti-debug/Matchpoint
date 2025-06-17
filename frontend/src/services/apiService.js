// services/apiService.js

// Make sure this matches your actual backend URL
const API_URL = 'http://localhost:3000/api';

// Helper to handle common response logic
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

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const login = async (username, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username,password}),
        });
        return await handleResponse(response, 'Login failed');
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const register = async (username, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username, password}),
        });
        return await handleResponse(response, 'Registration failed');
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const createMatch = async (matchName, gameSequence) => {
    try {
        console.log("Creating match with name:", matchName, "and sequence:", gameSequence);
        const response = await fetch(`${API_URL}/matches`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({matchName, gameSequence})
        });
        return await handleResponse(response, 'Failed to create match');
    } catch (error) {
        console.error('Error creating match:', error);
        throw error;
    }
};

export const createGame = async (gameData) => {
    try {
        console.log("Creating game with data:", gameData);
        const response = await fetch(`${API_URL}/games/create`, {
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

export const getMatchDetails = async (roomCode) => {
    try {
        const response = await fetch(`${API_URL}/matches/${roomCode}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        return await handleResponse(response, `Failed to get match details for room: ${roomCode}`);
    } catch (error) {
        console.error('Error getting match details:', error);
        throw error;
    }
};

export const getAllGames = async () => {
    try {
        console.log('Frontend: Fetching all games from backend.');
        const response = await fetch(`${API_URL}/games`, { // Endpoint: /api/games
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
 * Fetches a single game's details from the backend by ID.
 * @param {number} gameId - The ID of the game to fetch.
 * @returns {Promise<Object>} A promise that resolves with the game object.
 */
export const getGameData = async (gameId) => {
    try {
        console.log(`Frontend: Fetching game data for ID ${gameId} from backend.`);
        const response = await fetch(`${API_URL}/games/${gameId}`, { // Endpoint: /api/games/:id
            method: 'GET',
            headers: getAuthHeaders()
        });
        const data = await handleResponse(response, `Failed to fetch game data for ID ${gameId}`);
        console.log("apiService.getGameData raw response data:", data); // Log the full 'data' object

        // --- CRITICAL FIX: Backend returns 'result' key, not 'game' key ---
        if (data && data.result) {
            return data.result;
        } else {
            console.error("apiService.getGameData: Expected 'result' key in response, but not found.", data);
            throw new Error("Invalid game data response format from backend.");
        }
        // --- END CRITICAL FIX ---

    } catch (error) {
        console.error(`Frontend: Error getting game data for ID ${gameId}:`, error);
        throw error;
    }
};

export const updateGame = async (gameId, gameData) => {
    try {
        console.log(`Frontend: Updating game with ID ${gameId} with data:`, gameData);
        const response = await fetch(`${API_URL}/games/${gameId}`, {
            method: 'PUT', // Use PUT method for updating
            headers: getAuthHeaders(),
            body: JSON.stringify(gameData)
        });
        return await handleResponse(response, `Failed to update game with ID ${gameId}`);
    } catch (error) {
        console.error(`Frontend: Error updating game with ID ${gameId}:`, error);
        throw error;
    }
};

export const deleteGame = async (gameId) => {
    try {
        console.log(`Frontend: Deleting game with ID ${gameId}.`);
        const response = await fetch(`${API_URL}/games/${gameId}`, {
            method: 'DELETE', // Use DELETE method
            headers: getAuthHeaders()
        });
        return await handleResponse(response, `Failed to delete game with ID ${gameId}`);
    } catch (error) {
        console.error(`Frontend: Error deleting game with ID ${gameId}:`, error);
        throw error;
    }
};

export const updateMatchName = async (roomCode, matchName) => {
    try {
        const response = await fetch(`${API_URL}/matches/${roomCode}`, {
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

export const joinMatch = async (roomCode) => {
    try {
        const response = await fetch(`${API_URL}/matches/${roomCode}/join`, {
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

export const submitGameResults = async (roomCode, gameNumber, winners, points) => {
    try {
        console.log(`Frontend: Submitting game results for match ${roomCode}, game ${gameNumber}. Winners: ${JSON.stringify(winners)}, Points: ${points}`);
        const response = await fetch(`${API_URL}/matches/${roomCode}/results`, {
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

export const startMatch = async (roomCode) => {
    try {
        console.log(`Frontend: Requesting to START match ${roomCode} from backend.`);
        const response = await fetch(`${API_URL}/matches/${roomCode}/start`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({}) // Send an empty object if no specific body is needed by backend
        });
        return await handleResponse(response, 'Failed to start match');
    } catch (error) {
        console.error('Frontend: Error starting match:', error);
        throw error;
    }
};

export const nextGame = async (roomCode, newGameNumber, isMatchFinished) => {
    try {
        console.log(`Frontend: Requesting next game for match ${roomCode}, game ${newGameNumber}. Finished: ${isMatchFinished}`);
        const response = await fetch(`${API_URL}/matches/${roomCode}/next-game`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ newGameNumber, isMatchFinished })
        });
        const data = await handleResponse(response, 'Failed to advance game');
        // Backend returns { success: true, newStatus: ..., newCurrentGameNumber: ..., gameData: ... }
        return {
            newStatus: data.newStatus,
            newCurrentGameNumber: data.newCurrentGameNumber,
            gameData: data.gameData // This will be null if finished, or the game object
        };
    } catch (error) {
        console.error('Frontend: Error advancing game:', error);
        throw error;
    }
};
