// src/components/GamesPage.jsx
import React, { useEffect, useState } from 'react';
import * as apiService from '../services/apiService';
import {Link} from "react-router-dom"; // Import your apiService

function GamesPage() {
    const [games, setGames] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        fetchGames();
    }, []); // Empty dependency array means run once on mount

    const handleDelete = async (gameId, gameTitle) => {
        if (window.confirm(`Are you sure you want to delete "${gameTitle}"? This cannot be undone.`)) {
            try {
                await apiService.deleteGame(gameId);
                // On successful deletion, refresh the list of games
                await fetchGames();
                console.log(`Game ${gameTitle} deleted successfully.`);
                // Optionally, show a success message to the user
            } catch (err) {
                console.error('Error deleting game:', err);
                setError(err.message || 'Failed to delete game.');
                // Optionally, show an error message to the user
            }
        }
    };

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

            {/* --- NEW "CREATE NEW GAME" BUTTON --- */}
            <div className="flex justify-end mb-4">
                <Link to="/dashboard/games/new" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300">
                    Create New Game
                </Link>
            </div>
            {/* --- END NEW BUTTON --- */}

            {Array.isArray(games) && games.length === 0 ? (
                <p className="text-gray-400 text-xl text-center">No games found. Time to add some!</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-700 rounded-lg shadow-md overflow-hidden">
                        <thead className="bg-gray-600">
                        <tr>
                            {/* ... table headers ... */}
                            <th className="py-3 px-4 text-center text-lg font-semibold text-gray-200">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {Array.isArray(games) && games.map((game, index) => (
                            <tr key={game.id} className={`${index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-650'} border-b border-gray-600 last:border-0`}>
                                <td className="py-3 px-4 text-left text-gray-100 font-medium">{game.game_number}</td>
                                <td className="py-3 px-4 text-left text-gray-100">{game.title}</td>
                                <td className="py-3 px-4 text-left text-gray-300 text-sm">{game.description}</td>
                                <td className="py-3 px-4 text-right text-orange-300 font-bold">{game.points_value}</td>
                                <td className="py-3 px-4 text-center">
                                    <Link
                                        to={`/dashboard/games/${game.id}`}
                                        className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md text-sm transition duration-300"
                                    >
                                        View
                                    </Link>
                                    <Link
                                        to={`/dashboard/games/${game.id}/edit`}
                                        className="bg-purple-600 hover:bg-purple-700 text-white py-1 px-3 rounded-md text-sm ml-2 transition duration-300"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(game.id, game.title)}
                                        className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md text-sm ml-2 transition duration-300"
                                    >
                                        Delete
                                    </button>
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