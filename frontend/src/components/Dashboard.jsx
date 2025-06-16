// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as apiService from '../services/apiService.js';

function Dashboard() {
    const [matchName, setMatchName] = useState('');
    const [message, setMessage] = useState('');
    const [roomCodeInput, setRoomCodeInput] = useState('');
    const [isCreatingMatch, setIsCreatingMatch] = useState(false);
    const [isJoiningMatch, setIsJoiningMatch] = useState(false); // New state for join button loading
    const navigate = useNavigate();

    // State for game selection
    const [availableGames, setAvailableGames] = useState([]);
    const [selectedGameIds, setSelectedGameIds] = useState([]); // This will store the ordered IDs
    const [loadingGames, setLoadingGames] = useState(true);
    const [gamesError, setGamesError] = useState('');

    // Fetch all available games on component mount
    useEffect(() => {
        const fetchGames = async () => {
            setLoadingGames(true);
            setGamesError('');
            try {
                const responseData = await apiService.getAllGames();
                const games = responseData.games; // <--- This line extracts the actual array
                // Filter out any games that might have invalid IDs or duplicate game_numbers if necessary
                setAvailableGames(games.sort((a, b) => a.game_number - b.game_number)); // Sort by game_number for display
            } catch (err) {
                setGamesError(err.message || 'Failed to load available games.');
                console.error('Error fetching available games:', err);
            } finally {
                setLoadingGames(false);
            }
        };
        fetchGames();
    }, []); // Empty dependency array means run once on mount

    const handleCreateMatch = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        if (!matchName.trim()) {
            setMessage('Match name cannot be empty.');
            return;
        }
        if (selectedGameIds.length === 0) {
            setMessage('Please select at least one game for the match.');
            return;
        }

        setIsCreatingMatch(true);
        setMessage('');

        try {
            const result = await apiService.createMatch(matchName, selectedGameIds); // Pass selectedGameIds
            setMessage(`Match created! Room Code: ${result.roomCode}`);
            setMatchName('');
            setSelectedGameIds([]); // Clear selected games
            navigate(`/match/${result.roomCode}/host`); // Navigate to host lobby
        } catch (error) {
            console.error("Error creating match:", error);
            setMessage(`Failed to create match: ${error.message}`);
        } finally {
            setIsCreatingMatch(false);
        }
    };

    const handleJoinMatch = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior

        if (!roomCodeInput.trim()) {
            setMessage('Room code cannot be empty.');
            return;
        }

        setIsJoiningMatch(true);
        setMessage('');

        try {
            // No need for a separate join API call here, just navigate
            // The MatchController will handle fetching details and joining player
            navigate(`/match/${roomCodeInput.trim()}/player`);
        } catch (error) {
            console.error("Error joining match:", error);
            setMessage(`Failed to join match: ${error.message}`);
        } finally {
            setIsJoiningMatch(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-4">
            {message && (
                <div className={`p-4 mb-4 rounded-lg text-center ${message.includes('Failed') ? 'bg-red-500' : 'bg-green-500'} text-white`}>
                    {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
                {/* Create New Match Section */}
                <div className="bg-gray-800 p-8 rounded-xl shadow-lg border-2 border-blue-600 flex flex-col justify-between">
                    <h2 className="text-4xl font-bold mb-6 text-blue-400 text-center">Create New Match</h2>
                    <form onSubmit={handleCreateMatch} className="flex flex-col flex-grow">
                        <div className="mb-4">
                            <label htmlFor="matchName" className="block text-lg font-medium text-gray-300 mb-2">Match Name:</label>
                            <input
                                type="text"
                                id="matchName"
                                value={matchName}
                                onChange={(e) => setMatchName(e.target.value)}
                                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., The Ultimate Showdown"
                                required
                            />
                        </div>

                        {/* Game Selection UI */}
                        <div className="mb-6 flex-grow flex flex-col">
                            <h3 className="text-xl font-medium text-gray-300 mb-3">Select Games for this Match (Order Matters!):</h3>
                            {loadingGames ? (
                                <p className="text-gray-400">Loading games...</p>
                            ) : gamesError ? (
                                <p className="text-red-400">Error: {gamesError}</p>
                            ) : (
                                <div className="border border-gray-700 rounded-lg p-4 max-h-80 overflow-y-auto bg-gray-700">
                                    <p className="text-gray-400 text-sm mb-2">Selected Games ({selectedGameIds.length} / 15 Max):</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {selectedGameIds.length === 0 ? (
                                            <p className="text-gray-500 text-sm">No games selected. Add from below.</p>
                                        ) : (
                                            selectedGameIds.map((gameId, index) => {
                                                const game = availableGames.find(g => g.id === gameId);
                                                return game ? (
                                                    <span key={game.id} className="flex items-center bg-blue-600 text-white text-sm px-3 py-1 rounded-full shadow-md">
                                                        {index + 1}. {game.title}
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedGameIds(prev => prev.filter(id => id !== game.id))}
                                                            className="ml-2 text-white hover:text-red-200 text-xl font-bold leading-none focus:outline-none"
                                                            title="Remove from sequence"
                                                        >
                                                            &times;
                                                        </button>
                                                    </span>
                                                ) : null;
                                            })
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-sm mb-2">Available Games:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {availableGames.map(game => (
                                            <button
                                                key={game.id}
                                                type="button"
                                                onClick={() => {
                                                    if (!selectedGameIds.includes(game.id) && selectedGameIds.length < 15) {
                                                        setSelectedGameIds(prev => [...prev, game.id]);
                                                    }
                                                }}
                                                disabled={selectedGameIds.includes(game.id) || selectedGameIds.length >= 15}
                                                className={`p-2 rounded-lg text-left shadow-sm transition duration-200
                                                    ${selectedGameIds.includes(game.id) ? 'bg-green-700 text-white cursor-not-allowed' : 'bg-gray-600 text-gray-200 hover:bg-gray-500'}
                                                    ${selectedGameIds.length >= 15 && !selectedGameIds.includes(game.id) ? 'opacity-50 cursor-not-allowed' : ''}
                                                    `}
                                            >
                                                {game.title} (Game No. {game.game_number})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isCreatingMatch || selectedGameIds.length === 0}
                            className={`w-full text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105
                                ${isCreatingMatch || selectedGameIds.length === 0 ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isCreatingMatch ? 'Creating Match...' : 'Create Match'}
                        </button>
                    </form>
                </div>

                {/* Join Existing Match Section */}
                <div className="bg-gray-800 p-8 rounded-xl shadow-lg border-2 border-green-600 flex flex-col justify-between">
                    <h2 className="text-4xl font-bold mb-6 text-green-400 text-center">Join Existing Match</h2>
                    <form onSubmit={handleJoinMatch} className="flex flex-col flex-grow">
                        <div className="mb-4">
                            <label htmlFor="roomCode" className="block text-lg font-medium text-gray-300 mb-2">Room Code:</label>
                            <input
                                type="text"
                                id="roomCode"
                                value={roomCodeInput}
                                onChange={(e) => setRoomCodeInput(e.target.value)}
                                className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., ABCDEF"
                                maxLength="6"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isJoiningMatch || !roomCodeInput.trim()}
                            className={`w-full text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 transform hover:scale-105
                                ${isJoiningMatch || !roomCodeInput.trim() ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                        >
                            {isJoiningMatch ? 'Joining Match...' : 'Join Match'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
