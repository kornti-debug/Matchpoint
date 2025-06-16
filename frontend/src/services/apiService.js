// services/apiService.js

// Make sure this matches your actual backend URL
const API_URL = 'http://localhost:3000/api';

// --- Existing API Calls (from your provided code) ---

export const login = async (username, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username,password}),
        })
        if(!response.ok){
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed')
        }
        return await response.json();
    } catch (error) {
        console.error('Login error:', error)
        throw error;
    }
}

export const register = async (username, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username, password}),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create user');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const createMatch = async (matchName, gameSequence) => {
    try {
        console.log("haha",matchName)
        const response = await fetch(`${API_URL}/matches`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },body: JSON.stringify({matchName, gameSequence})
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create match');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating match:', error);
        throw error;
    }
};

export const createGame = async (gameData) => {
    try {
        console.log({gameData})
        const response = await fetch(`${API_URL}/games/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },body: JSON.stringify(gameData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create game');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating game:', error);
        throw error;
    }
};

export const getMatchDetails = async (roomCode) => {
    try {
        const response = await fetch(`${API_URL}/matches/${roomCode}`, {
            method: 'GET',
            headers:
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
        })

        if(!response.ok){
            const errorData = await response.json();
            throw new Error(errorData.message || `failed to get match with id ${roomCode}`)
        }

        return await response.json();
    } catch (error) {
        console.error('error getting match details:', error);
        throw error;
    }
}

export const getAllGames = async () => {
    try {
        console.log('Frontend: Fetching all games from backend.');
        const response = await fetch(`${API_URL}/games`, { // Note the endpoint: /api/games
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Protected route
            }
        });
        if(!response.ok){
            const errorData = await response.json();
            throw new Error(errorData.message || `failed to fetch games`)
        }


        return await response.json(); // Backend returns { success: true, games: [...] }
    } catch (error) {
        console.error('Frontend: Error getting all games:', error);
        throw error;
    }
};

// ... (existing code for login, register, createMatch, getMatchDetails, etc.) ...

/**
 * Fetches a single game's details from the backend by ID.
 * @param {number} gameId - The ID of the game to fetch.
 * @returns {Promise<Object>} A promise that resolves with the game object.
 */
export const getGameById = async (gameId) => {
    try {
        console.log(`Frontend: Fetching game with ID ${gameId} from backend.`);
        const response = await fetch(`${API_URL}/games/${gameId}`, { // Endpoint: /api/games/:id
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        if(!response.ok){
            const errorData = await response.json();
            throw new Error(errorData.message || `failed to fetch games`)
        }

        const data = await response.json()
        console.log(data)
        return data.result; // Backend returns { success: true, game: {...} }
    } catch (error) {
        console.error(`Frontend: Error getting game with ID ${gameId}:`, error);
        throw error;
    }
};

export const updateGame = async (gameId, gameData) => {
    try {
        console.log(`Frontend: Updating game with ID ${gameId} with data:`, gameData);
        const response = await fetch(`${API_URL}/games/${gameId}`, {
            method: 'PUT', // Use PUT method for updating
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Authenticated route
            },
            body: JSON.stringify(gameData)
        });
        if(!response.ok){
            const errorData = await response.json();
            throw new Error(errorData.message || `failed to update game`)
        }
        return await response.json();
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
            headers: {
                'Content-Type': 'application/json', // Good practice to include, even if no body
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        // Use your current error handling pattern if you don't have handleResponse
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to delete game with ID ${gameId}`);
        }
        return await response.json();

    } catch (error) {
        console.error(`Frontend: Error deleting game with ID ${gameId}:`, error);
        throw error;
    }
};

// ... (rest of your apiService.js) ...

export const updateMatchName = async (roomCode, matchName) => {
    try {
        const response = await fetch(`${API_URL}/matches/${roomCode}`, {
            method: 'PATCH',
            headers:
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            body: JSON.stringify({
                matchName: matchName

            })
        })

        if(!response.ok){
            const errorData = await response.json();
            throw new Error(errorData.message || `failed to update match`)
        }

        return await response.json();
    } catch (error) {
        console.error('error updating match :', error);
        throw error;
    }
}

// Adjusted joinMatch to temporarily accept playerName for client-side testing
// In a real app, your backend would likely handle player association based on authentication.
export const joinMatch = async (roomCode) => {
    try {
        // Send request to your backend to join the match.
        // Your backend would typically use the auth token to identify the joining user.
        const response = await fetch(`${API_URL}/matches/${roomCode}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },

        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to join match');
        }

        const result = await response.json();

        console.log("joinmatch api: ",result)
        return result; // Return the mock player for client-side use
    } catch (error) {
        console.error('Error joining match:', error);
        throw error;
    }
};


export const getGameData = async (gameNumber) => {
try{
    const response = await fetch(`${API_URL}/matches/games/${gameNumber}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start match');
    }
    const result = await response.json();
    console.log("testtest", result.game)
    return result.game
    } catch (error){
    throw error
}

};

// Placeholder for saving game results
export const saveGameResults = async (roomCode, gameNumber, winners, points) => { // Removed newScores from args, as it's computed on backend
    try {
        console.log(`Frontend: Submitting REAL game results for match ${roomCode}, game ${gameNumber}.`);
        const response = await fetch(`${API_URL}/matches/${roomCode}/results`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ gameNumber, winners, points }) // Send necessary data
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save game results');
        }

        const data = await response.json();
        // Backend should return { success: true, updatedPlayers: [...], updatedScores: {...} }
        return { updatedPlayers: data.updatedPlayers, updatedScores: data.updatedScores };
    } catch (error) {
        console.error('Frontend: Error saving REAL game results:', error);
        throw error;
    }
};

export const startMatch = async (roomCode) => {
    try {
        console.log(`Frontend: Requesting to START REAL match ${roomCode} from backend.`);
        const response = await fetch(`${API_URL}/matches/${roomCode}/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({}) // Send an empty object if no specific body is needed by backend
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to start match');
        }
        return await response.json(); // Backend returns { success: true, message: ... }
    } catch (error) {
        console.error('Frontend: Error starting REAL match:', error);
        throw error;
    }
};

export const nextGame = async (roomCode, newGameNumber, isMatchFinished) => {
    try {
        console.log(`Frontend: Requesting REAL next game for match ${roomCode}, game ${newGameNumber}. Finished: ${isMatchFinished}`);
        const response = await fetch(`${API_URL}/matches/${roomCode}/next-game`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ newGameNumber, isMatchFinished }) // Send necessary data
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to advance game');
        }

        const data = await response.json();
        // Backend returns { success: true, newStatus: ..., newCurrentGameNumber: ..., gameData: ... }
        return {
            newStatus: data.newStatus,
            newCurrentGameNumber: data.newCurrentGameNumber,
            gameData: data.gameData // This will be null if finished, or the game object
        };
    } catch (error) {
        console.error('Frontend: Error advancing REAL game:', error);
        throw error;
    }
};




/**
 * Fetches all games from the backend.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of game objects.
 */
