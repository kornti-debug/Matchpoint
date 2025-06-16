// components/PlayerLobby.jsx
import React, { useState, useEffect } from 'react';
import * as apiService from '../services/apiService.js';

function PlayerLobby({ roomCode, matchState, setMatchState }) {
    const [hasJoined, setHasJoined] = useState(false);
    const [joinMessage, setJoinMessage] = useState('');

    // --- NEW useEffect to check if already joined on load/matchState change ---
    useEffect(() => {
        const checkJoinedStatus = () => {
            const currentUserId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage after login
            if (currentUserId && matchState.players && matchState.players.length > 0) {
                const alreadyJoined = matchState.players.some(
                    player => player.user_id === parseInt(currentUserId, 10) // Compare user_id from DB (number)
                );
                setHasJoined(alreadyJoined);
                if (alreadyJoined) {
                    setJoinMessage(`Welcome! Waiting for the host to start the game.`);
                }
            } else {
                setHasJoined(false); // Reset if no players or no user ID
            }
        };

        checkJoinedStatus();
    }, [matchState.players]); // Re-run when players list updates from fetchMatchDetails


    const handleJoinMatch = async () => {
        try {
            const newPlayer = await apiService.joinMatch(roomCode);

            setMatchState(prev => {
                const existingPlayer = prev.players.find(p => p.id === newPlayer.id);
                if (!existingPlayer) { // Only add if not already in state
                    return {
                        ...prev,
                        players: [...prev.players, newPlayer],
                        scores: { ...prev.scores, [newPlayer.id]: newPlayer.total_score || 0 }
                    };
                }
                return prev;
            });

            setHasJoined(true);
            setJoinMessage(`Welcome! Waiting for the host to start the game.`);

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
                    <h3 className="text-2xl font-semibold mb-3 text-white">Ready to Join? Click below!</h3>
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
                    <h3 className="text-2xl font-semibold mb-3 text-white">You've Joined!</h3>
                    {/* Display message based on match status, if desired */}
                    {matchState.matchDetails.status === 'in_progress' && (
                        <p className="text-yellow-400 text-lg mb-4">The match has started! Go to Game View.</p>
                    )}
                    {matchState.matchDetails.status === 'finished' && (
                        <p className="text-purple-400 text-lg mb-4">The match has finished! Go to Final Results.</p>
                    )}
                    <p className="text-gray-400 text-lg">Waiting for the host to start the game...</p> {/* Default message */}

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
