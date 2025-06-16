// src/components/Scoreboard.jsx
import React from 'react';
import * as apiService from "../services/apiService.js";

function Scoreboard({ roomCode, matchState, isHost, nextGame, isReviewingScoreboard, setMatchState }) { // Receive new prop and setMatchState
    const { players, totalGames, matchDetails } = matchState;
    const currentGameNumber = matchDetails.current_game_number;

    const playerScores = players.map(player => ({
        ...player,
        score: player.total_score || 0
    })).sort((a, b) => b.score - a.score);

    // --- NEW: Function to return to the current game ---
    const resumeCurrentGame = async () => {
        // Only host can resume the game
        if (!isHost) return;

        // Fetch current game data again to ensure state is fresh
        try {
            const gameData = await apiService.getGameData(currentGameNumber); // Use the current game number
            setMatchState(prev => ({
                ...prev,
                phase: 'game',          // Go back to game phase
                gameData: gameData      // Load current game data
            }));
            console.log('Host: Resuming current game.');
        } catch (error) {
            console.error('Failed to resume current game:', error);
            setMatchState(prev => ({ ...prev, error: `Failed to resume game: ${error.message}` }));
        }
    };
    // --- END NEW FUNCTION ---

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-2xl text-center border-2 border-yellow-600">
            <h2 className="text-4xl font-bold mb-6 text-yellow-400">Current Scoreboard</h2>

            {playerScores.length === 0 ? (
                <p className="text-gray-400 text-xl">No scores to display yet. Join some players!</p>
            ) : (
                <div className="overflow-x-auto mb-8">
                    <table className="min-w-full bg-gray-700 rounded-lg shadow-md overflow-hidden">
                        <thead className="bg-gray-600">
                        <tr>
                            <th className="py-3 px-4 text-left text-lg font-semibold text-gray-200">Rank</th>
                            <th className="py-3 px-4 text-left text-lg font-semibold text-gray-200">Player</th>
                            <th className="py-3 px-4 text-right text-lg font-semibold text-gray-200">Score</th>
                        </tr>
                        </thead>
                        <tbody>
                        {playerScores.map((player, index) => (
                            <tr key={player.id} className={`${index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-650'} border-b border-gray-600 last:border-0`}>
                                <td className="py-3 px-4 text-left text-gray-100 font-medium">{index + 1}.</td>
                                <td className="py-3 px-4 text-left text-gray-100">{player.name}</td>
                                <td className="py-3 px-4 text-right text-yellow-300 font-bold text-xl">{player.score}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isHost && (
                <div className="mt-8 border-t border-gray-700 pt-6">
                    <h3 className="text-2xl font-bold mb-4 text-white">Host Controls:</h3>
                    {isReviewingScoreboard ? ( // --- NEW CONDITIONAL LOGIC ---
                        // Show "Resume Game" button if reviewing
                        <button
                            onClick={resumeCurrentGame}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                        >
                            Resume Game {currentGameNumber}
                        </button>
                    ) : (
                        // Show "Next Game" or "End Match" if ready to advance
                        currentGameNumber < totalGames ? (
                            <button
                                onClick={nextGame}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                            >
                                Next Game ({currentGameNumber + 1} / {totalGames})
                            </button>
                        ) : (
                            <button
                                onClick={nextGame} // This will trigger the 'finished' phase
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                            >
                                End Match & See Final Results
                            </button>
                        )
                    )}
                </div>
            )}
            {!isHost && (
                <p className="text-center text-gray-400 mt-6 text-lg">
                    Waiting for the host to proceed...
                </p>
            )}
        </div>
    );
}

export default Scoreboard;
