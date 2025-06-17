// src/components/FinalResults.jsx
import React from 'react';

function FinalResults({ roomCode, matchState, isHost }) {
    const { matchDetails, players, scores } = matchState;

    // Sort players by their final score to display a ranked list
    const finalPlayerScores = players
        .map(player => ({
            ...player,
            score: scores[player.id] || 0 // Use the score from the scores object
        }))
        .sort((a, b) => b.score - a.score); // Sort descending by score

    // Find the winner's name using the winner_id from matchDetails
    const winnerPlayer = matchDetails.winner_id
        ? finalPlayerScores.find(player => player.user_id === matchDetails.winner_id)
        : null;

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-2xl text-center border-2 border-purple-600">
            <h2 className="text-4xl font-bold mb-6 text-purple-400">Match Concluded!</h2>

            {winnerPlayer ? (
                <div className="mb-8 p-4 bg-purple-700 rounded-lg shadow-md">
                    <h3 className="text-3xl font-extrabold text-white">🏆 Overall Winner 🏆</h3>
                    <p className="text-5xl font-extrabold text-yellow-300 mt-2">
                        {winnerPlayer.name}
                    </p>
                    <p className="text-xl text-white">with {winnerPlayer.score} points!</p>
                </div>
            ) : (
                <p className="text-gray-300 text-xl mb-8">No winner determined (or match not fully played).</p>
            )}

            <h3 className="text-2xl font-bold mb-4 text-white">Final Scoreboard:</h3>
            {finalPlayerScores.length === 0 ? (
                <p className="text-gray-400 text-xl">No scores to display.</p>
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
                        {finalPlayerScores.map((player, index) => (
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
                    <button
                        onClick={() => { /* Implement navigation back to dashboard or match list */ }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
                    >
                        Back to Dashboard
                    </button>
                </div>
            )}
            {!isHost && (
                <p className="text-center text-gray-400 mt-6 text-lg">
                    The match has concluded.
                </p>
            )}
        </div>
    );
}

export default FinalResults;
