// components/PlayerLobby.jsx
import React, { useState, useEffect } from 'react';

function PlayerLobby({ roomCode, matchState, setMatchState }) {
    const [playerName, setPlayerName] = useState('');
    const [hasJoined, setHasJoined] = useState(false);
    const [joinMessage, setJoinMessage] = useState('');

    // Simulate joining on initial render if not already joined
    useEffect(() => {
        // In a real app, this would check localStorage or a cookie for a player ID
        // and attempt to rejoin, or prompt for name if not found.
        // For now, we'll prompt for a name if not yet joined.
    }, []);

    const handleJoinMatch = async () => {
        if (!playerName.trim()) {
            setJoinMessage('Please enter a name!');
            return;
        }

        try {
            // Simulate API call to join a match.
            // In a real app, this would send the player's name to the backend
            // and the backend would return a player ID and update match state.
            const newPlayer = await apiService.joinMatch(roomCode, playerName.trim());

            setMatchState(prev => ({
                ...prev,
                players: [...prev.players, newPlayer],
                scores: { ...prev.scores, [newPlayer.id]: 0 } // Initialize score
            }));
            setHasJoined(true);
            setJoinMessage(`Welcome, ${newPlayer.name}! Waiting for the host to start the game.`);
            // In a real WebSocket setup, the player would open a WebSocket here
            // and send a 'player_joined' message to the server.
            // The server would then broadcast this to the host and other players.

        } catch (error) {
            console.error("Error joining match:", error);
            setJoinMessage(`Failed to join: ${error.message}`);
        }
    };


    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-xl text-center border-2 border-green-600">
            <h2 className="text-4xl font-bold mb-4 text-green-400">Player Lobby: {matchState.matchDetails.matchname}</h2>
            <p className="text-xl text-gray-300 mb-6">Room Code: <span className="font-mono text-green-300 text-2xl bg-gray-700 p-2 rounded-md tracking-wider">{roomCode}</span></p>

            {!hasJoined ? (
                <div className="mb-6">
                    <h3 className="text-2xl font-semibold mb-3 text-white">Enter Your Name to Join:</h3>
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                    />
                    <button
                        onClick={handleJoinMatch}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
                    >
                        Join Match
                    </button>
                    {joinMessage && <p className="mt-4 text-sm text-red-400">{joinMessage}</p>}
                </div>
            ) : (
                <>
                    <h3 className="text-2xl font-semibold mb-3 text-white">Joined as: <span className="text-green-300">{playerName}</span></h3>
                    <p className="text-gray-400 text-lg">Waiting for the host to start the game...</p>
                    <div className="mt-8">
                        <h4 className="text-xl font-semibold mb-3 text-white">Current Players:</h4>
                        {matchState.players.length === 0 ? (
                            <p className="text-gray-400">No players yet (or data not synchronized).</p>
                        ) : (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300">
                                {matchState.players.map(player => (
                                    <li key={player.id} className="bg-gray-700 p-2 rounded-md shadow-sm">
                                        {player.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default PlayerLobby;
