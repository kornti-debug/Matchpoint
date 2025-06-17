// components/Scoreboard.jsx
import React from 'react';

function Scoreboard({ roomCode, matchState, isHost, nextGame, isReviewingScoreboard }) {
    const { players, scores, totalGames, currentGame, matchDetails } = matchState;

    // Sort players by total score in descending order
    const sortedPlayers = [...players].sort((a, b) => {
        const scoreA = scores[a.id] !== undefined ? scores[a.id] : a.total_score;
        const scoreB = scores[b.id] !== undefined ? scores[b.id] : b.total_score;
        return scoreB - scoreA;
    });

    // Check if the current game is the last one in the sequence
    const isLastGameInSequence = (currentGame + 1) >= totalGames;

    // Determine button text based on game progress
    let buttonText = "Next Game";
    if (isLastGameInSequence) {
        buttonText = "View Final Results";
    }

    // Determine if the "Next Game" or "View Final Results" button should be disabled
    // It should be disabled if it's not the host, or if it's currently loading, etc.
    const isNextGameButtonDisabled = !isHost || matchState.isLoading; // Disable if not host or loading

    // If it's a player, they don't have these controls
    if (!isHost && matchDetails.status === 'in_progress') {
        return (
            <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-2xl text-center border-2 border-blue-600">
                <h2 className="text-4xl font-bold mb-4 text-blue-400">Scoreboard - Game {currentGame + 1}</h2>
                <p className="text-xl text-gray-300 mb-6">Waiting for host to start next game...</p>
                <div className="mb-8">
                    <h3 className="text-2xl font-semibold mb-3 text-white">Current Scores:</h3>
                    {sortedPlayers.length === 0 ? (
                        <p className="text-gray-400">No players with scores yet.</p>
                    ) : (
                        <ul className="space-y-2">
                            {sortedPlayers.map(player => (
                                <li key={player.id} className="bg-gray-700 p-3 rounded-lg shadow-sm flex justify-between items-center">
                                    <span className="text-gray-200 text-lg font-medium">{player.name}</span>
                                    <span className="text-yellow-300 text-xl font-bold">{scores[player.id] || 0} pts</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-2xl text-center border-2 border-blue-600">
            <h2 className="text-4xl font-bold mb-4 text-blue-400">Scoreboard - Game {currentGame + 1}</h2>
            <p className="text-xl text-gray-300 mb-6">Match Code: <span className="font-mono text-blue-300 text-2xl bg-gray-700 p-2 rounded-md tracking-wider">{roomCode}</span></p>

            <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-3 text-white">Current Scores:</h3>
                {sortedPlayers.length === 0 ? (
                    <p className="text-gray-400">No players with scores yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {sortedPlayers.map(player => (
                            <li key={player.id} className="bg-gray-700 p-3 rounded-lg shadow-sm flex justify-between items-center">
                                <span className="text-gray-200 text-lg font-medium">{player.name}</span>
                                <span className="text-yellow-300 text-xl font-bold">{scores[player.id] || 0} pts</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {isHost && (
                <button
                    onClick={nextGame} // This calls the nextGame function passed from MatchController
                    disabled={isNextGameButtonDisabled}
                    className={`w-full text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 transform hover:scale-105
                        ${isNextGameButtonDisabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                    {buttonText}
                </button>
            )}
        </div>
    );
}

export default Scoreboard;
