import {useState} from "react";
import {useNavigate} from "react-router-dom";

function MatchLobby(){

const [matchName, setMatchName] = useState("");
const [roomCode, setRoomCode] = useState("");

return(
    <div className="min-h-screen bg-gray-900 text-gray-100">
        <h1 className="text-5xl font-bold text-gray-400 mb-6">
            Match
        </h1>
        <label htmlFor="roomName" className="block text-sm font-medium text-gray-300 mb-2">
            New Match
        </label>
        <input
            id="roomName"
            type="text"
            value={matchName}
            onChange={(e) => setMatchName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="match name"
        />

        <button onClick={handleMatchName} className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition duration-200">
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

export default MatchLobby;