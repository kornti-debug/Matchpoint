import {Link, useNavigate} from "react-router-dom";
import {useState} from "react";
import * as apiService from "../services/apiService.js";


function Register(){

        const [username, setUsername] = useState('')
        const [password, setPassword] = useState('')
        const [error, setError] = useState('')
        const navigate = useNavigate()

        const handleRegister = async (e) => {
            e.preventDefault()
            setError('')
            try{
                const data = await apiService.register(username,password)
                localStorage.setItem('token', data.token)
                navigate('/dashboard')
            } catch (error) {
                setError(error.message)
            }


        }

        return(
            <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">

                    <h2 className="text-3xl font-bold text-center text-white mb-8">Register</h2>

                    {error && (
                        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div>
                            <label htmlFor="user" className="block text-sm font-medium text-gray-300 mb-2">
                                User
                            </label>
                            <input
                                type="text"
                                id="user"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
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
                        <Link
                            to="/"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 transform hover:scale-105"
                        >
                            already registered? Log in here
                        </Link>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105"
                        >
                            Register
                        </button>
                    </form>
                </div>
            </div>

        )
    }

export default Register