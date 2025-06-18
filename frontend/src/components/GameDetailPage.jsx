// src/components/GameDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Added Link and useNavigate
import * as apiService from '../services/apiService';

function GameDetailPage() {
    const { gameId } = useParams(); // Get the ID from the URL
    const navigate = useNavigate(); // For potential back button or redirection

    const [game, setGame] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGame = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const gameData = await apiService.getGameData(gameId);
                setGame(gameData);
            } catch (err) {
                setError(err.message);
                console.error('GameDetailPage: Error fetching game:', err);
            } finally {
                setIsLoading(false);
            }
        };

        if (gameId) { // Only fetch if gameId exists
            fetchGame();
        }
    }, [gameId]); // Re-run effect if gameId changes

    const handleDelete = async () => {
        if (!game) return; // Don't try to delete if game data isn't loaded
        if (window.confirm(`Are you sure you want to delete "${game.title}"? This action cannot be undone.`)) {
            try {
                await apiService.deleteGame(game.id);
                console.log(`Game "${game.title}" deleted successfully.`);
                navigate('/dashboard/games', { replace: true }); // Redirect to list after deletion
            } catch (err) {
                console.error('Error deleting game:', err);
                setError(err.message || 'Failed to delete game.');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full text-white text-xl">
                Loading Game Details...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-full text-red-500 text-xl">
                Error: {error}
                <button onClick={() => navigate('/dashboard/games')} className="mt-4 px-4 py-2 bg-blue-600 rounded">Back to Games List</button>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="flex justify-center items-center h-full text-white text-xl">
                Game not found.
                <button onClick={() => navigate('/dashboard/games')} className="mt-4 px-4 py-2 bg-blue-600 rounded">Back to Games List</button>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-2xl border-2 border-blue-600 mx-auto">
            <h2 className="text-4xl font-bold mb-4 text-blue-400 text-center">Game Details</h2>
            <div className="text-left space-y-3">
                <p className="text-lg text-gray-300"><span className="font-semibold text-white">ID:</span> {game.id}</p>
                <p className="text-lg text-gray-300"><span className="font-semibold text-white">Title:</span> {game.title}</p>
                <p className="text-lg text-gray-300"><span className="font-semibold text-white">Description:</span> {game.description}</p>
                <p className="text-lg text-gray-300"><span className="font-semibold text-white">Game Number:</span> {game.game_number}</p>
                <p className="text-lg text-gray-300"><span className="font-semibold text-white">Points Value:</span> {game.points_value}</p>
            </div>

            <div className="flex justify-center gap-4 mt-8 border-t border-gray-700 pt-6">
                {/* Placeholder buttons for future functionality */}
                <Link to={`/dashboard/games/${game.id}/edit`} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                    Edit Game
                </Link>
                <button
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                    Delete Game
                </button>
                <button
                    onClick={() => navigate('/dashboard/games')}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
                >
                    Back to List
                </button>
            </div>
        </div>
    );
}

export default GameDetailPage;