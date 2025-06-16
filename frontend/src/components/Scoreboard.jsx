// src/components/Scoreboard.jsx
import React from 'react';
import * as apiService from '../services/apiService.js'; // Import apiService for resumeCurrentGame

function Scoreboard({ roomCode, matchState, isHost, nextGame, isReviewingScoreboard, setMatchState }) {
    const { players, totalGames, matchDetails } = matchState;
    const currentGameIndex = matchDetails.current_game_number; // This is the 0-based index

    const playerScores = players.map(player => ({
        ...player,
        score: player.total_score || 0
    })).sort((a, b) => b.score - a.score);

    const resumeCurrentGame = async () => {
        if (!isHost) return;

        try {
            // Get the actual game ID from the sequence using the current game index
            const gameSequence = matchState.matchDetails.game_sequence;
            if (!gameSequence || gameSequence.length === 0 || currentGameIndex >= gameSequence.length) {
                console.error("Cannot resume game: Invalid game sequence or index.");
                // Optionally set an error state in MatchController
                return;
            }
            const gameIdToResume = gameSequence[currentGameIndex];
            const game = await apiService.getGameData(gameIdToResume); // Call with the ID

            setMatchState(prev => ({
                ...prev,
                phase: 'game',          // Go back to game phase
                gameData: game          // Load current game data
            }));
            console.log('Host: Resuming current game.');
        } catch (error) {
            console.error('Failed to resume current game:', error);
            setMatchState(prev => ({ ...prev, error: `Failed to resume game: ${error.message}` }));
        }
    };

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
                    {isReviewingScoreboard ? (
                        <button
                            onClick={resumeCurrentGame}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                        >
                            {/* --- FIX 2: Display currentGameIndex + 1 --- */}
                            Resume Game {currentGameIndex + 1}
                        </button>
                    ) : (
                        currentGameIndex + 1 < totalGames ? ( // --- FIX 3: Check against totalGames (length of sequence) ---
                            <button
                                onClick={nextGame}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105"
                            >
                                {/* --- FIX 4: Display current+1 / total --- */}
                                Next Game ({currentGameIndex + 1 + 1} / {totalGames})
                            </button>
                        ) : (
                            <button
                                onClick={nextGame}
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
