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

export const createMatch = async (matchName) => {
    try {
        console.log("haha",matchName)
        const response = await fetch(`${API_URL}/matches`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },body: JSON.stringify({matchName})
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
export const joinMatch = async (roomCode, playerName = 'Player') => {
    try {
        // Send request to your backend to join the match.
        // Your backend would typically use the auth token to identify the joining user.
        const response = await fetch(`${API_URL}/matches/${roomCode}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            // If your backend needs a player name explicitly, include it here:
            // body: JSON.stringify({ playerName })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to join match');
        }

        const result = await response.json();

        // TEMPORARY: Create a mock player object for client-side state update
        // In a real app, your backend might return the player's details, or
        // a WebSocket message would populate the full player list for the match.
        const mockPlayer = {
            id: result.playerId || `temp-player-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: playerName // Use the provided name or a default
        };
        console.log(`Mock: Player ${mockPlayer.name} joined match ${roomCode}.`);
        return mockPlayer; // Return the mock player for client-side use
    } catch (error) {
        console.error('Error joining match:', error);
        throw error;
    }
};

// --- NEW TEMPORARY MOCK API Calls (to prevent errors in MatchController) ---

// Mock game data as your backend doesn't seem to have this endpoint yet.
const tempMockGameData = {
    1: { name: "The Grand Opening", description: "This is the first challenge! It requires quick thinking and a bit of luck. Players must identify 5 common household items within 30 seconds." },
    2: { name: "Musical Chairs Mayhem", description: "A classic game with a twist! When the music stops, players must find a chair. The last player standing wins!" },
    3: { name: "Fact or Fiction", description: "The host reads a statement. Players must decide if it's a fact or fiction. Correct answers score points!" },
    // Add more games as needed, up to 15
    15: { name: "Grand Finale Quiz", description: "A rapid-fire general knowledge quiz covering various topics. The player with the most correct answers wins the final big points!" }
};

// Placeholder for fetching game data
export const getGameData = async (gameNumber) => {
    console.warn(`API Service: MOCK - getGameData called for game ${gameNumber}. You need to implement this on your backend.`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const data = tempMockGameData[gameNumber];
    if (data) {
        return data;
    } else {
        // Return a generic game if the number is out of bounds for the mock
        return {
            name: `Game ${gameNumber}`,
            description: `This is a placeholder description for Game ${gameNumber}. Implement the actual game data fetching from your backend.`
        };
    }
};

// Placeholder for saving game results
export const saveGameResults = async (roomCode, gameNumber, winners, points, newScores) => {
    console.warn(`API Service: MOCK - saveGameResults called for room ${roomCode}, game ${gameNumber}. You need to implement this on your backend.`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400));

    // In a real scenario, you'd send winners, points, and possibly current scores to your backend.
    // The backend would update its database.
    console.log('MOCK saveGameResults data:', { roomCode, gameNumber, winners, points, newScores });

    return { success: true, message: 'Mock results saved successfully.' };
};


/**
 * Fetches all games from the backend.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of game objects.
 */
