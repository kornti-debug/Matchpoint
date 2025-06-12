

const API_URL = 'http://localhost:3000/api';

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

export const joinMatch = async (roomCode) => {
    try {
        const response = await fetch(`${API_URL}/matches/${roomCode}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to join match');
        }

        return await response.json();
    } catch (error) {
        console.error('Error joining match:', error);
        throw error;
    }
};


