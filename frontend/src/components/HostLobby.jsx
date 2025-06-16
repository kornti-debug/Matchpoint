// components/HostLobby.jsx
import React, { useState } from 'react';

function HostLobby({ roomCode, matchState, setMatchState, startMatch }) {
    const [playerName, setPlayerName] = useState('');

    const handleJoinAsHostPlayer = () => {
        if (!playerName.trim()) return;
        const newPlayer = { id: `host-player-${Date.now()}`, name: playerName.trim() };
        setMatchState(prev => ({
            ...prev,
            players: [...prev.players, newPlayer],
            scores: { ...prev.scores, [newPlayer.id]: 0 } // Initialize score for host-player
        }));
        setPlayerName(''); // Clear input

    };

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-2xl text-center border-2 border-blue-600">
            <h2 className="text-4xl font-bold mb-4 text-blue-400">Host Lobby: {matchState.matchDetails.matchname}</h2>
            <p className="text-xl text-gray-300 mb-6">Room Code: <span className="font-mono text-blue-300 text-2xl bg-gray-700 p-2 rounded-md tracking-wider">{roomCode}</span></p>

            <p className="text-lg text-gray-400 mb-6">Share this code with players to join!</p>

            <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-3 text-white">Players Joined:</h3>
                {matchState.players.length === 0 ? (
                    <p className="text-gray-400">No players yet. Waiting...</p>
                ) : (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {matchState.players.map(player => (
                            <li key={player.id} className="bg-gray-700 text-gray-200 p-3 rounded-lg shadow-sm">
                                {player.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button
                onClick={startMatch}
                disabled={matchState.players.length === 0} // Disable if no players
                className={`w-full text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105
                    ${matchState.players.length === 0 ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
                Start Match ({matchState.totalGames} Games)
            </button>
            {matchState.players.length === 0 && (
                <p className="text-red-400 mt-2">At least one player must join to start the match.</p>
            )}
        </div>
    );
}

export default HostLobby;
