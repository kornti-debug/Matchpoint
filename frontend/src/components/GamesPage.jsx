// src/components/GamesPage.jsx
import React, { useEffect, useState } from 'react';
import * as apiService from '../services/apiService'; // Import your apiService

function GamesPage() {
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGames = async () => {
            try {
                const gamesData = await apiService.getAllGames();

                console.log('GamesPage: Data received from API Service:', gamesData);

                setGames(gamesData.games);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGames();
    }, []); // Empty dependency array means run once on mount

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full text-white text-xl">
                Loading Games...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-full text-red-500 text-xl">
                Error loading games: {error}
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 rounded">Retry</button>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-4xl border-2 border-orange-600">
            <h2 className="text-4xl font-bold mb-6 text-orange-400 text-center">Manage Games</h2>

            {games.length === 0 ? (
                <p className="text-gray-400 text-xl text-center">No games found. Time to add some!</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-700 rounded-lg shadow-md overflow-hidden">
                        <thead className="bg-gray-600">
                        <tr>
                            <th className="py-3 px-4 text-left text-lg font-semibold text-gray-200">#</th>
                            <th className="py-3 px-4 text-left text-lg font-semibold text-gray-200">Title</th>
                            <th className="py-3 px-4 text-left text-lg font-semibold text-gray-200">Description</th>
                            <th className="py-3 px-4 text-right text-lg font-semibold text-gray-200">Points</th>
                            {/* Add Actions column here later for Edit/Delete buttons */}
                            <th className="py-3 px-4 text-center text-lg font-semibold text-gray-200">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {games.map((game, index) => (
                            <tr key={game.id} className={`${index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-650'} border-b border-gray-600 last:border-0`}>
                                <td className="py-3 px-4 text-left text-gray-100 font-medium">{game.game_number}</td>
                                <td className="py-3 px-4 text-left text-gray-100">{game.title}</td>
                                <td className="py-3 px-4 text-left text-gray-300 text-sm">{game.description}</td>
                                <td className="py-3 px-4 text-right text-orange-300 font-bold">{game.points_value}</td>
                                <td className="py-3 px-4 text-center">
                                    {/* Edit/Delete buttons will go here later */}
                                    <button disabled className="bg-gray-500 text-white py-1 px-3 rounded-md text-sm">Manage</button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default GamesPage;