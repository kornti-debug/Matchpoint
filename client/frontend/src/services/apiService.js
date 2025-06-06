

const API_URL = 'http://localhost:3000/api';

export const login = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email,password}),
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