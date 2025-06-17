// components/PlayerLobby.jsx
import React, { useState, useEffect } from 'react';
import * as apiService from '../services/apiService.js'; // Keep import for potential future use or if needed elsewhere

function PlayerLobby({ roomCode, matchState, setMatchState }) {
    const [hasJoined, setHasJoined] = useState(false);
    const [joinMessage, setJoinMessage] = useState('');

    useEffect(() => {
        const currentUserId = localStorage.getItem('userId');
        console.log("PlayerLobby useEffect check: currentUserId from localStorage:", currentUserId);
        console.log("PlayerLobby useEffect check: matchState.players:", matchState.players);

        if (currentUserId && matchState.players && matchState.players.length > 0) {
            const alreadyJoined = matchState.players.some(
                player => player.user_id === parseInt(currentUserId, 10)
            );
            setHasJoined(alreadyJoined);
            if (alreadyJoined) {
                setJoinMessage(`Welcome! Waiting for the host to start the game.`);
            } else if (matchState.matchDetails.status === 'in_progress' || matchState.matchDetails.status === 'finished') {
                // Player is not in this match, but match is already ongoing/finished
                // So they can't join now, just display status.
                setJoinMessage("This match has already started or finished. You cannot join.");
            }
        } else {
            // This case should ideally not happen if user is logged in and matchDetails are fetched
            // But if it does, they are not joined.
            setHasJoined(false);
            setJoinMessage(''); // Clear previous join messages
        }
    }, [matchState.players, matchState.matchDetails.status]);

    // --- REMOVED handleJoinMatch function entirely or made it a no-op if no longer needed ---
    // If you need it for a "rejoin" feature, consider its logic carefully.
    // For now, if PlayerLobby is reached, the join API call should have already happened.
    const handleJoinMatch = () => {
        // This function should ideally not be called if the user has already joined
        // If it's still being called, it means the UI state for hasJoined is incorrect.
        console.warn("PlayerLobby: Join Match button was clicked, but should be handled by Dashboard now.");
        setJoinMessage("You should have already joined. Please refresh if you believe there's an error.");
    };


    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-xl text-center border-2 border-green-600">
            <h2 className="text-4xl font-bold mb-4 text-green-400">Player Lobby: {matchState.matchDetails.matchname}</h2>
            <p className="text-xl text-gray-300 mb-6">Room Code: <span className="font-mono text-green-300 text-2xl bg-gray-700 p-2 rounded-md tracking-wider">{roomCode}</span></p>

            {/* Conditional rendering based on hasJoined state */}
            {!hasJoined ? (
                // --- This section should now ideally NOT be visible if join happened from Dashboard ---
                <div className="mb-6">
                    <h3 className="text-2xl font-semibold mb-3 text-white">Ready to Join? Click below!</h3>
                    <p className="text-red-400 mb-4">{joinMessage || "It looks like you haven't fully joined this match yet. Please try again or ensure you clicked 'Join Match' on the Dashboard."}</p>
                    {/* The button below should likely be removed or made to redirect if hasJoined is false */}
                    <button
                        onClick={handleJoinMatch} // This button's click should ideally not be needed.
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
                    >
                        Re-attempt Join (Debug)
                    </button>
                </div>
            ) : (
                <>
                    {/* Display based on match status if already joined */}
                    {matchState.matchDetails.status === 'in_progress' ? (
                        <p className="text-yellow-400 text-lg mb-4">The match has started! Please go to Game {matchState.currentGame + 1}.</p>
                    ) : matchState.matchDetails.status === 'finished' ? (
                        <p className="text-purple-400 text-lg mb-4">The match has finished! Please go to Final Results.</p>
                    ) : (
                        <p className="text-gray-400 text-lg">{joinMessage}</p>
                    )}

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
