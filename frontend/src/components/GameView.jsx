// src/components/GameView.jsx
import React, { useState, useEffect } from 'react';

function GameView({ roomCode, matchState, isHost, submitGameResults, backToScoreboard }) {
    const { matchDetails, players } = matchState;
    const currentGameIndex = matchDetails.current_game_number; // This is the 0-based index
    const gameData = matchState.gameData;
    const totalGames = matchState.totalGames; // This is length of sequence

    const [selectedWinners, setSelectedWinners] = useState([]);

    useEffect(() => {
        setSelectedWinners([]);
    }, [currentGameIndex, gameData]); // Reset winners when game changes


    if (!gameData) { // Crucial check: if gameData is null, display loading
        return (
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-xl text-center">
                <p className="text-red-400 text-xl">Loading game data for Game {currentGameIndex + 1}...</p> {/* Displaying index + 1 */}
            </div>
        );
    }

    const handleWinnerToggle = (player) => {
        setSelectedWinners(prev =>
            prev.some(w => w.id === player.id)
                ? prev.filter(w => w.id !== player.id)
                : [...prev, player]
        );
    };

    const handleSubmit = () => {
        if (selectedWinners.length === 0) {
            console.warn("Please select at least one winner.");
            return;
        }
        // CRITICAL FIX: Pass the calculated points (currentGameIndex + 1) to submitGameResults
        // This ensures the backend (via MatchController) receives 1 point for Game 1, 2 for Game 2, etc.
        submitGameResults(selectedWinners, currentGameIndex + 1);
    };

    // CRITICAL FIX: Calculate points display to always be currentGameIndex + 1
    const pointsForCurrentGameDisplay = currentGameIndex + 1;


    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-3xl border-2 border-purple-600">
            <h2 className="text-4xl font-bold mb-4 text-purple-400 text-center">Game {currentGameIndex + 1} of {totalGames}</h2>

            <div className="bg-gray-700 p-6 rounded-lg mb-6 shadow-inner">
                <h3 className="text-3xl font-semibold mb-3 text-white">{gameData.title || `Unnamed Game ${currentGameIndex + 1}`}</h3>
                <p className="text-gray-300 text-lg leading-relaxed">{gameData.description || "No description provided for this game."}</p>
            </div>

            {isHost && (
                <div className="mt-8 border-t border-gray-700 pt-6">
                    <h3 className="text-2xl font-bold mb-4 text-white">Host Controls:</h3>
                    {/* CRITICAL FIX: Display the calculated pointsForCurrentGameDisplay */}
                    <p className="text-gray-300 mb-4">Select the winner(s) for this game. This game awards <span className="font-bold text-yellow-300">{pointsForCurrentGameDisplay}</span> points.</p>

                    <h4 className="text-xl font-semibold mb-3 text-white">Select Winners:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                        {players.length > 0 ? players.map(player => (
                            <button
                                key={player.id}
                                type="button"
                                onClick={() => handleWinnerToggle(player)}
                                className={`p-3 rounded-lg shadow-md transition duration-200
                                    ${selectedWinners.some(w => w.id === player.id)
                                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                }`}
                            >
                                {player.name}
                            </button>
                        )) : <p className="col-span-full text-gray-400">No players to select from.</p>}
                    </div>

                    <div className="flex justify-between gap-4 mt-6">
                        <button
                            onClick={handleSubmit}
                            disabled={selectedWinners.length === 0}
                            className={`flex-grow text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105
                                ${selectedWinners.length === 0 ? 'bg-gray-500 cursor-not-allowed' : 'bg-purple-700 hover:bg-purple-800'}`}
                        >
                            Submit Results
                        </button>
                        <button
                            onClick={backToScoreboard}
                            className="flex-grow bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
                        >
                            Back to Scoreboard
                        </button>
                    </div>
                </div>
            )}
            {!isHost && (
                <p className="text-center text-gray-400 mt-6 text-lg">
                    Waiting for the host to submit results for Game {currentGameIndex + 1}...
                </p>
            )}
        </div>
    );
}

export default GameView;
