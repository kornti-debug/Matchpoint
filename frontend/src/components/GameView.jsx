// components/GameView.jsx
import React, { useState, useEffect } from 'react';

function GameView({ roomCode, matchState, isHost, submitGameResults, backToScoreboard }) {
    const { currentGame, totalGames, gameData, players } = matchState;
    const [selectedWinners, setSelectedWinners] = useState([]);
    const [points, setPoints] = useState(1); // Default points for a game

    // Reset selected winners when game changes
    useEffect(() => {
        setSelectedWinners([]);
    }, [currentGame]);

    if (!gameData) {
        return (
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-xl text-center">
                <p className="text-red-400 text-xl">Loading game data for Game {currentGame}...</p>
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
        if (selectedWinners.length > 0) {
            submitGameResults(selectedWinners, parseInt(points));
        } else {
            // Implement a custom modal/message for user feedback, do not use alert()
            console.warn("Please select at least one winner.");
        }
    };

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-3xl border-2 border-purple-600">
            <h2 className="text-4xl font-bold mb-4 text-purple-400 text-center">Game {currentGame} of {totalGames}</h2>

            <div className="bg-gray-700 p-6 rounded-lg mb-6 shadow-inner">
                <h3 className="text-3xl font-semibold mb-3 text-white">{gameData.name || `Unnamed Game ${currentGame}`}</h3>
                <p className="text-gray-300 text-lg leading-relaxed">{gameData.description || "No description provided for this game."}</p>
            </div>

            {isHost && (
                <div className="mt-8 border-t border-gray-700 pt-6">
                    <h3 className="text-2xl font-bold mb-4 text-white">Host Controls:</h3>
                    <p className="text-gray-300 mb-4">Select the winner(s) for this game and assign points.</p>

                    <div className="mb-6">
                        <label htmlFor="points" className="block text-gray-300 text-lg font-semibold mb-2">Points for this game:</label>
                        <input
                            type="number"
                            id="points"
                            value={points}
                            onChange={(e) => setPoints(e.target.value)}
                            min="1"
                            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <h4 className="text-xl font-semibold mb-3 text-white">Select Winners:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                        {players.length > 0 ? players.map(player => (
                            <button
                                key={player.id}
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
                    Waiting for the host to submit results for Game {currentGame}...
                </p>
            )}
        </div>
    );
}

export default GameView;
