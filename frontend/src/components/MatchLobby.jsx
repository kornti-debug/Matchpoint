import {useState} from "react";


function MatchLobby(){

const [matchName, setMatchName] = useState("room123");
const [roomCode] = useState("ABC123");
const [copySuccess, setCopySuccess] = useState(false)

const player = [
    {id:1, name:"herbert"},
    {id:2, name:"fred" },
    {id:3, name:"fraunz"}
]

const gameTypes = [
    {type: "quiz games"},
    {type: "real life games"},
    {type: "mixed games"},
]

const equipment = ["dice", "playing cards"]

const handleMatchName = () => {

}

const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopySuccess(true); // Always show "copied" state
    setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
}

const handleStartMatch = () => {

}

return(
    <div className="min-h-screen bg-gray-900 text-gray-100">
        <h1 className="text-5xl font-bold text-gray-400 mb-6">
            Match
        </h1>
        <label htmlFor="roomName" className="block text-sm font-medium text-gray-300 mb-2">
            Room Name
        </label>
        <input
            id="roomName"
            type="text"
            value={matchName}
            onChange={(e) => setMatchName(e.target.value)}

            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder=""
        />

        <button onClick={handleMatchName} className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition duration-200">
            Change Name
        </button>

        <br/>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Room Code
        </label>
        <input
            id="name"
            type="text"
            value={roomCode}
            readOnly
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder=""
        />

        <button
            onClick={handleCopyCode}
            className={`px-6 py-3 rounded-lg transition duration-200 font-medium flex items-center gap-2 ${
                copySuccess
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
        >
            {copySuccess ? 'Copied!' : 'Copy'}
        </button>
        <div className="flex">
        <div className="bg-gray-800 w-32" >
            <label htmlFor="players" className="block text-sm font-medium text-gray-300 mb-2">
                Players
            </label>
            {player.map((player) => (<p key={player.id}>{player.name}</p>))}

        </div>
        <div className="bg-gray-800 w-32">
            <label htmlFor="gameType" className="block text-sm font-medium text-gray-300 mb-2">
                Game Type
            </label>
            {gameTypes.map((gameTypes) => (<p>{gameTypes.type}</p>))}
        </div>
        <div className="bg-gray-800 w-32">
            <label htmlFor="equipment" className="block text-sm font-medium text-gray-300 mb-2">
                Equipment needed
            </label>
            {equipment.map((equipment) => (<p>{equipment}</p>))}
        </div>
        </div>
        <button onClick={handleStartMatch} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition duration-200">
            Start Match
        </button>
    </div>
)
}

export default MatchLobby;