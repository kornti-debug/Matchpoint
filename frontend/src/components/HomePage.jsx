import {useState} from "react";
import {useNavigate} from "react-router-dom";
import * as apiService from "../services/apiService.js";


function HomePage(){

    const [user, setUser] = useState('ironman@iron.com')
    const [password, setPassword] = useState('ironmann')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        try{
            const data = await apiService.login(user,password)
            localStorage.setItem('token', data.token)
            navigate('/dashboard')
        } catch (error) {
            setError(error.message)
        }


    }

    return(
        <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">

                <h2 className="text-3xl font-bold text-center text-white mb-8">Login</h2>

                {error && (
                    <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="user" className="block text-sm font-medium text-gray-300 mb-2">
                            User
                        </label>
                        <input
                            type="text"
                            id="user"
                            value={user}
                            onChange={(e) => setUser(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="ironman@iron.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="ironmann"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>

    )
}

export default HomePage