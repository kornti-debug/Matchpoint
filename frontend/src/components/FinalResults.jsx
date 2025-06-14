// components/FinalResults.jsx
import React from 'react';

function FinalResults({ matchState }) {
    const { scores, players, matchDetails } = matchState;

    // Calculate final player scores and sort them
    const finalPlayerScores = players.map(player => ({
        ...player,
        score: scores[player.id] || 0
    })).sort((a, b) => b.score - a.score); // Sort by score descending

    const winner = finalPlayerScores.length > 0 ? finalPlayerScores[0] : null;

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-2xl text-center border-2 border-gold-500">
            <h2 className="text-5xl font-extrabold mb-4 text-gold-400">Match Over!</h2>
            <h3 className="text-3xl font-bold mb-6 text-white">{matchDetails.matchname}</h3>

            {winner && (
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-lg shadow-xl mb-8 transform hover:scale-105 transition duration-300">
                    <p className="text-white text-3xl font-bold">The Champion is:</p>
                    <p className="text-white text-5xl font-extrabold mt-2 tracking-wide">{winner.name}!</p>
                    <p className="text-white text-2xl mt-2">With a grand total of <span className="text-yellow-900 font-extrabold">{winner.score} points!</span></p>
                </div>
            )}

            <h4 className="text-2xl font-bold mb-4 text-white">Final Standings:</h4>
            {finalPlayerScores.length === 0 ? (
                <p className="text-gray-400 text-xl">No final scores to display.</p>
            ) : (
                <div className="overflow-x-auto mb-6">
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
                                <td className="py-3 px-4 text-right text-gold-300 font-bold text-xl">{player.score}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            <p className="text-gray-400 mt-8">Thank you for playing!</p>
        </div>
    );
}

export default FinalResults;
