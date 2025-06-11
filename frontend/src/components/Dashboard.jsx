import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import * as apiService from "../services/apiService.js";



function Dashboard(){

    const [createMatchName, setCreateMatchName] = useState("")
    const [joinMatchName, setJoinMatchName] = useState("")
    const navigate = useNavigate();

    const handleCreateMatch = async () => {
        try {
            const result = await apiService.createMatch();
            if (result.success) {
                // Navigate to host lobby with the room code
                navigate(`/match/${result.roomCode}/host`);
            }
        } catch (error) {
            alert('Failed to create match: ' + error.message);
        }
    };

    const handleJoinMatch = async () => {
        try {
            const result = await apiService.joinMatch(joinMatchName);
            if (result.success) {
                // Navigate to player lobby
                navigate(`/match/${joinMatchName}/player`);
            }
        } catch (error) {
            alert('Failed to join match: ' + error.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');

    }


    return(
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
            >
                Logout
            </button>
            <Link
                to="/profile"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200 transform hover:scale-105"
            >
                Profile
            </Link>
    <h1 className="text-5xl font-bold text-gray-400 mb-6">
        Dashboard
    </h1>
            <label htmlFor="matchName" className="block text-sm font-medium text-gray-300 mb-2">
                New Match
            </label>
            <input
                id="matchName"
                type="text"
                value={createMatchName}
                onChange={(e) => setCreateMatchName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="match name"
            />

                <button onClick={handleCreateMatch} className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition duration-200">
                    Create Match
                </button>

            <br/>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Join Match
            </label>
            <input
                id="name"
                type="text"
                value={joinMatchName}
                onChange={(e) => setJoinMatchName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="join name"
            />

                <button onClick={handleJoinMatch} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition duration-200">
                    Join Match
                </button>

        </div>
    )
}

export default Dashboard