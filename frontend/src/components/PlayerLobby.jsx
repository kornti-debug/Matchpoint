// src/components/PlayerLobby.jsx (locate and modify)
import React, { useState, useEffect } from 'react';
import * as apiService from '../services/apiService.js';

function PlayerLobby({ roomCode, matchState, setMatchState }) {
    // REMOVED: const [playerName, setPlayerName] = useState('');
    const [hasJoined, setHasJoined] = useState(false);
    const [joinMessage, setJoinMessage] = useState('');

    const handleJoinMatch = async () => {
        // REMOVED: if (!playerName.trim()) validation

        try {
            // Call the real API service to join a match. No playerName needed here.
            const newPlayer = await apiService.joinMatch(roomCode); // Simplified call

            // Update local state for this player's view
            setMatchState(prev => {
                const existingPlayer = prev.players.find(p => p.id === newPlayer.id);
                if (!existingPlayer) {
                    return {
                        ...prev,
                        players: [...prev.players, newPlayer],
                        scores: { ...prev.scores, [newPlayer.id]: newPlayer.total_score || 0 }
                    };
                }
                return prev;
            });

            setHasJoined(true);
            setJoinMessage(`Welcome! Waiting for the host to start the game.`); // Simplified message

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
                    <h3 className="text-2xl font-semibold mb-3 text-white">Ready to Join? Click below!</h3> {/* Simplified text */}
                    {/* REMOVED PLAYER NAME INPUT FIELD */}
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
                    <h3 className="text-2xl font-semibold mb-3 text-white">You've Joined!</h3> {/* Simplified message */}
                    <p className="text-gray-400 text-lg">Waiting for the host to start the game...</p>
                    <div className="mt-8">
                        <h4 className="text-xl font-semibold mb-3 text-white">Current Players:</h4>
                        {matchState.players.length === 0 ? (
                            <p className="text-gray-400">No players yet (or data not synchronized).</p>
                        ) : (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300">
                                {matchState.players.map(player => (
                                    <li key={player.id} className="bg-gray-700 p-2 rounded-md shadow-sm">
                                        {player.name} {player.total_score !== undefined ? `(${player.total_score} pts)` : ''}
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