// src/components/GameFormPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as apiService from '../services/apiService';

function GameFormPage({ type }) { // 'type' will be 'new' or 'edit'
    const { gameId } = useParams(); // Only available if type is 'edit'
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [gameNumber, setGameNumber] = useState(''); // Use string for input, convert to number for API
    const [pointsValue, setPointsValue] = useState(''); // Use string for input, convert to number for API

    const [isLoading, setIsLoading] = useState(type === 'edit'); // Load if editing
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const fetchGame = async () => {
            if (type === 'edit' && gameId) {
                setIsLoading(true);
                setError(null);
                try {
                    const gameData = await apiService.getGameData(gameId);
                    setTitle(gameData.title);
                    setDescription(gameData.description);
                    setGameNumber(gameData.game_number.toString()); // Convert number to string for input value
                    setPointsValue(gameData.points_value.toString()); // Convert number to string
                } catch (err) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            } else if (type === 'new') {
                setIsLoading(false); // No data to fetch for new game
            }
        };

        fetchGame();
    }, [type, gameId]); // Re-run if type or gameId changes

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        // Basic validation
        if (!title || !description || !gameNumber || !pointsValue) {
            setError('All fields are required.');
            setIsSubmitting(false);
            return;
        }
        if (isNaN(parseInt(gameNumber, 10)) || isNaN(parseInt(pointsValue, 10))) {
            setError('Game Number and Points Value must be valid numbers.');
            setIsSubmitting(false);
            return;
        }

        const gameData = {
            title,
            description,
            game_number: parseInt(gameNumber, 10),
            points_value: parseInt(pointsValue, 10),
        };

        try {
            if (type === 'new') {
                await apiService.createGame(gameData);
                setSuccessMessage('Game created successfully!');
                navigate('/dashboard/games'); // Redirect to games list
            } else if (type === 'edit') {
                await apiService.updateGame(gameId, gameData);
                setSuccessMessage('Game updated successfully!');
                navigate(`/dashboard/games/${gameId}`); // Redirect to detail page
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full text-white text-xl">
                Loading Game Form...
            </div>
        );
    }

    return (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-xl border-2 border-blue-600 mx-auto">
            <h2 className="text-4xl font-bold mb-6 text-blue-400 text-center">
                {type === 'new' ? 'Create New Game' : 'Edit Game'}
            </h2>

            {successMessage && (
                <div className="bg-green-500 text-white p-3 rounded-md mb-4 text-center">
                    {successMessage}
                </div>
            )}
            {error && (
                <div className="bg-red-500 text-white p-3 rounded-md mb-4 text-center">
                    Error: {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-lg font-medium text-gray-300">Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Guess the Object"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-lg font-medium text-gray-300">Description</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows="4"
                        className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Detailed rules or context for the game..."
                        required
                    ></textarea>
                </div>
                <div>
                    <label htmlFor="gameNumber" className="block text-lg font-medium text-gray-300">Game Number</label>
                    <input
                        type="number"
                        id="gameNumber"
                        value={gameNumber}
                        onChange={(e) => setGameNumber(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 1, 2, 3..."
                        min="1"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="pointsValue" className="block text-lg font-medium text-gray-300">Points Value</label>
                    <input
                        type="number"
                        id="pointsValue"
                        value={pointsValue}
                        onChange={(e) => setPointsValue(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 10, 20, 50"
                        min="1"
                        required
                    />
                </div>

                <div className="flex justify-center gap-4 mt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`flex-grow text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105
                            ${isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isSubmitting ? 'Saving...' : (type === 'new' ? 'Create Game' : 'Save Changes')}
                    </button>
                    <button
                        type="button" // Important: type="button" prevents form submission
                        onClick={() => navigate('/dashboard/games')}
                        className="flex-grow bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default GameFormPage;