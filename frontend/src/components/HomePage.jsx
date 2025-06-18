import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Link} from "react-router-dom";
import * as apiService from "../services/apiService.js";
import Logo from '../assets/logo2.svg'


function HomePage(){

    const [user, setUser] = useState('Tony23')
    const [password, setPassword] = useState('ironmann')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        try{
            const data = await apiService.login(user,password)
            console.log("BIIIBO",   data)
            localStorage.setItem('token', data.token)
            localStorage.setItem('userId', data.user.id.toString())
            window.dispatchEvent(new Event('authChanged'))
            navigate('/dashboard')
        } catch (error) {
            setError(error.message)
        }


    }

    return(
        <div className="min-h-screen bg-gray-900 text-gray-100 flex pt-20 justify-center px-4">
            <div className="flex flex-col items-center">
                <img
                    src={Logo}
                    alt="Logo"
                    className="mb-16 w-48 h-auto"
                />

                <div className="bg-gray-800 rounded-lg shadow-xl p-8">
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

                        <p className="text-white">
                            no account?{' '}
                            <Link
                                to="/register"
                                className="text-teal-500 font-semibold hover:underline transition duration-200"
                            >
                                Register
                            </Link>
                        </p>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>

    )
}

export default HomePage